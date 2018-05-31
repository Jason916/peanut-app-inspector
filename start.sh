#!/usr/bin/env bash

cd vendor/github.com/Jason916/WebDriverAgent
./Scripts/bootstrap.sh
if [ $? -eq 0 ];then
    echo "start wda succ"
else
    echo "start wda failed"
fi
echo "====================================================================="
cd ../android-uiautomator-server
echo "NOTE: when get Building 96% > :app:connectedDebugAndroidTest, uiautomator server start succ."
./gradlew cC
if [ $? -eq 0 ];then
    echo "start uiautomator server succ"
else
    echo "start uiautomator server failed"
fi


