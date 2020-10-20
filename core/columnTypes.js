"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "HasOneOptions", {
  enumerable: true,
  get: function get() {
    return _sequelize.HasOneOptions;
  }
});
Object.defineProperty(exports, "BelongsToOptions", {
  enumerable: true,
  get: function get() {
    return _sequelize.BelongsToOptions;
  }
});
Object.defineProperty(exports, "HasManyOptions", {
  enumerable: true,
  get: function get() {
    return _sequelize.HasManyOptions;
  }
});
exports.isAssociationColumn = exports.BELONGS_TO_MANY = exports.BELONGS_TO = exports.HAS_MANY = exports.HAS_ONE = exports.ASSOCIATION = exports.AssociationColumn = exports.associations = void 0;

var _sequelize = require("sequelize");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var associations = ['hasOne', 'hasMany', 'belongsTo', 'belongsToMany'];
exports.associations = associations;

var AssociationColumn = function () {
  function AssociationColumn(type, targetModel) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var extraOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    _classCallCheck(this, AssociationColumn);

    _defineProperty(this, "key", void 0);

    _defineProperty(this, "type", void 0);

    _defineProperty(this, "targetModel", void 0);

    _defineProperty(this, "options", void 0);

    _defineProperty(this, "extraOptions", void 0);

    _defineProperty(this, "as", void 0);

    if (!type) {
      throw new Error('ASSOCIATION must has a type argument');
    }

    this.key = type;
    this.type = type;
    this.targetModel = targetModel;
    this.options = options;
    this.extraOptions = extraOptions;
    this.as = '';
  }

  _createClass(AssociationColumn, [{
    key: "setAs",
    value: function setAs(as) {
      this.as = as;
    }
  }, {
    key: "warn",
    value: function warn(link, text) {}
  }]);

  return AssociationColumn;
}();

exports.AssociationColumn = AssociationColumn;

var ASSOCIATION = function ASSOCIATION(type, targetModel, options) {
  var extraOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (!type) {
    throw new Error('ASSOCIATION must has a type argument');
  }

  return new AssociationColumn(type, targetModel, options, extraOptions);
};

exports.ASSOCIATION = ASSOCIATION;

var HAS_ONE = function HAS_ONE(targetModel, options) {
  return ASSOCIATION(HAS_ONE.type, targetModel, options);
};

exports.HAS_ONE = HAS_ONE;
HAS_ONE.type = 'hasOne';

var HAS_MANY = function HAS_MANY(targetModel, options) {
  return ASSOCIATION(HAS_MANY.type, targetModel, options);
};

exports.HAS_MANY = HAS_MANY;
HAS_MANY.type = 'hasMany';

var BELONGS_TO = function BELONGS_TO(targetModel, options) {
  return ASSOCIATION(BELONGS_TO.type, targetModel, options);
};

exports.BELONGS_TO = BELONGS_TO;
BELONGS_TO.type = 'belongsTo';

var BELONGS_TO_MANY = function BELONGS_TO_MANY(targetModel, o) {
  var options = _objectSpread({}, o);

  var extraOptions = {};

  if (typeof options.through === 'string') {
    extraOptions.ammThroughAs = options.through;
  } else if (options.through.ammThroughAs) {
    extraOptions.ammThroughAs = options.through.ammThroughAs;
    delete options.through.ammThroughAs;
  } else if (options.through.ammModelName) {
    extraOptions.ammThroughAs = options.through.ammModelName;
  } else {
    extraOptions.ammThroughAs = options.through.model.name;
  }

  return ASSOCIATION(BELONGS_TO_MANY.type, targetModel, options, extraOptions);
};

exports.BELONGS_TO_MANY = BELONGS_TO_MANY;
BELONGS_TO_MANY.type = 'belongsToMany';
ASSOCIATION.HAS_ONE = HAS_ONE;
ASSOCIATION.HAS_MANY = HAS_MANY;
ASSOCIATION.BELONGS_TO = BELONGS_TO;
ASSOCIATION.BELONGS_TO_MANY = BELONGS_TO_MANY;

var isAssociationColumn = function isAssociationColumn(columnType) {
  return columnType instanceof AssociationColumn;
};

exports.isAssociationColumn = isAssociationColumn;