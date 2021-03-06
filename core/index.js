"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  AmmOrm: true,
  AmmModel: true,
  AssociationModel: true
};
Object.defineProperty(exports, "AmmOrm", {
  enumerable: true,
  get: function () {
    return _AmmOrm.default;
  }
});
Object.defineProperty(exports, "AmmModel", {
  enumerable: true,
  get: function () {
    return _AmmModel.default;
  }
});
Object.defineProperty(exports, "AssociationModel", {
  enumerable: true,
  get: function () {
    return _AssociationModel.default;
  }
});
exports.default = void 0;

var _AmmOrm = _interopRequireWildcard(require("./AmmOrm"));

Object.keys(_AmmOrm).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _AmmOrm[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _AmmOrm[key];
    }
  });
});

var _interfaces = require("./interfaces");

Object.keys(_interfaces).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _interfaces[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _interfaces[key];
    }
  });
});

var _AmmModel = _interopRequireWildcard(require("./AmmModel"));

Object.keys(_AmmModel).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _AmmModel[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _AmmModel[key];
    }
  });
});

var _AssociationModel = _interopRequireWildcard(require("./AssociationModel"));

Object.keys(_AssociationModel).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _AssociationModel[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _AssociationModel[key];
    }
  });
});

var _columnTypes = require("./columnTypes");

Object.keys(_columnTypes).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _columnTypes[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _columnTypes[key];
    }
  });
});

var _utils = require("./utils");

Object.keys(_utils).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _utils[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _utils[key];
    }
  });
});

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var _default = _AmmOrm.default;
exports.default = _default;