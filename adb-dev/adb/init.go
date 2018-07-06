// jasonxu-2018/1/10
package adb

func GetDeviceId() string {
	return deviceId
}

var (
	deviceId string
)

func InitDevice(currentDeviceId string) {
	deviceId = currentDeviceId
}
