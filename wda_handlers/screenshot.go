// jasonxu-2017/11/22
package wda_handlers

import (
	"github.com/Jason916/peanut_core/json"
	"../wda"
	"errors"
	"net/http"
	"log"
)

type ScreenShotHandler struct {
	WdaClient *wda.Client
}

type ScreenShotResp struct{
	ScreenImg string `json:"img"`
}

func NewScreenShotHandler(c *wda.Client) *ScreenShotHandler {
	return &ScreenShotHandler{WdaClient: c}
}

func (h *ScreenShotHandler) screenShot() (*wda.ScreenShotInfo, error) {
	resp, err := h.WdaClient.ScreenShot()
	if err != nil {
		return nil, err
	}
	if resp.Status != wda.StatusOK {
		return nil, errors.New("bad request~")
	}
	return resp, nil
}

func (h *ScreenShotHandler)ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	ss, err := h.screenShot()
	if err == nil{
		data := &ScreenShotResp{ScreenImg: ss.Value}
		json.Json(rw, http.StatusOK, data)
	} else {
		log.Printf(err.Error())
		json.Json(rw, http.StatusInternalServerError, json.NewErrorMsg(err.Error()))
	}
}