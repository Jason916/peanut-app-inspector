var Screen = require('./Screen/Screen.js');
var Tree = require('./Tree/Tree.js');
var Info = require('./Info/Info.js');
var Search = require('./Search/Search.js');

$(function () {

    var screen = new Screen($('.wda_screen_container'));
    $.ajax({
        method: 'get',
        url: '/screenShot',
        dataType: 'json',
        beforeSend: function() {
            screen.lock();
        },
        complete: function() {
            screen.unlock();
        },
        success: function(data) {
            screen.update(data.img);
        },
        error: function() {
            screen.error('error when getting screenShot');
        }
    });

    var info = new Info($('.wda_info_container'));

    var tree = new Tree($('.wda_tree_container'));
    tree.onElementFocus(function(rect) {
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
        mergeJsonObject = function(json1, json2) {
            var resultJson = {};
            for (var attr in json1) {
                resultJson[attr] = json1[attr];
            }
            for (var attr in json2) {
                resultJson[attr] = json2[attr];
            }
            return resultJson;
        };
        var newJsonObject = mergeJsonObject(infoData, { xpath: path });
        info.update(newJsonObject);
    });
    $.ajax({
        method: 'get',
        url: '/sourceTree',
        dataType: 'json',
        beforeSend: function() {
            tree.lock();
        },
        complete: function() {
            tree.unlock();
        },
        success: function(data) {
            tree.update(data.tree);
        },
        error: function() {
            tree.error('error when getting source tree');
        }
    });

    var search = new Search($('#navbar'), {
        url: '/eleInfo',
        success: function(data) {
            tree.select(data.value, data.type);
        },
        notFound: function(locator) {
            info.error(locator + ' not found!');
        },
        error: function(locator) {
            info.error("can't find element by locator: [" + locator + "]");
        }
    });

});
