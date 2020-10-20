"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _IJsonSchemas = require("./IJsonSchemas");

Object.keys(_IJsonSchemas).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _IJsonSchemas[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _IJsonSchemas[key];
    }
  });
});

var _JsonSchemasX = require("./JsonSchemasX");

Object.keys(_JsonSchemasX).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _JsonSchemasX[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _JsonSchemasX[key];
    }
  });
});