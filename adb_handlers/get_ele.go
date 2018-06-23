// jasonxu-2018/6/16
package adb_handlers

import (
	"os"
	"fmt"
	"net/http"
	"io/ioutil"
	"encoding/json"

	"github.com/Jason916/xml2json"
	"github.com/Jason916/peanut_core/log"
	peanutJson "github.com/Jason916/peanut_core/json"
	"github.com/Jason916/peanut-app-inspector/adb-dev/adb"
)

type GetElementHandler struct{}

func NewGetElementHandler() *GetElementHandler {
	return &GetElementHandler{}
}

type ChildrenSource struct {
	Node struct {
		Index         string            `json:"index"`
		ResourceId    string            `json:"resource-id"`
		Class         string            `json:"class"`
		Package       string            `json:"package"`
		ContentDesc   string            `json:"content-desc"`
		Checkable     string            `json:"checkable"`
		Checked       string            `json:"checked"`
		Clickable     string            `json:"clickable"`
		Enabled       string            `json:"enabled"`
		Focusable     string            `json:"focusable"`
		Focused       string            `json:"focused"`
		Scrollable    string            `json:"scrollable"`
		LongClickable string            `json:"long-clickable"`
		Password      string            `json:"password"`
		Selected      string            `json:"selected"`
		Bounds        string            `json:"bounds"`
		Text          string            `json:"text"`
		ChildrenKey   []*ChildrenSource `json:"ChildrenKey"`
	} `json:"node"`
}

type JsonSource struct {
	Hierarchy struct {
		ChildrenKey []*ChildrenSource `json:"ChildrenKey"`
		Rotation    string            `json:"rotation"`
	} `json:"hierarchy"`
}

var result = make(map[string]string)

func getSourceMap(using string, source []*ChildrenSource) (res map[string]string) {
	if len(source) > 0 {
		for i, item := range source {
			switch using {
			case "resource-id":
				if source[i].Node.ResourceId != "" {
					result[source[i].Node.ResourceId] = source[i].Node.Bounds
				}
			case "content-desc":
				if source[i].Node.ContentDesc != "" {
					result[source[i].Node.ContentDesc] = source[i].Node.Bounds
				}
			case "text":
				if source[i].Node.Text != "" {
					result[source[i].Node.Text] = source[i].Node.Bounds
				}
			default:
				fmt.Printf("using: %v is not supported", using)
			}

			getSourceMap(using, item.Node.ChildrenKey)
		}
	}
	return result
}

func (*GetElementHandler) findEle(using, value string) (elementInfo string, err error) {
	var source *JsonSource

	createJsonFile()
	JsonFilePath := adb.TempPath + "android.json"
	res := readXmlFile(JsonFilePath)
	err = json.Unmarshal([]byte(res), &source)
	if err != nil {
		log.Warning("err was: ", err.Error())
	}

	r := getSourceMap(using, source.Hierarchy.ChildrenKey)

	return r[value], err
}

func readXmlFile(path string) string {
	f, err := ioutil.ReadFile(path)
	if err != nil {
		fmt.Printf("%s\n", err)
		panic(err)
	}
	return string(f)
}

func createJsonFile() {
	var err error = nil
	adb.MkDirIfNotExist(adb.TempPath)
	UIXmlPath := adb.TempPath + "uidump.xml"
	in, err := os.Open(UIXmlPath)
	if err != nil {
		log.Warning("open xml file failed", err)
	}
	defer in.Close()

	JsonFilePath := adb.TempPath + "android.json"
	out, err := os.Create(JsonFilePath)
	if err != nil {
		log.Warning("create json file failed", err)
		os.Exit(-1)
	}
	defer out.Close()

	var x2j = xml2json.NewXml2Json("TextKey", "ChildrenKey")
	err = x2j.Transform(in, out)
}

func (h *GetElementHandler) getElementInfo(using string, value string) (elementInfo string, err error) {
	elementInfo, err = h.findEle(using, value)
	if err != nil {
		return "", err
	}
	return elementInfo, err
}

func (h *GetElementHandler) ServeHTTP(resp http.ResponseWriter, req *http.Request) {
	elementInfo, err := h.getElementInfo(req.FormValue("using"), req.FormValue("value"))
	if err != nil {
		log.Warning(err.Error())
		peanutJson.Json(resp, http.StatusInternalServerError, peanutJson.NewErrorMsg(err.Error()))
		return
	}
	if adb.GetSDKVersion() == 21 {
		peanutJson.Json(resp, http.StatusTeapot, peanutJson.NewErrorMsg("search eleInfo is not supported when SDK is 21"))
		return
	}
	if elementInfo != "" {
		peanutJson.Json(resp, http.StatusOK, elementInfo)
		return
	} else {
		peanutJson.Json(resp, http.StatusBadRequest, peanutJson.NewErrorMsg("element can not be found"))
		return
	}

}
