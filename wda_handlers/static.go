// jasonxu-2017/12/5
package wda_handlers

import (
	"net/http"
)

type StaticHandler struct{}

func NewStaticHandler() *StaticHandler {
	return &StaticHandler{}
}

func (h *StaticHandler) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	path := "./resources" + req.URL.Path
	http.ServeFile(rw, req, path)
}
