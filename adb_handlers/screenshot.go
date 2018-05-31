// jasonxu-2018/1/20
package adb_handlers

import (
	"net/http"

	"github.com/Jason916/peanut_core/log"
	"github.com/Jason916/peanut_core/json"
	"github.com/Jason916/peanut-app-inspector/adb-dev/adb"
)

type ScreenShotHandler struct {
}

type ScreenShotResp struct {
	ScreenImg string `json:"img"`
}

func NewScreenShotHandler() *ScreenShotHandler {
	return &ScreenShotHandler{}
}

func (h *ScreenShotHandler) screenShot() (imgInfo string, err error) {
	img, err := adb.ScreenCapture()
	if err != nil {
		log.Warning("screenShot failed, please check device id and current network")
		return
	}
	return img, nil
}

func (h *ScreenShotHandler) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	ss, err := h.screenShot()
	if err == nil {
		data := &ScreenShotResp{ScreenImg: ss}
		json.Json(rw, http.StatusOK, data)
	} else {
		json.Json(rw, http.StatusInternalServerError, json.NewErrorMsg(err.Error()))
	}
}
