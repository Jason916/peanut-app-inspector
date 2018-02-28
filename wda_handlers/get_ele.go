//jasonxu-2017/11/19
package wda_handlers

import (
	"net/http"
	"strings"
	"errors"
	"../wda"
	"log"
	"github.com/Jason916/peanut_core/json"
)

type GetElementHandler struct {
	WdaClient *wda.Client
}

type GetElementResponse struct {
	*wda.RectResponse
}

type TypeResponse struct {
	*wda.GetEleTypeResp
}

type Response struct {
	Value struct {
		X      float32 `json:"x"`
		Y      float32 `json:"y"`
		Width  float32 `json:"width"`
		Height float32 `json:"height"`
	} `json:"value"`
	Type   string  `json:"type"`
	Status int `json:"status"`
}

const (
	TypeOther = "XCUIElementTypeOther"
)

func NewGetElementHandler(c *wda.Client) *GetElementHandler {
	return &GetElementHandler{WdaClient: c}
}

func (h *GetElementHandler) getElementInfo(using string, value string) (*wda.ElementResp, error) {
	elementInfo, err := h.WdaClient.GetElementInfo(using, value)
	if err != nil {
		return nil, err
	}
	if elementInfo.Status != wda.StatusOK {
		return nil, errors.New("get element info failed")
	}
	return elementInfo, err
}

func (h *GetElementHandler) getEleRect(eleID string) (*wda.RectResponse, error) {
	elementRect, err := h.WdaClient.GetEleRect(eleID)
	if err != nil {
		return nil, err
	}
	if elementRect.Status != wda.StatusOK {
		return nil, errors.New("get element rect failed")
	}
	return elementRect, err
}

func (h *GetElementHandler) getEleType(eleID string) (*wda.GetEleTypeResp, error) {
	elementType, err := h.WdaClient.GetEleType(eleID)
	if err != nil {
		return nil, err
	}
	if elementType.Status != wda.StatusOK {
		return nil, errors.New("get element type failed")
	}
	return elementType, err
}

func (h *GetElementHandler) ServeHTTP(resp http.ResponseWriter, req *http.Request) {
	elementInfo, err := h.getElementInfo(req.FormValue("using"), req.FormValue("value"))
	if err != nil {
		log.Printf(err.Error())
		json.Json(resp, http.StatusInternalServerError, json.NewErrorMsg(err.Error()))
		return
	}

	elementRect, err := h.getEleRect(elementInfo.Value.EleID)
	if err != nil {
		log.Printf(err.Error())
		json.Json(resp, http.StatusInternalServerError, json.NewErrorMsg(err.Error()))
		return
	}

	elementType, err := h.getEleType(elementInfo.Value.EleID)
	if err != nil {
		log.Printf(err.Error())
		json.Json(resp, http.StatusInternalServerError, json.NewErrorMsg(err.Error()))
		return
	}

	var res Response
	res.Type = strings.Replace(elementType.Value, "XCUIElementType", "", -1)
	res.Value.Height = elementRect.Value.Height
	res.Value.Width = elementRect.Value.Width
	res.Value.X = elementRect.Value.X
	res.Value.Y = elementRect.Value.Y
	res.Status = res.Status

	if res.Type == TypeOther && elementRect.IsAvailable() {
		json.Json(resp, http.StatusBadRequest, json.NewErrorMsg("element can not be found"))
		return
	}
	json.Json(resp, http.StatusOK, res)
}