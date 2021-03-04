"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.typeConfigs = exports.toTypeForCreation = exports.toInterfaceType = exports.capitalize = exports.basicGetTsTypeExpression = exports.parseAssociationOptions = exports.basicToCoreColumn = exports.basicParse = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _columnTypes = require("../../../core/columnTypes");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const basicParse = (extraNumber = 0) => args => {
  const _args$column = args.column,
        {
    type
  } = _args$column,
        rest = _objectWithoutProperties(_args$column, ["type"]);

  if (!type.length) {
    return new Error('no type attribute');
  }

  if (type.length === 1 || type.length === 1 + extraNumber) {
    return _objectSpread(_objectSpread({}, rest), {}, {
      type
    });
  }

  return new Error(`wrong type length(${type.length})`);
};

exports.basicParse = basicParse;

const basicToCoreColumn = (dataType, extraNumber = 0) => args => {
  const _args$column2 = args.column,
        {
    type
  } = _args$column2,
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
      type: dataType(...type.slice(1))
    });
  }

  return new Error(`wrong type length(${type.length})`);
};

exports.basicToCoreColumn = basicToCoreColumn;

const parseAssociationOptions = args => {
  const targetTable = args.schemasMetadata.models[args.column.type[1]];

  if (!targetTable) {
    return new Error(`target table(${args.column.type[1]}) not found`);
  }

  if (args.column.type.length < 3) {
    return new Error('type.length < 3');
  }

  const options = args.column.type[2];
  const result = {};

  if (!options) {
    return new Error('wrong association options');
  }

  if (options.foreignKey) {
    if (typeof options.foreignKey !== 'string') {
      return new Error(`wrong association options: foreignKey(${options.foreignKey})`);
    }

    result.foreignKey = options.foreignKey;
  }

  if (options.onDelete) {
    if (options.onDelete !== 'SET NULL' && options.onDelete !== 'CASCADE') {
      return new Error(`wrong association options: onDelete(${options.onDelete})`);
    }

    result.onDelete = options.onDelete;
  } else {
    result.onDelete = 'CASCADE';
  }

  if (options.onUpdate) {
    if (options.onUpdate !== 'CASCADE') {
      return new Error(`wrong association options: onUpdate(${options.onUpdate})`);
    }

    result.onUpdate = options.onUpdate;
  } else {
    result.onUpdate = 'CASCADE';
  }

  return result;
};

exports.parseAssociationOptions = parseAssociationOptions;

const basicGetTsTypeExpression = tsType => () => tsType;

exports.basicGetTsTypeExpression = basicGetTsTypeExpression;

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

exports.capitalize = capitalize;

const toInterfaceType = str => `${capitalize(str)}I`;

exports.toInterfaceType = toInterfaceType;

const toTypeForCreation = str => `${capitalize(str)}CreationAttributes`;

exports.toTypeForCreation = toTypeForCreation;
let typeConfigs;
exports.typeConfigs = typeConfigs;
exports.typeConfigs = typeConfigs = {
  hasOne: {
    associationType: 'hasOne',
    normalize: args => undefined,
    parse: args => {
      const associationOptions = parseAssociationOptions(args);

      if (associationOptions instanceof Error) {
        return associationOptions;
      }

      const options = args.column.type[2];

      if (options.sourceKey) {
        associationOptions.sourceKey = options.sourceKey;
      } else {
        const primaryKey = args.schemasMetadata.models[args.tableName].primaryKey;

        if (!primaryKey || !args.table.columns[primaryKey]) {
          return new Error('no primaryKey or sourceKey provided');
        }

        associationOptions.sourceKey = args.schemasMetadata.models[args.tableName].primaryKey;
      }

      associationOptions.ammAs = args.columnName;
      associationOptions.as = args.columnName;
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: [args.column.type[0], args.column.type[1], associationOptions]
      });
    },
    toCoreColumn: args => {
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: (0, _columnTypes.HAS_ONE)(args.column.type[1], args.column.type[2])
      });
    },
    getTsTypeExpression: column => {
      return toInterfaceType(column.type[1]);
    },
    getTsTypeExpressionForCreation: column => {
      return toTypeForCreation(column.type[1]);
    }
  },
  hasMany: {
    associationType: 'hasMany',
    normalize: args => undefined,
    parse: args => {
      const associationOptions = parseAssociationOptions(args);

      if (associationOptions instanceof Error) {
        return associationOptions;
      }

      const options = args.column.type[2];

      if (options.sourceKey) {
        associationOptions.sourceKey = options.sourceKey;
      } else {
        const primaryKey = args.schemasMetadata.models[args.tableName].primaryKey;

        if (!primaryKey || !args.table.columns[primaryKey]) {
          return new Error('no primaryKey or sourceKey provided');
        }

        associationOptions.sourceKey = args.schemasMetadata.models[args.tableName].primaryKey;
      }

      associationOptions.ammAs = args.columnName;
      associationOptions.as = {
        plural: _sequelize.default.Utils.pluralize(associationOptions.ammAs),
        singular: _sequelize.default.Utils.singularize(associationOptions.ammAs)
      };
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: [args.column.type[0], args.column.type[1], associationOptions]
      });
    },
    toCoreColumn: args => {
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: (0, _columnTypes.HAS_MANY)(args.column.type[1], args.column.type[2])
      });
    },
    getTsTypeExpression: column => {
      return `${toInterfaceType(column.type[1])}[]`;
    },
    getTsTypeExpressionForCreation: column => {
      return `${toTypeForCreation(column.type[1])}[]`;
    }
  },
  belongsTo: {
    associationType: 'belongsTo',
    normalize: args => undefined,
    parse: args => {
      const associationOptions = parseAssociationOptions(args);

      if (associationOptions instanceof Error) {
        return associationOptions;
      }

      const options = args.column.type[2];

      if (options.targetKey) {
        associationOptions.targetKey = options.targetKey;
      } else {
        const targetTable = args.schemasMetadata.models[args.column.type[1]];
        const primaryKey = targetTable && targetTable.primaryKey;

        if (!primaryKey || !args.table.columns[primaryKey]) {
          return new Error('no primaryKey or targetKey provided');
        }

        associationOptions.targetKey = targetTable.primaryKey;
      }

      associationOptions.ammAs = args.columnName;
      associationOptions.as = args.columnName;
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: [args.column.type[0], args.column.type[1], associationOptions]
      });
    },
    toCoreColumn: args => {
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: (0, _columnTypes.BELONGS_TO)(args.column.type[1], args.column.type[2])
      });
    },
    getTsTypeExpression: column => {
      return toInterfaceType(column.type[1]);
    },
    getTsTypeExpressionForCreation: column => {
      return toTypeForCreation(column.type[1]);
    }
  },
  belongsToMany: {
    associationType: 'belongsToMany',
    normalize: args => undefined,
    parse: args => {
      const associationOptions = parseAssociationOptions(args);

      if (associationOptions instanceof Error) {
        return associationOptions;
      }

      const options = args.column.type[2];

      if (options.otherKey) {
        associationOptions.otherKey = options.otherKey;
      }

      associationOptions.onDelete = 'SET NULL';

      if (!options.through) {
        return new Error('no through provided');
      }

      associationOptions.through = options.through;
      let throughTableName = '';

      if (typeof associationOptions.through !== 'string') {
        throughTableName = associationOptions.through.ammModelName;
      } else {
        associationOptions.through = {
          ammModelName: associationOptions.through
        };
        throughTableName = associationOptions.through.ammModelName;
      }

      if (!args.schemas.associationModels || !args.schemas.associationModels[throughTableName]) {
        return new Error(`associationModels not found(${throughTableName})`);
      }

      const ammThroughAs = associationOptions.through.ammThroughAs;

      if (ammThroughAs && args.table.columns[ammThroughAs]) {
        return new Error(`ammThroughAs name already taken(${ammThroughAs})`);
      }

      associationOptions.ammAs = args.columnName;
      associationOptions.as = {
        plural: _sequelize.default.Utils.pluralize(associationOptions.ammAs),
        singular: _sequelize.default.Utils.singularize(associationOptions.ammAs)
      };
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: [args.column.type[0], args.column.type[1], associationOptions]
      });
    },
    toCoreColumn: args => {
      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: (0, _columnTypes.BELONGS_TO_MANY)(args.column.type[1], args.column.type[2])
      });
    },
    getTsTypeExpression: column => {
      return `${toInterfaceType(column.type[1])}[]`;
    },
    getTsTypeExpressionForCreation: column => {
      return `${toTypeForCreation(column.type[1])}[]`;
    }
  },
  integer: {
    sequleizeDataType: _sequelize.default.INTEGER,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.INTEGER),
    getTsTypeExpression: basicGetTsTypeExpression('number'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('number')
  },
  bigint: {
    sequleizeDataType: _sequelize.default.BIGINT,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.BIGINT),
    getTsTypeExpression: basicGetTsTypeExpression('string'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('string')
  },
  decimal: {
    sequleizeDataType: _sequelize.default.DECIMAL,
    normalize: args => undefined,
    parse: basicParse(2),
    toCoreColumn: basicToCoreColumn(_sequelize.default.DECIMAL, 2),
    getTsTypeExpression: basicGetTsTypeExpression('number'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('number')
  },
  real: {
    sequleizeDataType: _sequelize.default.REAL,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.REAL),
    getTsTypeExpression: basicGetTsTypeExpression('number'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('number')
  },
  float: {
    sequleizeDataType: _sequelize.default.FLOAT,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.FLOAT),
    getTsTypeExpression: basicGetTsTypeExpression('number'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('number')
  },
  double: {
    sequleizeDataType: _sequelize.default.DOUBLE,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.DOUBLE),
    getTsTypeExpression: basicGetTsTypeExpression('number'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('number')
  },
  boolean: {
    sequleizeDataType: _sequelize.default.BOOLEAN,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.BOOLEAN),
    getTsTypeExpression: basicGetTsTypeExpression('boolean'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('boolean')
  },
  string: {
    sequleizeDataType: _sequelize.default.STRING,
    normalize: args => undefined,
    parse: basicParse(1),
    toCoreColumn: basicToCoreColumn(_sequelize.default.STRING, 1),
    getTsTypeExpression: basicGetTsTypeExpression('string'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('string')
  },
  binary: {
    sequleizeDataType: _sequelize.default.BLOB,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.BLOB),
    getTsTypeExpression: basicGetTsTypeExpression('Buffer'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('Buffer')
  },
  text: {
    sequleizeDataType: _sequelize.default.TEXT,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.TEXT),
    getTsTypeExpression: basicGetTsTypeExpression('string'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('string')
  },
  date: {
    sequleizeDataType: _sequelize.default.DATE,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.DATE),
    getTsTypeExpression: basicGetTsTypeExpression('Date'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('Date')
  },
  dateonly: {
    sequleizeDataType: _sequelize.default.DATEONLY,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.DATEONLY),
    getTsTypeExpression: basicGetTsTypeExpression('Date'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('Date')
  },
  uuid: {
    sequleizeDataType: _sequelize.default.UUID,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.UUID),
    getTsTypeExpression: basicGetTsTypeExpression('string'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('string')
  },
  range: {
    sequleizeDataType: _sequelize.default.RANGE,
    normalize: args => undefined,
    parse: basicParse(1),
    toCoreColumn: args => {
      const _args$column3 = args.column,
            {
        type
      } = _args$column3,
            rest = _objectWithoutProperties(_args$column3, ["type"]);

      if (type.length !== 2) {
        return new Error('type.length !== 2');
      }

      const rangeTypes = {
        integer: _sequelize.default.INTEGER,
        bigint: _sequelize.default.BIGINT,
        decimal: _sequelize.default.DECIMAL,
        date: _sequelize.default.DATE,
        dateonly: _sequelize.default.DATEONLY
      };

      if (!rangeTypes[type[1]]) {
        return new Error(`wrong range item type(${type[1]})`);
      }

      const itemColumn = typeConfigs[type[1]].toCoreColumn(_objectSpread(_objectSpread({}, args), {}, {
        column: _objectSpread(_objectSpread({}, args.column), {}, {
          type: [type[1]]
        })
      }));

      if (itemColumn instanceof Error) {
        return itemColumn;
      }

      return _objectSpread(_objectSpread({}, args.column), {}, {
        type: _sequelize.default.RANGE(itemColumn.type)
      });
    },
    getTsTypeExpression: column => {
      const rangeTypes = {
        integer: '[number, number]',
        bigint: '[string, string]',
        decimal: '[number, number]',
        date: '[Date, Date]',
        dateonly: '[Date, Date]'
      };
      return rangeTypes[column.type[1]];
    },
    getTsTypeExpressionForCreation: column => {
      const rangeTypes = {
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
    sequleizeDataType: _sequelize.default.JSON,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.JSON),
    getTsTypeExpression: basicGetTsTypeExpression('any'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('any')
  },
  jsonb: {
    sequleizeDataType: _sequelize.default.JSONB,
    normalize: args => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(_sequelize.default.JSONB),
    getTsTypeExpression: basicGetTsTypeExpression('any'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('any')
  }
};