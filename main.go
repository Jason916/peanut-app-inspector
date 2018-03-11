// jasonxu-2017/10/1
package main

import (
	"github.com/Jason916/peanut_core/handler"
	"github.com/Jason916/peanut_core/log"
	"./wda"
	"./wda_handlers"
	"./adb-dev/adb"
	"./adb_handlers"
	"flag"
	"net/http"
	"net"
	"fmt"
	"strings"
)

var iPort, iHost, listenPort, deviceID string
var isIOSDevice, isRealIOSDevice bool

func isRealIOS(udid string) bool {
	udidLen := len(udid)
	contain := strings.Contains(udid, "-")
	if udidLen == 40 && !contain {
		return true
	}
	return false
}

func isIOS(udid string) bool {
	udidLen := len(udid)
	if udidLen == 40 || udidLen == 36 {
		return true
	}
	return false
}

func main() {
	flag.StringVar(&iPort, "p", "8200", "WDA port, 8200 by default")
	flag.StringVar(&iHost, "h", "127.0.0.1", "WDA host, 127.0.0.1 by default ")
	flag.StringVar(&listenPort, "l", "8086", "Port to listen by inspector, 8086 by default")
	flag.StringVar(&deviceID, "u", "", "device id")

	flag.Parse()

	if deviceID == "" {
		log.Error("Please set device id")
	}
	isIOSDevice = isIOS(deviceID)
	isRealIOSDevice = isRealIOS(deviceID)
	if isRealIOSDevice {
		wda.StartIProxy(deviceID, iPort)
	}

	iClient := wda.NewClient(iHost, iPort)
	mux := http.NewServeMux()
	setHandlers(mux, iClient)

	log.Error("ListenAndServe failed", http.ListenAndServe(net.JoinHostPort("", listenPort), mux))
}

func setHandlers(mux *http.ServeMux, iClient *wda.Client) {
	if isIOSDevice {
		mux.Handle("/", handler.NewHandler(wda_handlers.NewIndex()))
		mux.Handle("/screenShot", handler.NewHandler(wda_handlers.NewScreenShotHandler(iClient)))
		mux.Handle("/sourceTree", handler.NewHandler(wda_handlers.NewSourceHandler(iClient)))
		mux.Handle("/eleInfo", handler.NewHandler(wda_handlers.NewGetElementHandler(iClient)))
		mux.Handle("/static/", wda_handlers.NewStaticHandler())
	} else {
		adb.InitDevice(deviceID)
		cmd := adb.GetDeviceId()
		fmt.Printf("%v", cmd)
		mux.Handle("/", handler.NewHandler(adb_handlers.NewIndex()))
		mux.Handle("/screenShot", handler.NewHandler(adb_handlers.NewScreenShotHandler()))
		mux.Handle("/sourceTree", handler.NewHandler(adb_handlers.NewSourceHandler()))
		mux.Handle("/static/", wda_handlers.NewStaticHandler())
	}
}
