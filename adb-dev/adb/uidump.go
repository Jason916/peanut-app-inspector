// jasonxu-2018/1/15
package adb

import (
	"os/exec"
	"fmt"
	"os"
	"strings"
	"bytes"
	"io/ioutil"
	"strconv"
	"net/http"
	"time"
	"github.com/Jason916/x2j"
	"github.com/Jason916/peanut_core/log"
	"github.com/tidwall/gjson"
	"github.com/bitly/go-simplejson"
)

func DumpUIXml() (jsonInfo *simplejson.Json, err error) {
	sdkVersion := GetSDKVersion()
	if sdkVersion != 21 {
		err = exec.Command("sh", "-c", dumpCommand("/sdcard/uidump.xml")).Run()
		if err != nil {
			return nil, err
		}
		MkDirIfNotExist(tempPath)
		UIXmlPath := tempPath + "uidump.xml"
		err = exec.Command("sh", "-c", pullFileCommand("/sdcard/uidump.xml", UIXmlPath)).Run()
		if err != nil {
			return nil, err
		}
		var jsonString string
		jsonString, err = Xml2json(UIXmlPath)
		jsonByte := []byte(jsonString)
		jsonBody, err := simplejson.NewJson(jsonByte)
		if err != nil {
			return nil, err
		}
		return jsonBody, nil
	} else {
		isAlive := isServerStillAlive("com.github.uiautomator")
		url := "http://localhost:9008/jsonrpc/0"
		data := "{\"params\": [false, null], \"jsonrpc\": \"2.0\",\"method\": \"dumpWindowHierarchy\",\"id\": \"1\"}"
		if !isAlive {
			startRPCServer()
			for i := 0; i < 60; i++ {
				// condition check
				if checkServerStart() && isServerStillAlive("com.github.uiautomator") {
					break
				}
				time.Sleep(time.Second * 2)
			}
		}

		res := postReq(url, data)
		result := gjson.Get(string(res), "result")
		r := bytes.NewReader([]byte(result.String()))

		jsonOut, err := x2j.ToJsonIndent(r, false)
		if err != nil {
			log.Warning("to json failed", err)
			return nil, err
		}
		jsonByte := []byte(jsonOut)
		jsonBody, err := simplejson.NewJson(jsonByte)
		if err != nil {
			return nil, err
		}
		return jsonBody, nil
	}
	return
}

func Xml2json(xmlFile string) (string, error) {
	xmlString, err := os.Open(xmlFile)
	if err != nil {
		log.Warning("open xml file failed", err)
		return "", err
	}
	jsonInfo, err := x2j.ToJsonIndent(xmlString, false)
	if err != nil {
		log.Warning("to json failed", err)
		return "", err
	}
	return jsonInfo, nil
}

func GetSDKVersion() (sdkVersion int) {
	cmd := exec.Command("sh", "-c", getSDKCommand())
	out, err := cmd.CombinedOutput()
	if err != nil {
		return -1
	}
	v := strings.TrimSpace(string(out))
	version, err := strconv.Atoi(v)
	return version
}

func startRPCServer() (info string, err error) {
	startServerCommand := fmt.Sprintf("adb forward tcp:9008 tcp:9008 && cd adb-dev/android-uiautomator-server/ && ./gradlew cC > setup.log 2>&1 &")
	cmd := exec.Command("sh", "-c", listPackagesCommand("com.github.uiautomator"))
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", err
	}
	packageList := string(out)
	isInstalledU := strings.Contains(packageList, "com.github.uiautomator")
	isInstalledUTest := strings.Contains(packageList, "com.github.uiautomator.test")
	if isInstalledU {
		err = exec.Command("sh", "-c", uninstallPackageCommand("com.github.uiautomator")).Run()
		if err != nil {
			return "uninstall com.github.uiautomator failed", err
		}
	}
	if isInstalledUTest {
		err = exec.Command("sh", "-c", uninstallPackageCommand("com.github.uiautomator.test")).Run()
		if err != nil {
			return "uninstall com.github.uiautomator.test failed", err
		}
	}
	c := exec.Command("sh", "-c", startServerCommand)
	if err := c.Start(); err != nil {
		log.Warning("start server failed", err)
	}
	if err := c.Wait(); err != nil {
		log.Warning("command complete failed", err)
	}
	return
}

func isServerStillAlive(packageName string) bool {
	cmd := exec.Command("sh", "-c", getPidCommand(packageName))
	cmd2 := exec.Command("sh", "-c", grepCommand("android-uiautomator-server"))
	out, err := cmd.CombinedOutput()
	if err != nil {
		return false
	}
	devicePidAlive := strings.Contains(string(out), packageName)
	out2, err := cmd2.CombinedOutput()
	if err != nil {
		return false
	}
	pidAlive := strings.Contains(string(out2), "GradleWrapperMain cC")
	alive := devicePidAlive && pidAlive
	return alive
}

func checkServerStart() bool {
	cmd := exec.Command("sh", "-c", grepFileCommand("connectedDebugAndroidTest", "./adb-dev/android-uiautomator-server/setup.log"))
	out, err := cmd.CombinedOutput()
	if err != nil {
		return false
	}
	c := strings.TrimSpace(string(out))
	count, err := strconv.Atoi(c)
	if count > 0 {
		return true
	}
	return false
}

func postReq(url string, data string) (res []byte) {
	var jsonStr = []byte(data)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	return body
}
