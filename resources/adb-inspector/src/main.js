var Screen = require('./Screen/Screen.js');
var Tree = require('./Tree/Tree.js');
var Info = require('./Info/Info.js');
var Search = require('./Search/Search.js');

$(function () {

    var screen = new Screen($('.adb_screen_container'));
    $.ajax({
        method: 'get',
        url: '/screenShot',
        dataType: 'json',
        beforeSend: function () {
            screen.lock();
        },
        complete: function () {
            screen.unlock();
        },
        success: function (data) {
            screen.update(data.img);
        },
        error: function () {
            screen.error('error when getting screenShot');
        }
    });

    var info = new Info($('.adb_info_container'));

    var tree = new Tree($('.adb_tree_container'));
    tree.onElementFocus(function (rect) {
        screen.highlight(
            rect.x,
            rect.y,
            rect.width,
            rect.height
        );
    });
    tree.onElementBlur(screen.highlightSelection);
    tree.onElementSelect(function (infoData, rect, path) {
        screen.select(
            rect.x,
            rect.y,
            rect.width,
            rect.height
        );
        screen.highlightSelection();
        mergeJsonObject = function (json1, json2) {
            var resultJson = {};
            for (var attr in json1) {
                resultJson[attr] = json1[attr];
            }
            for (var attr in json2) {
                resultJson[attr] = json2[attr];
            }
            return resultJson;
        };
        var newJsonObject = mergeJsonObject(infoData, {xpath: path});
        info.update(newJsonObject);
    });
    $.ajax({
        method: 'get',
        url: '/sourceTree',
        dataType: 'json',
        beforeSend: function () {
            tree.lock();
        },
        complete: function () {
            tree.unlock();
        },
        success: function (data) {
            tree.update(data.hierarchy);
        },
        error: function () {
            tree.error('error when getting source tree');
        }
    });

    var search = new Search($('#navbar'), {
        url: '/eleInfo',
        success: function (data) {
            const bounds = data.match(/[\d\.]+/g);
            data = [
                ~~bounds[0],
                ~~bounds[1],
                bounds[2] - bounds[0],
                bounds[3] - bounds[1],
            ];

            tree.select(data);
        },
        notFound: function (locator) {
            info.error(locator + ' not found!');
        },
        nonSupport: function () {
            info.error('sorry, nonsupport SDK 21');
        },
        error: function (locator) {
            info.error("can't find element by locator: [" + locator + "]");
        }
    });

});
