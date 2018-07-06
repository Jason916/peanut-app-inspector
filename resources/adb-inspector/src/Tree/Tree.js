var Mustache = require('mustache');
var tpl = {
    item: require('./tpl/item.html'),
    lockOverlay: require('./tpl/lockOverlay.html'),
    error: require('./tpl/error.html')
};

var Tree = function ($el) {

    var
        _$lockOverlay,
        _onElementSelect = function () {
        },
        _onElementFocus = function () {
        },
        _onElementBlur = function () {
        };

    var getBoundsArray = function (item) {
        if (item.bounds) {
            const bounds = item.bounds.match(/[\d\.]+/g);

            item.bounds = [
                ~~bounds[0],
                ~~bounds[1],
                bounds[2] - bounds[0],
                bounds[3] - bounds[1],
            ];
        }
        return item.bounds
    };

    var itemAssemble = function (item) {
        item.bounds = getBoundsArray(item);
        item.hasChildren = item.node ? true : false;

        var
            $li = $('<li />'),
            $item = $(Mustache.render(tpl.item, item));

        $li.on('mouseenter.adb-inspector', '.el-type', item.bounds, function (e) {
            _onElementFocus(e.data);
            return false;
        });
        $li.on('mouseleave.adb-inspector', '.el-type', function (e) {
            _onElementBlur(e.data);
            return false;
        });
        $li.on('click.adb-inspector', '.el-type', item, function (e) {
            $el
                .find(".el-type.label-primary")
                .removeClass("label-primary")
                .addClass("label-default");
            $(this)
                .removeClass("label-default")
                .addClass("label-primary");

            var $parentsList = $(this).parents('li').get().reverse();

            var pathSegments = $($parentsList).map(function (idx, li) {
                $(li).children("span").first().removeClass("label-default").addClass("label-primary");
                nodes = $(li).parent("ul").children();
                nodeText = $(li).children("span").first().children("strong").text();
                var index = 0;

                for (var i = 0; i < nodes.length; i++) {
                    var nodeItem = nodes[i];
                    var nodeItemText = $(li).find("a").length ? nodeItem.childNodes[1].innerText : nodeItem.childNodes[0].innerText;
                    var nodeItemChild = $(li).find("a").length ? nodeItem.childNodes[1] : nodeItem.childNodes[0];
                    if (nodeItemText === nodeText) {
                        index++;
                    }

                    if (nodeItemChild.className === "label el-type label-primary") {
                        break;
                    }

                }
                var key = $(li).children("span").first().children("strong").text() + '[' + index + ']';

                return {
                    key: key,
                };
            });

            pathSegments = pathSegments.map(function (idx, segment) {
                if (idx > 0) {
                    return '/' + segment.key;
                } else {
                    return segment.key;
                }
            });
            var currentNodepath = "//" + pathSegments.get().join('');
            _onElementSelect(e.data, e.data.bounds, currentNodepath);
            return false;
        });

        $li.append($item);

        if (item.node) {
            $li.append(_buildList(item.node));
        }
        return $li
    };

    var _buildList = function (elements) {
        var $list = $('<ul />');

        if (elements instanceof Array) {

            for (var i = 0; i < elements.length; ++i) {
                var item = elements[i];
                var $li = itemAssemble(item);
                $list.append($li);
            }
        } else if (elements instanceof Object) {
            var oitem = elements;
            var $oli = itemAssemble(oitem);
            $list.append($oli);
        }

        $list.on("click", ".element-with-children", function () {
            var $this = $(this);
            if ($this.hasClass("glyphicon-minus")) {
                $this
                    .removeClass("glyphicon-minus")
                    .addClass("glyphicon-plus")
                    .closest("li")
                    .children("ul")
                    .css("display", "none");
            } else {
                $this
                    .removeClass("glyphicon-plus")
                    .addClass("glyphicon-minus")
                    .closest("li")
                    .children("ul")
                    .css("display", "block");
            }

            return false;
        });
        return $list;
    };

    var _render = function ($content) {
        $el
            .empty()
            .append($content, _$lockOverlay);
    };

    this.lock = function () {
        _$lockOverlay.show();
    };

    this.unlock = function () {
        _$lockOverlay.hide();
    };

    this.error = function (message) {
        var $content = $(Mustache.render(tpl.error, {message: message}));
        _render($content);
    };

    this.update = function (elements) {
        var $list = _buildList(elements.node);
        _render($list);
    };

    this.select = function (bounds) {
        $el
            .find(".el-type[data-bound='" + bounds + "']")
            .click();
    };

    this.onElementFocus = function (handler) {
        _onElementFocus = handler;

    };

    this.onElementBlur = function (handler) {
        _onElementBlur = handler;
    };

    this.onElementSelect = function (handler) {
        _onElementSelect = handler;
    };

    (function () {
        _$lockOverlay = $(tpl.lockOverlay);
    })();

};

module.exports = Tree;