//jasonxu-2018/3/6
package adb

func adbCmd() string {
	var cmd string
	if deviceId != "" {
		cmd = "adb -s " + deviceId + " "
	} else {
		cmd = "adb "
	}
	return cmd
}

func adbShell() string {
	var cmd string
	if deviceId != "" {
		cmd = "adb -s " + deviceId + " shell "
	} else {
		cmd = "adb shell "
	}
	return cmd
}

func captureCommand(path, name string) string {
	return adbShell() + "screencap -p " + path + name + ".png"
}

func dumpCommand(saveFilePath string) string {
	return adbShell() + "uiautomator dump " + saveFilePath
}

func listPackagesCommand(packageName string) string {
	return adbShell() + "pm list packages " + packageName
}

func uninstallPackageCommand(packageName string) string {
	return adbShell() + "pm uninstall " + packageName
}

func getPidCommand(packageName string) string {
	return adbShell() + "ps | grep " + packageName
}

func getSDKCommand() string {
	return adbShell() + "getprop ro.build.version.sdk"
}

func pullFileCommand(fromFilePath, destImagePath string) string {
	return adbCmd() + "pull " + fromFilePath + " " + destImagePath
}

func grepCommand(keyWord string) string {
	return "ps -ef | grep " + keyWord
}

