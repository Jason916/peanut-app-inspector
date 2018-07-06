var Mustache = require('mustache');
var tpl = {
    item: require('./tpl/item.html'),
    lockOverlay: require('./tpl/lockOverlay.html'),
    error: require('./tpl/error.html')
};

var Tree = function($el) {

    var
        _$lockOverlay,
        _onElementSelect = function() {},
        _onElementFocus = function() {},
        _onElementBlur = function() {};

    var _buildList = function(elements) {
        var $list = $('<ul />');
        for (var i = 0; i < elements.length; ++i) {
            var item = elements[i];
            item.hasChildren = item.children? true : false;
            item.rectStr = JSON.stringify(item.rect);
            var
                $li = $('<li />'),
                $item = $(Mustache.render(tpl.item, item));

            $li.on('mouseenter.wda-inspector', '.el-type', item.rect, function(e) {
                _onElementFocus(e.data);

                return false;
            });
            $li.on('mouseleave.wda-inspector', '.el-type', function(e) {
                _onElementBlur(e.data);

                return false;
            });
            $li.on('click.wda-inspector', '.el-type', item, function(e) {
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
                    var key = $(li).children("span").first().children("strong").text()+ '[' + index + ']';
                    var keyType = "object";

                    return {
                        key: key,
                        keyType: keyType
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

                _onElementSelect(e.data, e.data.rect, currentNodepath);

                return false;
            });

            $li.append($item);

            if (item.children) {
                $li.append(_buildList(item.children));
            }

            $list.append($li);
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

    var _render = function($content) {
        $el
            .empty()
            .append($content, _$lockOverlay);
    };

    // waiting source tree
    this.lock = function() {
        _$lockOverlay.show();
    };

    // present
    this.unlock = function() {
        _$lockOverlay.hide();
    };

    // render error message
    this.error = function(message) {
        var $content = $(Mustache.render(tpl.error, {message: message}));
        _render($content);
    };

    // update source tree
    this.update = function(elements) {
        var $list = _buildList(elements.children);
        _render($list);
    };

    this.select = function(rect, type) {
        $el
            .find(".el-type[data-rect='" + JSON.stringify(rect) + "'] > :contains(" + "XCUIElementType"+ type + ")")
            .click();
    };

    // element focus handler
    this.onElementFocus = function(handler) {
        _onElementFocus = handler;
    };

    // element blur handler
    this.onElementBlur = function(handler) {
        _onElementBlur = handler;
    };

    // element select handler
    this.onElementSelect = function(handler) {
        _onElementSelect = handler;
    };

    // init lockOverlay
    (function() {
        _$lockOverlay = $(tpl.lockOverlay);
    })();

};

module.exports = Tree;