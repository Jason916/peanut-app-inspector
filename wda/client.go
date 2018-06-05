// jasonxu-2017/10/12
package wda

import (
	"net/http"
	"errors"
	"io/ioutil"
	"bytes"
	"fmt"
	"time"
	"os/exec"
	"path/filepath"
	"strings"
	"strconv"

	"github.com/Jason916/peanut_core/log"
	"github.com/Jason916/peanut-app-inspector/adb-dev/adb"
)

const StatusOK = 0

type Client struct {
	ip   string
	port string
}

func NewClient(ip string, port string) *Client {
	return &Client{ip, port}
}

func (c *Client) getUrl(uri string) string {
	return "http://" + c.ip + ":" + c.port + uri
}

func (c *Client) getResp(resp *http.Response, err error) ([]byte, error) {
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("bad status code with status:" + resp.Status)
	}
	rb, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	return rb, nil
}

func (c *Client) get(uri string) ([]byte, error) {
	resp, err := http.Get(c.getUrl(uri))
	if err != nil {
		return nil, err
	}
	return c.getResp(resp, err)
}

func (c *Client) post(uri string, data []byte) ([]byte, error) {
	resp, err := http.Post(c.getUrl(uri), "application/json; charset=UTF-8", bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	return c.getResp(resp, err)
}

func StartIProxy(udid, port string) {
	iProxyCommand := fmt.Sprintf("iproxy %s 8200 %s", port, udid)
	err := exec.Command("sh", "-c", iProxyCommand).Start()
	if err != nil {
		log.Warning("start iProxy failed", err)
		return
	}
	time.Sleep(time.Second * 10)
}

func uninstallWDA(udid string) bool {
	Command := fmt.Sprintf("ideviceinstaller -u %s -l | grep WDARunner-Runner | wc -l", udid)
	UninstallCommand := fmt.Sprintf("ideviceinstaller -U com.apple.test.WDARunner-Runner -o %s", udid)
	cmd := exec.Command("sh", "-c", Command)
	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Warning("ideviceinstaller failed, check if ideviceinstaller is installed correctly", err)
	}
	c := strings.TrimSpace(string(out))
	count, err := strconv.Atoi(c)
	if count > 0 {
		ucmd := exec.Command("sh", "-c", UninstallCommand)
		out, err := ucmd.CombinedOutput()
		if err != nil {
			log.Warning("uninstall com.apple.test.WDARunner-Runner failed", err)
			return false
		}
		log.Info("info:", string(out))
	}
	return true
}

func StartWDA(udid, ihost, iport string, isRealiOSDevice bool) {
	Command := fmt.Sprintf("xcodebuild -project WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner -destination 'id=%s' test > WdaSetup.log 2>&1 &", udid)
	c := exec.Command("sh", "-c", Command)
	c.Dir, _ = filepath.Abs("./vendor/github.com/Jason916/WebDriverAgent")

	if err := c.Start(); err != nil {
		log.Error("start wda failed", err)
	}

	for i := 0; i < 5; i++ {
		if checkWdaStart(ihost, iport) {
			break
		}
		time.Sleep(time.Second * 3)
	}

	if err := c.Wait(); err != nil {
		log.Warning("command complete failed", err)
	}

	if !isRealiOSDevice {
		rc := exec.Command("sh", "-c", Command)
		rc.Dir, _ = filepath.Abs("./vendor/github.com/Jason916/WebDriverAgent")
		kc := exec.Command("sh", "-c", adb.KillAll("xcodebuild"))
		kc.Run()
		time.Sleep(time.Second * 3)
		if err := rc.Start(); err != nil {
			log.Error("start wda failed", err)
		}
		log.Success("app inspector started")
	}

}

func checkWdaStart(h, p string) bool {
	wdaLogPath := "./vendor/github.com/Jason916/WebDriverAgent/WdaSetup.log"
	cmd := exec.Command("sh", "-c", adb.GrepFileCommand("Successfully\\ wrote", wdaLogPath))
	sc := exec.Command("sh", "-c", adb.GrepFileCommand("ServerURLHere", wdaLogPath))
	out, err := cmd.CombinedOutput()
	if err != nil {
		return false
	}
	c := strings.TrimSpace(string(out))
	count, err := strconv.Atoi(c)
	if count > 0 {
		_, err := http.Get("http://" + h + ":" + p + "/status")
		if err != nil {
			log.Warning("get status failed,retrying")
		}
		out, err := sc.CombinedOutput()
		fmt.Println(string(out))
		if err != nil {
			return false
		}
		c := strings.TrimSpace(string(out))
		count, err := strconv.Atoi(c)
		if count > 0 {
			return true
		}
		log.Warning("make sure the developer is trusted in setting-General-Profiles & Device Management and try again")
	}
	return false
}
