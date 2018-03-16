// jasonxu-2017/11/20
package wda_handlers

import (
	"github.com/Jason916/peanut_core/json"
	"github.com/Jason916/peanut-app-inspector/wda"
	"errors"
	"net/http"
	"log"
)

type SourceHandler struct {
	WdaClient *wda.Client
}

type SourceResp struct {
	SourceInfo *wda.PageJsonSource `json:"tree"`
}

func NewSourceHandler(c *wda.Client) *SourceHandler {
	return &SourceHandler{WdaClient: c}
}

func (h *SourceHandler) getSource()(*wda.Source, error){
	source, err := h.WdaClient.GetJsonSource()
	if err != nil {
		return nil, err
	}
	if source.Status != wda.StatusOK{
		return nil, errors.New("bad request~")
	}
	return source, nil
}

func (h *SourceHandler) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	source, err := h.getSource()
	if err == nil {
		data := &SourceResp{SourceInfo: source.Value}
		json.Json(rw, http.StatusOK, data)
	} else {
		log.Printf(err.Error())
		json.Json(rw, http.StatusInternalServerError, json.NewErrorMsg(err.Error()))
	}
}