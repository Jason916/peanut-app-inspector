// jasonxu-2018/1/18
package adb_handlers

import (
	"net/http"

	"github.com/Jason916/peanut_core/json"
	"github.com/Jason916/peanut_core/log"
	"github.com/Jason916/peanut-app-inspector/adb-dev/adb"
	"github.com/bitly/go-simplejson"
)

type SourceHandler struct {
}

type SourceResp struct {
	*simplejson.Json
}

func NewSourceHandler() *SourceHandler {
	return &SourceHandler{}
}

func (h *SourceHandler) getSource() (json *simplejson.Json, err error) {
	source, err := adb.DumpUIXml()
	if err != nil {
		log.Warning("dump ui xml failed", err)
		return
	}
	return source, nil
}

func (h *SourceHandler) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	source, err := h.getSource()
	if err == nil {
		data := &SourceResp{source}
		json.Json(rw, http.StatusOK, data)
	} else {
		json.Json(rw, http.StatusInternalServerError, json.NewErrorMsg("dump ui xml failed, try to restart your device"))
	}
}
