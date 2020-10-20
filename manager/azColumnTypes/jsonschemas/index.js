"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _interfaces = require("./interfaces");

Object.keys(_interfaces).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _interfaces[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _interfaces[key];
    }
  });
});

var _typeConfigs = require("./typeConfigs");

Object.keys(_typeConfigs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _typeConfigs[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _typeConfigs[key];
    }
  });
});