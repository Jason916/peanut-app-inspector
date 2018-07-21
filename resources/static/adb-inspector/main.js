(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Mustache = require('mustache');
var tpl = {
    info: require('./tpl/info.html'),
    error: require('./tpl/error.html')
};

var Info = function ($el) {

    var _previousColor;

    var _render = function ($content) {
        $el
            .empty()
            .append($content);
    };

    var _blink = function (color) {
        $el
            .stop()
            .animate({
                'background-color': color
            }, 100)
            .animate({
                'background-color': _previousColor
            }, 500)
    };

    this.update = function (info) {
        var $content = $(Mustache.render(tpl.info, {info: info}));
        _render($content);
        _blink('rgba(250, 255, 189, 0.8)');
    };

    this.error = function (message) {
        var $content = $(Mustache.render(tpl.error, {message: message}));
        _render($content);
        _blink('rgba(255, 150, 150, 0.8)');
    };

    (function () {
        _previousColor = $el.css('background-color');
    })();

};

module.exports = Info;
},{"./tpl/error.html":2,"./tpl/info.html":3,"mustache":15}],2:[function(require,module,exports){
module.exports = "<div>{{message}}</div>";

},{}],3:[function(require,module,exports){
module.exports = "<div class=\"adb_info_content\">\n    <strong>Bounds</strong> {{info.bounds}} <br>\n    <strong>Checkable</strong> {{info.checkable}} <br>\n    <strong>Class</strong> {{info.class}} <br>\n    <strong>Clickable</strong> {{info.clickable}} <br>\n    <strong>Content-desc</strong> {{info.content-desc}} <br>\n    <strong>Enabled</strong> {{info.enabled}} <br>\n    <strong>Focusable</strong> {{info.focusable}} <br>\n    <strong>Scrollable</strong> {{info.scrollable}} <br>\n    <strong>Long-clickable</strong> {{info.long-clickable}} <br>\n    <strong>Resource-id</strong> {{info.resource-id}} <br>\n    <strong>Text</strong> {{info.text}} <br>\n    <strong>Xpath</strong> {{info.xpath}} <br>\n</div>\n";

},{}],4:[function(require,module,exports){
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

    var currentScreenRate = 0;

    var getScreenRate = function (width) {
        return width > 1000 ? 0.4 : 0.5;
    };

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
            var rate = getScreenRate(img.width);
            currentScreenRate = rate;
            $content.css({
                width: Math.round(img.width * rate) + 'px',
                height: Math.round(img.height * rate) + 'px'
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
            left: x * currentScreenRate + 'px',
            top: y * currentScreenRate + 'px',
            width: w * currentScreenRate + 'px',
            height: h * currentScreenRate + 'px'
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
},{"./tpl/error.html":5,"./tpl/highlight.html":6,"./tpl/lockOverlay.html":7,"mustache":15}],5:[function(require,module,exports){
module.exports = "<div class=\"adb_screen_error\">\n{{message}}\n</div>";

},{}],6:[function(require,module,exports){
module.exports = "<div class=\"adb_screen_highlight\"></div>";

},{}],7:[function(require,module,exports){
module.exports = "<div class=\"adb_screen_lock-overlay\">\n    <div class=\"adb_screen_lock-overlay_spinner\"></div>\n</div>";

},{}],8:[function(require,module,exports){
var tpl = {
    form: require('./tpl/form.html')
};

var Search = function ($el, options) {

    var _isLocked = false;

    var _render = function ($content) {
        $el
            .empty()
            .append($content);
    };

    var _lock = function () {
        if (_isLocked) {
            return false;
        }

        $el
            .find('input')
            .attr('readonly', 'readonly');
        _isLocked = true;

        return true;
    };

    var _unlock = function () {
        $el
            .find('input')
            .removeAttr('readonly');
        _isLocked = false;
    };

    (function () {
        var $form = $(tpl.form);
        $form.on('submit', function () {
            if (_lock()) {
                var locator = $(this).find('input[name="value"]').val();
                $.ajax({
                    method: 'POST',
                    url: options.url,
                    data: $(this).serialize(),
                    dataType: 'json',
                    success: options.success,
                    error: function (jqXHR) {
                        if (jqXHR.status === 400) {
                            options.notFound(locator);
                        } else if (jqXHR.status === 418) {
                            options.nonSupport();
                        } else {
                            options.error(locator);
                        }
                    },
                    complete: function () {
                        _unlock();
                    }
                });
            }

            return false;
        });
        _render($form);
    })();

};

module.exports = Search;
},{"./tpl/form.html":9}],9:[function(require,module,exports){
module.exports = "<form class=\"navbar-form navbar-right\" id=\"search-form\">\n    <div class=\"form-group\">\n        <select name=\"using\" class=\"form-control\">\n            <option value=\"resource-id\">Resource id</option>\n            <option value=\"content-desc\">Content desc</option>\n            <option value=\"text\">Text</option>\n        </select>\n    </div>\n    <div class=\"form-group\">\n        <input name=\"value\" type=\"text\" placeholder=\"Locator\" class=\"form-control\" style=\"width: 800px;\">\n    </div>\n    <button type=\"submit\" class=\"btn btn-success\"><i class=\"glyphicon glyphicon-search\"></i></button>\n</form>";

},{}],10:[function(require,module,exports){
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
            var currentNodePath = "//" + pathSegments.get().join('');
            _onElementSelect(e.data, e.data.bounds, currentNodePath);
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
},{"./tpl/error.html":11,"./tpl/item.html":12,"./tpl/lockOverlay.html":13,"mustache":15}],11:[function(require,module,exports){
module.exports = "<div class=\"tree_error\">\n{{message}}\n</div>";

},{}],12:[function(require,module,exports){
module.exports = "{{#hasChildren}}<a href=\"#\"><i class=\"glyphicon glyphicon-minus element-with-children\"></i></a>{{/hasChildren}}<span class=\"label label-default el-type\" data-bound=\"{{bounds}}\"><strong>{{class}}</strong></span>{{#text}}<span class=\"el-id label label-success\">{{text}}</span>{{/text}}<span class=\"el-label\">{{content-desc}}</span>";

},{}],13:[function(require,module,exports){
module.exports = "<div class=\"tree_lock-overlay\">\n    <div class=\"tree_lock-overlay_spinner\"></div>\n</div>";

},{}],14:[function(require,module,exports){
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
    tree.onElementFocus(function (bounds) {
        screen.highlight(
            bounds[0],
            bounds[1],
            bounds[2],
            bounds[3]
        );
    });
    tree.onElementBlur(screen.highlightSelection);
    tree.onElementSelect(function (infoData, bounds, path) {
        screen.select(
            bounds[0],
            bounds[1],
            bounds[2],
            bounds[3]
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

},{"./Info/Info.js":1,"./Screen/Screen.js":4,"./Search/Search.js":8,"./Tree/Tree.js":10}],15:[function(require,module,exports){
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false Mustache: true*/

(function defineMustache (global, factory) {
  if (typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') {
    factory(exports); // CommonJS
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory); // AMD
  } else {
    global.Mustache = {};
    factory(global.Mustache); // script, wsh, asp
  }
}(this, function mustacheFactory (mustache) {

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill (object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction (object) {
    return typeof object === 'function';
  }

  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr (obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp (string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty (obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp (re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace (string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate (template, tags) {
    if (!template)
      return [];

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace () {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags (tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n')
            stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      token = [ type, value, start, scanner.pos ];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens (tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens (tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;
        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner (string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos () {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil (re) {
    var index = this.tail.search(re), match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context (view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           **/
          while (value != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = hasProperty(value, names[index]);

            value = value[names[index++]];
          }
        } else {
          value = context.view[name];
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit)
          break;

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer () {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache () {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse (template, tags) {
    var cache = this.cache;
    var tokens = cache[template];

    if (tokens == null)
      tokens = cache[template] = parseTemplate(template, tags);

    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function render (template, view, partials) {
    var tokens = this.parse(template);
    var context = (view instanceof Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, originalTemplate);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender (template) {
      return self.render(template, context, partials);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate);
  };

  Writer.prototype.renderPartial = function renderPartial (token, context, partials) {
    if (!partials) return;

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null)
      return this.renderTokens(this.parse(value), context, partials, value);
  };

  Writer.prototype.unescapedValue = function unescapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype.escapedValue = function escapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return mustache.escape(value);
  };

  Writer.prototype.rawValue = function rawValue (token) {
    return token[1];
  };

  mustache.name = 'mustache.js';
  mustache.version = '2.3.0';
  mustache.tags = [ '{{', '}}' ];

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function render (template, view, partials) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' +
                          'but "' + typeStr(template) + '" was given as the first ' +
                          'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.,
  /*eslint-disable */ // eslint wants camel cased function name
  mustache.to_html = function to_html (template, view, partials, send) {
    /*eslint-enable*/

    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

  return mustache;
}));

},{}]},{},[14]);
