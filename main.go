// jasonxu-2017/10/1
package main

import (
	"flag"
	"net/http"
	"net"
	"fmt"
	"strings"
	"runtime"
	"os/exec"

	"github.com/Jason916/peanut_core/handler"
	"github.com/Jason916/peanut_core/log"
	"github.com/Jason916/peanut-app-inspector/wda"
	"github.com/Jason916/peanut-app-inspector/wda_handlers"
	"github.com/Jason916/peanut-app-inspector/adb-dev/adb"
	"github.com/Jason916/peanut-app-inspector/adb_handlers"
)

var iPort, iHost, listenPort, deviceID string
var isiOSDevice, isRealiOSDevice bool

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

func openBrowser() {
	var openShell string
	sysInfo := runtime.GOOS
	switch sysInfo {
	case "darwin":
		openShell = "open"
	case "win32":
		openShell = "start"
	case "linux":
		openShell = "xdg-open"
	default:
		fmt.Println("default")
	}
	openBrowserCommand := fmt.Sprintf("%s http://127.0.0.1:%s", openShell, listenPort)
	err := exec.Command("sh", "-c", openBrowserCommand).Run()
	if err != nil {
		log.Warning("open browser failed:", err.Error())
		return
	}
	log.Success("open browser succ on local")
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

	isiOSDevice = isIOS(deviceID)
	isRealiOSDevice = isRealIOS(deviceID)

	if isRealiOSDevice {
		wda.StartIProxy(deviceID, iPort)
	}

	if isiOSDevice {
		wda.StartWDA(deviceID, iHost, iPort)
	}

	iClient := wda.NewClient(iHost, iPort)
	mux := http.NewServeMux()
	openBrowser()
	setHandlers(mux, iClient)

	log.Error("listen and serve failed", http.ListenAndServe(net.JoinHostPort("", listenPort), mux))
}

func setHandlers(mux *http.ServeMux, iClient *wda.Client) {
	if isiOSDevice {
		mux.Handle("/", handler.NewHandler(wda_handlers.NewIndex()))
		mux.Handle("/screenShot", handler.NewHandler(wda_handlers.NewScreenShotHandler(iClient)))
		mux.Handle("/sourceTree", handler.NewHandler(wda_handlers.NewSourceHandler(iClient)))
		mux.Handle("/eleInfo", handler.NewHandler(wda_handlers.NewGetElementHandler(iClient)))
		mux.Handle("/static/", wda_handlers.NewStaticHandler())
	} else {
		adb.InitDevice(deviceID)
		mux.Handle("/", handler.NewHandler(adb_handlers.NewIndex()))
		mux.Handle("/screenShot", handler.NewHandler(adb_handlers.NewScreenShotHandler()))
		mux.Handle("/sourceTree", handler.NewHandler(adb_handlers.NewSourceHandler()))
		mux.Handle("/eleInfo", handler.NewHandler(adb_handlers.NewGetElementHandler()))
		mux.Handle("/static/", wda_handlers.NewStaticHandler())
	}
}
