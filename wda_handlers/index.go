// jasonxu-2017/12/5
package wda_handlers

import (
	"net/http"
	"html/template"

	"github.com/Jason916/peanut_core/log"
)

type IndexHandler struct{}

func NewIndex() *IndexHandler {
	return &IndexHandler{}
}

func (h *IndexHandler) getIndex() (*template.Template, error) {
	return template.New("index.html").ParseFiles("resources/template/index.html")
}

func (h *IndexHandler) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	temp, err := h.getIndex()
	if err != nil {
		log.Warning("get index failed", err.Error())
	}
	var data interface{}
	err = temp.Execute(rw, data)
	if err != nil {
		log.Warning("render index failed", err.Error())
	}
}
