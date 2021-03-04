"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsonschemas = require("./jsonschemas");

Object.keys(_jsonschemas).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _jsonschemas[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _jsonschemas[key];
    }
  });
});