## Peanut-app-inspector
peanut app inspector is an UI viewer that can be applied in android and iOS.

## Screenshot
![image](/resources/static/pic/inspector_demo.png)

## Installation

Before checkout repository
* install adb
* install ios-deploynpm     [install -g ios-deploy]
* install libimobiledevice  [brew install libimobiledevice --HEAD]
* install usbmuxd           [brew install usbmuxd]

Checkout this repository
```bash
git clone https://github.com/Jason916/peanut-app-inspector $GOPATH/src/github.com/Jason916/peanut-app-inspector
cd $GOPATH/src/github.com/Jason916/peanut-app-inspector
```

Install glide and update vendor
```bash
brew install glide
glide up
```

Update dependences
```bash
./start.sh
```
Package resources into binary
```bash
go build
```

## Usage
Android
DeviceId ==> adb devices
```
$ ./peanut-app-inspector -u $DeviceId
```
iOS
UDID(Real Device) ==> idevice_id -l
```
$ ./peanut-app-inspector -u $UDID
```


## Arguments:

| Name              | Type   | Required | Default   | Description                      |
| ----------------- | ------ |--------- | --------- |--------------------------------- |
| -p                | string | false    | "8200"    |WDA port                          |
| -h                | string | false    |"127.0.0.1"|WDA host                          |
| -l                | string | false    | "8086"    |port to listen by inspector       |
| -u                | string | true     | ""        |device id                         |
