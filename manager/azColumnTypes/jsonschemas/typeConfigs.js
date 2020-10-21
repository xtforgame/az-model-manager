"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.typeConfigs = exports.toInterfaceType = exports.capitalize = exports.basicFetTsTypeExpression = exports.parseAssociationOptions = exports.basicToCoreColumn = exports.basicParse = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _columnTypes = require("../../../core/columnTypes");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var basicParse = function basicParse() {
  var extraNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return function (args) {
    var _args$column = args.column,
        type = _args$column.type,
        rest = _objectWithoutProperties(_args$column, ["type"]);

    if (!type.length) {
      return new Error('no type attribute');
    }

    if (type.length === 1 || type.length === 1 + extraNumber) {
      return _objectSpread(_objectSpread({}, rest), {}, {
        type: type
      });
    }

    return new Error("wrong type length(".concat(type.length, ")"));
  };
};

exports.basicParse = basicParse;

var basicToCoreColumn = function basicToCoreColumn(dataType) {
  var extraNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return function (args) {
    var _args$column2 = args.column,
        type = _args$column2.type,
        rest = _objectWithoutProperties(_args$column2, ["type"]);

    if (!type.length) {
      return new Error('no type attribute');
    }

    if (type.length === 1) {
      return _objectSpread(_objectSpread({}, rest), {}, {
        type: dataType
      });
    } else if (type.length === 1 + extraNumber) {
      return _objectSpread(_objectSpread({}, rest), {}, {
        type: dataType.apply(void 0, _toConsumableArray(type.slice(1)))
      });
    }

    return new Error("wrong type length(".concat(type.length, ")"));
  };
};

exports.basicToCoreColumn = basicToCoreColumn;

var parseAssociationOptions = function parseAssociationOptions(args) {
  var targetTable = args.schemasMetadata.models[args.column.type[1]];

  if (!targetTable) {
    return new Error("target table(".concat(args.column.type[1], ") not found"));
  }

  if (args.column.type.length < 3) {
    return new Error('type.length < 3');
  }

  var options = args.column.type[2];
  var result = {};

  if (!options) {
    return new Error('wrong association options');
  }

  if (options.foreignKey) {
    if (typeof options.foreignKey !== 'string') {
      return new Error("wrong association options: foreignKey(".concat(options.foreignKey, ")"));
    }

    result.foreignKey = options.foreignKey;
  }

  if (options.onDelete) {
    if (options.onDelete !== 'SET NULL' && options.onDelete !== 'CASCADE') {
      return new Error("wrong association options: onDelete(".concat(options.onDelete, ")"));
    }

    result.onDelete = options.onDelete;
  } else {
    result.onDelete = 'CASCADE';
  }

  if (options.onUpdate) {
    if (options.onUpdate !== 'CASCADE') {
      return new Error("wrong association options: onUpdate(".concat(options.onUpdate, ")"));
    }

    result.onUpdate = options.onUpdate;
  } else {
    result.onUpdate = 'CASCADE';
  }

  return result;
};

exports.parseAssociationOptions = parseAssociationOptions;

var basicFetTsTypeExpression = function basicFetTsTypeExpression(tsType) {
  return function () {
    return tsType;
  };
};

exports.basicFetTsTypeExpression = basicFetTsTypeExpression;

var capitalize = function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

exports.capitalize = capitalize;

var toInterfaceType = function toInterfaceType(str) {
  return "".concat(capitalize(str), "I");
};

exports.toInterfaceType = toInterfaceType;
var typeConfigs;
exports.typeConfigs = typeConfigs;
exports.typeConfigs = typeConfigs = {
  hasOne: {
    associationType: 'hasOne',
    normalize: function normalize(args) {
      return undefined;
    },
    parse: function parse(args) {
      var associationOptions = parseAssociationOptions(args);

      if (associationOptions instanceof Error) {
        return associationOptions;
      }

      var options = args.column.type[2];

      if (options.sourceKey) {
        associationOptions.sourceKey = options.sourceKey;
      } else {
        var primaryKey = args.schemasMetadata.models[args.tableName].primaryKey;

        if (!primaryKey || !args.table.columns[primaryKey]) {
          return new Error('no primaryKey or sourceKey provided');
        }

        associationOptions.sourceKey = args.schemasMetadata.models[args.tableName].primaryKey;
      }

      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: [args.column.type[0], args.column.type[1], associationOptions]
      });
    },
    toCoreColumn: function toCoreColumn(args) {
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: (0, _columnTypes.HAS_ONE)(args.column.type[1], args.column.type[2])
      });
    },
    getTsTypeExpression: function getTsTypeExpression(column) {
      return toInterfaceType(column.type[1]);
    }
  },
  hasMany: {
    associationType: 'hasMany',
    normalize: function normalize(args) {
      return undefined;
    },
    parse: function parse(args) {
      var associationOptions = parseAssociationOptions(args);

      if (associationOptions instanceof Error) {
        return associationOptions;
      }

      var options = args.column.type[2];

      if (options.sourceKey) {
        associationOptions.sourceKey = options.sourceKey;
      } else {
        var primaryKey = args.schemasMetadata.models[args.tableName].primaryKey;

        if (!primaryKey || !args.table.columns[primaryKey]) {
          return new Error('no primaryKey or sourceKey provided');
        }

        associationOptions.sourceKey = args.schemasMetadata.models[args.tableName].primaryKey;
      }

      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: [args.column.type[0], args.column.type[1], associationOptions]
      });
    },
    toCoreColumn: function toCoreColumn(args) {
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: (0, _columnTypes.HAS_MANY)(args.column.type[1], args.column.type[2])
      });
    },
    getTsTypeExpression: function getTsTypeExpression(column) {
      return "".concat(toInterfaceType(column.type[1]), "[]");
    }
  },
  belongsTo: {
    associationType: 'belongsTo',
    normalize: function normalize(args) {
      return undefined;
    },
    parse: function parse(args) {
      var associationOptions = parseAssociationOptions(args);

      if (associationOptions instanceof Error) {
        return associationOptions;
      }

      var options = args.column.type[2];

      if (options.targetKey) {
        associationOptions.targetKey = options.targetKey;
      } else {
        var targetTable = args.schemasMetadata.models[args.column.type[1]];
        var primaryKey = targetTable && targetTable.primaryKey;

        if (!primaryKey || !args.table.columns[primaryKey]) {
          return new Error('no primaryKey or targetKey provided');
        }

        associationOptions.targetKey = targetTable.primaryKey;
      }

      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: [args.column.type[0], args.column.type[1], associationOptions]
      });
    },
    toCoreColumn: function toCoreColumn(args) {
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: (0, _columnTypes.BELONGS_TO)(args.column.type[1], args.column.type[2])
      });
    },
    getTsTypeExpression: function getTsTypeExpression(column) {
      return toInterfaceType(column.type[1]);
    }
  },
  belongsToMany: {
    associationType: 'belongsToMany',
    normalize: function normalize(args) {
      return undefined;
    },
    parse: function parse(args) {
      var associationOptions = parseAssociationOptions(args);

      if (associationOptions instanceof Error) {
        return associationOptions;
      }

      var options = args.column.type[2];

      if (options.otherKey) {
        associationOptions.otherKey = options.otherKey;
      }

      associationOptions.onDelete = 'SET NULL';

      if (!options.through) {
        return new Error('no through provided');
      }

      associationOptions.through = options.through;
      var throughTableName = '';

      if (typeof associationOptions.through !== 'string') {
        throughTableName = associationOptions.through.ammModelName;
      } else {
        associationOptions.through = {
          ammModelName: associationOptions.through
        };
        throughTableName = associationOptions.through.ammModelName;
      }

      if (!args.schemas.associationModels || !args.schemas.associationModels[throughTableName]) {
        return new Error("associationModels not found(".concat(throughTableName, ")"));
      }

      var ammThroughAs = associationOptions.through.ammThroughAs;

      if (ammThroughAs && args.table.columns[ammThroughAs]) {
        return new Error("ammThroughAs name already taken(".concat(ammThroughAs, ")"));
      }

      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: [args.column.type[0], args.column.type[1], associationOptions]
      });
    },
    toCoreColumn: function toCoreColumn(args) {
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: (0, _columnTypes.BELONGS_TO_MANY)(args.column.type[1], args.column.type[2])
      });
    },
    getTsTypeExpression: function getTsTypeExpression(column) {
      return "".concat(toInterfaceType(column.type[1]), "[]");
    }
  },
  integer: {
    sequleizeDataType: _sequelize["default"].INTEGER,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].INTEGER),
    getTsTypeExpression: basicFetTsTypeExpression('number')
  },
  bigint: {
    sequleizeDataType: _sequelize["default"].BIGINT,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].BIGINT),
    getTsTypeExpression: basicFetTsTypeExpression('string')
  },
  decimal: {
    sequleizeDataType: _sequelize["default"].DECIMAL,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(2),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].DECIMAL, 2),
    getTsTypeExpression: basicFetTsTypeExpression('number')
  },
  real: {
    sequleizeDataType: _sequelize["default"].REAL,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].REAL),
    getTsTypeExpression: basicFetTsTypeExpression('number')
  },
  "float": {
    sequleizeDataType: _sequelize["default"].FLOAT,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].FLOAT),
    getTsTypeExpression: basicFetTsTypeExpression('number')
  },
  "double": {
    sequleizeDataType: _sequelize["default"].DOUBLE,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].DOUBLE),
    getTsTypeExpression: basicFetTsTypeExpression('number')
  },
  "boolean": {
    sequleizeDataType: _sequelize["default"].BOOLEAN,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].BOOLEAN),
    getTsTypeExpression: basicFetTsTypeExpression('boolean')
  },
  string: {
    sequleizeDataType: _sequelize["default"].STRING,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(1),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].STRING, 1),
    getTsTypeExpression: basicFetTsTypeExpression('string')
  },
  binary: {
    sequleizeDataType: _sequelize["default"].BLOB,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].BLOB),
    getTsTypeExpression: basicFetTsTypeExpression('Buffer')
  },
  text: {
    sequleizeDataType: _sequelize["default"].TEXT,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].TEXT),
    getTsTypeExpression: basicFetTsTypeExpression('string')
  },
  date: {
    sequleizeDataType: _sequelize["default"].DATE,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].DATE),
    getTsTypeExpression: basicFetTsTypeExpression('Date')
  },
  dateonly: {
    sequleizeDataType: _sequelize["default"].DATEONLY,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].DATEONLY),
    getTsTypeExpression: basicFetTsTypeExpression('Date')
  },
  uuid: {
    sequleizeDataType: _sequelize["default"].UUID,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].UUID),
    getTsTypeExpression: basicFetTsTypeExpression('string')
  },
  range: {
    sequleizeDataType: _sequelize["default"].RANGE,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(1),
    toCoreColumn: function toCoreColumn(args) {
      var _args$column3 = args.column,
          type = _args$column3.type,
          rest = _objectWithoutProperties(_args$column3, ["type"]);

      if (type.length !== 2) {
        return new Error('type.length !== 2');
      }

      var rangeTypes = {
        integer: _sequelize["default"].INTEGER,
        bigint: _sequelize["default"].BIGINT,
        decimal: _sequelize["default"].DECIMAL,
        date: _sequelize["default"].DATE,
        dateonly: _sequelize["default"].DATEONLY
      };

      if (!rangeTypes[type[1]]) {
        return new Error("wrong range item type(".concat(type[1], ")"));
      }

      var itemColumn = typeConfigs[type[1]].toCoreColumn(_objectSpread(_objectSpread({}, args), {}, {
        column: _objectSpread(_objectSpread({}, args.column), {}, {
          type: [type[1]]
        })
      }));

      if (itemColumn instanceof Error) {
        return itemColumn;
      }

      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: _sequelize["default"].RANGE(itemColumn.type)
      });
    },
    getTsTypeExpression: function getTsTypeExpression(column) {
      var rangeTypes = {
        integer: '[number, number]',
        bigint: '[string, string]',
        decimal: '[number, number]',
        date: '[Date, Date]',
        dateonly: '[Date, Date]'
      };
      return rangeTypes[column.type[1]];
    }
  },
  json: {
    sequleizeDataType: _sequelize["default"].JSON,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].JSON),
    getTsTypeExpression: basicFetTsTypeExpression('any')
  },
  jsonb: {
    sequleizeDataType: _sequelize["default"].JSONB,
    normalize: function normalize(args) {
      return undefined;
    },
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize["default"].JSONB),
    getTsTypeExpression: basicFetTsTypeExpression('any')
  }
};