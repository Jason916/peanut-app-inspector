//jasonxu-2018/1/15
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
		dumpCommand := fmt.Sprintf("adb -s %s shell uiautomator dump /sdcard/uidump.xml", deviceId)
		err = exec.Command("sh", "-c", dumpCommand).Run()
		if err != nil {
			return nil, err
		}
		MkDirIfNotExist(tempPath)
		UIXmlPath := tempPath + "uidump.xml"
		pullFileCommand := fmt.Sprintf("adb -s %s pull /sdcard/uidump.xml %s", deviceId, UIXmlPath)
		err = exec.Command("sh", "-c", pullFileCommand).Run()
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
		isAlive := IsServerStillAlive("com.github.uiautomator")
		url := "http://localhost:9008/jsonrpc/0"
		data := "{\"params\": [false, null], \"jsonrpc\": \"2.0\",\"method\": \"dumpWindowHierarchy\",\"id\": \"1\"}"
		if !isAlive {
			StartRPCServer()
			time.Sleep(time.Second * 40)
		}

		res := PostReq(url, data)
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
	getSDKCommand := fmt.Sprintf("adb -s %s shell getprop ro.build.version.sdk", deviceId)
	cmd := exec.Command("sh", "-c", getSDKCommand)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return -1
	}
	v := strings.TrimSpace(string(out))
	version, err := strconv.Atoi(v)
	return version
}

func StartRPCServer() (info string, err error) {
	getUiautomatorCommand := fmt.Sprintf("adb -s %s shell pm list packages com.github.uiautomator", deviceId)
	unInstallUCommand := fmt.Sprintf("adb -s %s shell pm uninstall com.github.uiautomator", deviceId)
	unInstallUTestCommand := fmt.Sprintf("adb -s %s shell pm uninstall com.github.uiautomator.test", deviceId)
	startServerCommand := fmt.Sprintf("adb forward tcp:9008 tcp:9008 && cd adb-dev/android-uiautomator-server/ && ./gradlew cC")
	cmd := exec.Command("sh", "-c", getUiautomatorCommand)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", err
	}
	packageList := string(out)
	isInstalledU := strings.Contains(packageList, "com.github.uiautomator")
	isInstalledUTest := strings.Contains(packageList, "com.github.uiautomator.test")
	if isInstalledU {
		err = exec.Command("sh", "-c", unInstallUCommand).Run()
		if err != nil {
			return "uninstall com.github.uiautomator failed", err
		}
	}
	if isInstalledUTest {
		err = exec.Command("sh", "-c", unInstallUTestCommand).Run()
		if err != nil {
			return "uninstall com.github.uiautomator.test failed", err
		}
	}
	err = exec.Command("sh", "-c", startServerCommand).Start()
	if err != nil {
		return "start server failed", err
	}
	return
}

func IsServerStillAlive(packageName string) bool {
	getPidCommand := fmt.Sprintf("adb -s %s shell ps | grep %s", deviceId, packageName)
	cmd := exec.Command("sh", "-c", getPidCommand)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return false
	}
	alive := strings.Contains(string(out), packageName)
	return alive
}

func PostReq(url string, data string) (res []byte) {
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
