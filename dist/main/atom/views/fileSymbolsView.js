"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sp = require("atom-space-pen-views");
var atomUtils = require("../atomUtils");
var FileSymbolsView = (function (_super) {
    __extends(FileSymbolsView, _super);
    function FileSymbolsView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.panel = null;
        return _this;
    }
    Object.defineProperty(FileSymbolsView.prototype, "$", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    FileSymbolsView.prototype.setNavBarItems = function (tsItems, filePath) {
        var items = tsItems;
        this.filePath = filePath;
        _super.prototype.setItems.call(this, items);
    };
    FileSymbolsView.prototype.viewForItem = function (item) {
        return "\n            <li>\n                <div class=\"highlight\">" + (Array(item.indent * 2).join('&nbsp;') + (item.indent ? "\u221F " : '') + item.text) + "</div>\n                <div class=\"pull-right\" style=\"font-weight: bold; color:" + atomUtils.kindToColor(item.kind) + "\">" + item.kind + "</div>\n                <div class=\"clear\"> line: " + (item.position.line + 1) + "</div>\n            </li>\n        ";
    };
    FileSymbolsView.prototype.confirmed = function (item) {
        atom.workspace.open(this.filePath, {
            initialLine: item.position.line,
            initialColumn: item.position.col
        });
        this.hide();
    };
    FileSymbolsView.prototype.getFilterKey = function () { return 'text'; };
    FileSymbolsView.prototype.show = function () {
        this.storeFocusedElement();
        if (!this.panel)
            this.panel = atom.workspace.addModalPanel({ item: this });
        this.panel.show();
        this.focusFilterEditor();
    };
    FileSymbolsView.prototype.hide = function () {
        this.panel.hide();
        this.restoreFocus();
    };
    FileSymbolsView.prototype.cancelled = function () {
        this.hide();
    };
    return FileSymbolsView;
}(sp.SelectListView));
exports.FileSymbolsView = FileSymbolsView;
