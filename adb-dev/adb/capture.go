//jasonxu-2018/1/15
package adb

import (
	"os/exec"
	"fmt"
)

const tempPath = ".temp/"

func ScreenCapture() (img string, err error) {
	captureCommand := fmt.Sprintf("adb -s %s shell screencap -p /sdcard/screenshot.png", deviceId)
	err = exec.Command("sh", "-c", captureCommand).Run()
	if err != nil {
		return "", err
	}
	MkDirIfNotExist(tempPath)
	destImagePath := tempPath + "screenshot.png"
	pullFileCommand := fmt.Sprintf("adb -s %s pull /sdcard/screenshot.png %s", deviceId, destImagePath)
	err = exec.Command("sh", "-c", pullFileCommand).Run()
	if err != nil {
		return "", err
	}
	img, err = OpenImageToBase64(destImagePath)

	return
}
