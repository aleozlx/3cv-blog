"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _react = _interopRequireDefault(require("react"));

var _require = require("./constants"),
    imageClass = _require.imageClass;

exports.onRenderBody = function (_ref) {
  var setHeadComponents = _ref.setHeadComponents;
  var style = ("\n  ." + imageClass + " {\n    height: 100%;\n    margin: 0;\n    vertical-align: middle;\n    position: absolute;\n    top: 0;\n    color: transparent;\n  }").replace(/\s*\n\s*/g, "").replace(/: /g, ":").replace(/ \{/g, "{");
  setHeadComponents([_react["default"].createElement("style", {
    type: "text/css",
    key: "gatsby-remark-images-styles"
  }, style)]);
};