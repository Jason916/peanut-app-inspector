var Mustache = require('mustache');
var tpl = {
    highlight: require('./tpl/highlight.html'),
    lockOverlay: require('./tpl/lockOverlay.html'),
    error: require('./tpl/error.html')
};

var Screen = function ($el) {

    var
        _this = this,
        _selection = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        },
        _$highlight,
        _$lockOverlay;

    var _render = function ($content) {
        $el
            .empty()
            .append($content, _$highlight, _$lockOverlay);
    };

    // waiting screenShot
    this.lock = function () {
        _$lockOverlay.show();
    };

    // present
    this.unlock = function () {
        _$lockOverlay.hide();
    };

    // update screenShot
    this.update = function (src) {
        var img = new Image();
        img.src = 'data:image/png;base64,' + src;
        var $content = $(img);

        img.onload = function () {
            $content.css({
                width: Math.round(img.width * 0.5) + 'px',
                height: Math.round(img.height * 0.5) + 'px'
            });
            _render($content);
        }
    };

    // render error message
    this.error = function (message) {
        var $content = $(Mustache.render(tpl.error, {message: message}));
        _render($content);
    };

    // highlight area
    this.highlight = function (x, y, w, h) {
        _$highlight.css({
            left: x + 'px',
            top: y + 'px',
            width: w + 'px',
            height: h + 'px'
        });
    };

    // highlight selection
    this.highlightSelection = function () {
        _this.highlight(
            _selection.x,
            _selection.y,
            _selection.w,
            _selection.h
        );
    };

    // select area
    this.select = function (x, y, w, h) {
        _selection.x = x;
        _selection.y = y;
        _selection.w = w;
        _selection.h = h;
    };

    // init tpl
    (function () {
        _$highlight = $(tpl.highlight);
        _$lockOverlay = $(tpl.lockOverlay);
    })();

};

module.exports = Screen;