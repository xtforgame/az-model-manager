"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _azColumnTypes = require("./azColumnTypes");

Object.keys(_azColumnTypes).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _azColumnTypes[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _azColumnTypes[key];
    }
  });
});