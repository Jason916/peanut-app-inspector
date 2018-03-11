// jasonxu-2018/1/15
package adb

import (
	"os/exec"
)

const tempPath = ".temp/"

func ScreenCapture() (img string, err error) {
	err = exec.Command("sh", "-c", captureCommand("/sdcard/", "screenshot")).Run()
	if err != nil {
		return "", err
	}
	MkDirIfNotExist(tempPath)
	destImagePath := tempPath + "screenshot.png"
	err = exec.Command("sh", "-c", pullFileCommand("/sdcard/screenshot.png", destImagePath)).Run()
	if err != nil {
		return "", err
	}
	img, err = OpenImageToBase64(destImagePath)

	return
}
