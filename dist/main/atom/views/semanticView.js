var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var atomConfig = require("../atomConfig");
var atomUtils = require("../atomUtils");
var view = require("./view");
var React = require('react');
var parent = require("../../../worker/parent");
var rts;
(function (rts) {
    function indent(indent) {
        return Array(indent + 1).join().split('').map(function (i) { return "\u00a0\u00a0\u00a0\u00a0"; });
    }
    rts.indent = indent;
    function getterSetter(component, initial) {
        var _value = initial;
        return {
            get: function () {
                return _value;
            },
            set: function (value) {
                _value = value;
                component.forceUpdate();
            }
        };
    }
    rts.getterSetter = getterSetter;
})(rts || (rts = {}));
var MyComponent = (function (_super) {
    __extends(MyComponent, _super);
    function MyComponent(props) {
        _super.call(this, props);
        this.state = {};
        this._tree = [];
        this.whileRendering = {
            lastCursorLine: null
        };
    }
    Object.defineProperty(MyComponent.prototype, "editor", {
        get: function () {
            return this._editor;
        },
        set: function (value) {
            this._editor = value;
            this.forceUpdate();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MyComponent.prototype, "tree", {
        get: function () {
            return this._tree;
        },
        set: function (value) {
            this._tree = value;
            this.forceUpdate();
        },
        enumerable: true,
        configurable: true
    });
    MyComponent.prototype.componentDidMount = function () {
        // We listen to a few things
        var _this = this;
        var editorScrolling;
        var editorChanging;
        var subscribeToEditor = function (editor) {
            _this.editor = editor;
            parent.getSemtanticTree({ filePath: editor.getPath() }).then(function (res) {
                _this.tree = res.nodes;
            });
            editorScrolling = _this.editor.onDidChangeCursorPosition(function () {
                _this.forceUpdate();
            });
            editorChanging = _this.editor.onDidStopChanging(function () {
                parent.getSemtanticTree({ filePath: editor.getPath() }).then(function (res) {
                    _this.tree = res.nodes;
                });
            });
            panel.show();
        };
        var unsubscribeToEditor = function () {
            panel.hide();
            _this.tree = [];
            if (!_this.editor)
                return;
            editorScrolling.dispose();
            editorChanging.dispose();
            _this.forceUpdate();
        };
        subscribeToEditor(atomUtils.getActiveEditor());
        atom.workspace.onDidChangeActivePaneItem(function (editor) {
            if (atomUtils.onDiskAndTs(editor) && atomConfig.showSemanticView) {
                subscribeToEditor(editor);
            }
            else {
                unsubscribeToEditor();
            }
        });
    };
    MyComponent.prototype.componentWillUnmount = function () {
    };
    MyComponent.prototype.render = function () {
        var _this = this;
        this.whileRendering = {
            lastCursorLine: this.editor ? this.editor.getLastCursor().getBufferRow() : null
        };
        return React.createElement("div", null, this.tree.map(function (node) { return _this.renderNode(node, 0); }));
    };
    MyComponent.prototype.renderNode = function (node, indent) {
        var _this = this;
        return React.createElement("div", {"className": "node", "onClick": function (event) { _this.gotoNode(node); event.stopPropagation(); }, "data-start": node.start.line, "data-end": node.end.line}, rts.indent(indent), React.createElement("span", {"className": this.getIconForKind(node.kind) + ' ' + this.isSelected(node)}, node.text), node.subNodes.map(function (sn) { return _this.renderNode(sn, indent + 1); }));
    };
    MyComponent.prototype.getIconForKind = function (kind) {
        return "icon icon-" + kind;
    };
    MyComponent.prototype.isSelected = function (node) {
        if (this.whileRendering.lastCursorLine == null)
            return '';
        else {
            if (node.start.line <= this.whileRendering.lastCursorLine && node.end.line >= this.whileRendering.lastCursorLine) {
                return 'selected';
            }
            return '';
        }
    };
    MyComponent.prototype.gotoNode = function (node) {
        var gotoLine = node.start.line;
        this.editor.setCursorBufferPosition([gotoLine, 0]);
    };
    return MyComponent;
})(React.Component);
var SemanticView = (function (_super) {
    __extends(SemanticView, _super);
    function SemanticView(config) {
        _super.call(this, config);
        this.config = config;
        this.started = false;
    }
    Object.defineProperty(SemanticView.prototype, "rootDomElement", {
        get: function () {
            return this.mainContent[0];
        },
        enumerable: true,
        configurable: true
    });
    SemanticView.content = function () {
        var _this = this;
        return this.div({ class: 'atomts-semantic-view native-key-bindings' }, function () {
            _this.div({ outlet: 'mainContent' });
        });
    };
    SemanticView.prototype.start = function () {
        if (this.started)
            return;
        this.started = true;
        React.render(React.createElement(MyComponent, {}), this.rootDomElement);
    };
    return SemanticView;
})(view.View);
exports.SemanticView = SemanticView;
var panel;
function attach() {
    if (exports.mainView) {
        return;
    }
    exports.mainView = new SemanticView({});
    panel = atom.workspace.addRightPanel({ item: exports.mainView, priority: 1000, visible: atomConfig.showSemanticView && atomUtils.isActiveEditorOnDiskAndTs() });
    if (panel.isVisible()) {
        exports.mainView.start();
    }
}
exports.attach = attach;
function toggle() {
    if (panel.isVisible()) {
        atomConfig.showSemanticView = (false);
        panel.hide();
    }
    else {
        atomConfig.showSemanticView = (true);
        panel.show();
        exports.mainView.start();
    }
}
exports.toggle = toggle;