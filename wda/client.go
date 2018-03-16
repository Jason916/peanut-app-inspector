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
	"github.com/Jason916/peanut_core/log"
	//"path/filepath"
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
	time.Sleep(time.Second * 2)
}

func StartWDA(udid string){
	c := exec.Command("xcodebuild",
		"-verbose",
		"-project", "WebDriverAgent.xcodeproj",
		"-scheme", "WebDriverAgentRunner",
		"-destination", "id=" + udid, "test")
	//c.Dir, _ = filepath.Abs("../vendor/github.com/Jason916/WebDriverAgent")
	if err := c.Start(); err != nil {
		log.Warning("start wda failed", err)
	}
	//if err := c.Wait(); err != nil{
	//	log.Warning("command complete failed", err)
	//}
//	//xcodebuild -project WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner -destination "id=70c8b50723e361170dbbec2d158d395bfb6e849d" test
}