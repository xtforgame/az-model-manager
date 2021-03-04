"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAssociationColumn = exports.BELONGS_TO_MANY = exports.BELONGS_TO = exports.HAS_MANY = exports.HAS_ONE = exports.ASSOCIATION = exports.AssociationColumn = exports.associations = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const associations = ['hasOne', 'hasMany', 'belongsTo', 'belongsToMany'];
exports.associations = associations;

class AssociationColumn {
  constructor(type, targetModel, options = {}, extraOptions = {}) {
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

  setAs(as) {
    this.as = as;
  }

  warn(link, text) {}

}

exports.AssociationColumn = AssociationColumn;

const ASSOCIATION = (type, targetModel, options, extraOptions = {}) => {
  if (!type) {
    throw new Error('ASSOCIATION must has a type argument');
  }

  return new AssociationColumn(type, targetModel, options, extraOptions);
};

exports.ASSOCIATION = ASSOCIATION;

const HAS_ONE = (targetModel, options) => ASSOCIATION(HAS_ONE.type, targetModel, options);

exports.HAS_ONE = HAS_ONE;
HAS_ONE.type = 'hasOne';

const HAS_MANY = (targetModel, options) => ASSOCIATION(HAS_MANY.type, targetModel, options);

exports.HAS_MANY = HAS_MANY;
HAS_MANY.type = 'hasMany';

const BELONGS_TO = (targetModel, options) => ASSOCIATION(BELONGS_TO.type, targetModel, options);

exports.BELONGS_TO = BELONGS_TO;
BELONGS_TO.type = 'belongsTo';

const BELONGS_TO_MANY = (targetModel, o) => {
  const options = _objectSpread({}, o);

  const extraOptions = {};

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

const isAssociationColumn = columnType => columnType instanceof AssociationColumn;

exports.isAssociationColumn = isAssociationColumn;