// jasonxu-2018/1/17
package adb

import (
	"encoding/base64"
	"io/ioutil"
	"os"
)

func MkDirIfNotExist(path string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return os.MkdirAll(path, 0755)
	}
	return nil
}

func OpenImageToBase64(filename string) (string, error) {
	f, err := ioutil.ReadFile(filename)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(f), nil
}
