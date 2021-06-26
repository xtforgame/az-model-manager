"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forEachSchema = forEachSchema;
exports.beforeNormalizeRawSchemas = beforeNormalizeRawSchemas;
exports.normalizeRawSchemas = normalizeRawSchemas;
exports.afterNormalizeRawSchemas = afterNormalizeRawSchemas;
exports.parseRawSchemas = parseRawSchemas;
exports.afterParseRawSchemas = afterParseRawSchemas;
exports.toCoreModels = toCoreModels;
exports.getTargetKey = exports.getForeignKey = exports.getRealColumnName = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _IJsonSchemas = require("./IJsonSchemas");

var _typeConfigs = require("./typeConfigs");

var _core = require("../../../core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const getRealColumnName = (columnName, column) => {
  const {
    associationType
  } = _typeConfigs.typeConfigs[column.type[0]];

  if (associationType) {
    return null;
  }

  return _sequelize.default.Utils.underscore(columnName);
};

exports.getRealColumnName = getRealColumnName;

const getForeignKey = column => {
  const {
    associationType
  } = _typeConfigs.typeConfigs[column.type[0]];

  if (!associationType) {
    return null;
  }

  if (associationType === 'belongsTo') {
    const option = column.type[2];

    if (option.foreignKey) {
      if (typeof option.foreignKey === 'string') {
        return option.foreignKey;
      }

      return option.foreignKey.name;
    }
  }

  return null;
};

exports.getForeignKey = getForeignKey;

const getTargetKey = column => {
  const {
    associationType
  } = _typeConfigs.typeConfigs[column.type[0]];

  if (!associationType) {
    return null;
  }

  if (associationType === 'belongsTo') {
    const option = column.type[2];

    if (option.targetKey) {
      return option.targetKey;
    }
  }

  return null;
};

exports.getTargetKey = getTargetKey;

function forEachSchema(tableType, models, modelCb, columnCb) {
  const modelKeys = Object.keys(models);

  for (let i = 0; i < modelKeys.length; i++) {
    const tableName = modelKeys[i];
    const table = models[tableName];
    let err;

    if (modelCb) {
      modelCb(tableName, tableType, table);
    }

    if (err) return err;

    if (!columnCb) {
      continue;
    }

    const rawColumns = table.columns;
    const rawColumnKeys = Object.keys(rawColumns);

    for (let j = 0; j < rawColumnKeys.length; j++) {
      const columnName = rawColumnKeys[j];
      const column = rawColumns[columnName];
      err = columnCb(tableName, tableType, table, columnName, column);
      if (err) return err;
    }
  }
}

function beforeNormalizeRawSchemas(metadata, schemas, rawSchemas) {
  if (!rawSchemas.options) {
    rawSchemas.options = {};
  }

  if (!rawSchemas.options.model) {
    rawSchemas.options.model = {};
  }

  if (!rawSchemas.options.model.tablePrefix) {
    rawSchemas.options.model.tablePrefix = 'tbl_';
  }

  if (!rawSchemas.options.associationModel) {
    rawSchemas.options.associationModel = {};
  }

  if (!rawSchemas.options.associationModel.tablePrefix) {
    rawSchemas.options.associationModel.tablePrefix = 'mn_';
  }

  schemas.options = rawSchemas.options;
}

function normalizeRawSchemas(parsedTables, tableType, models, schemas, rawSchemas) {
  forEachSchema(tableType, models, (tableName, tableType, table) => {
    table.options = (0, _core.getNormalizedModelOptions)(tableName, tableType === 'associationModel' ? schemas.options?.associationModel?.tablePrefix : schemas.options?.model?.tablePrefix, table.options || {});
    parsedTables[tableName] = {
      isAssociationModel: tableType === 'associationModel',
      modelOptions: table.options,
      columns: {},
      indexes: {}
    };
  }, (tableName, tableType, table, columnName, column) => {
    if (typeof column === 'string' || Array.isArray(column)) {
      column = {
        type: column
      };
    }

    table.columns[columnName] = column;

    if (!column.type) {
      return Error(`no type name: table(${tableName}), column(${columnName})`);
    }

    if (typeof column.type === 'string') {
      column.type = [column.type];
    }

    column.extraOptions = column.extraOptions || {};

    if (column.primaryKey) {
      parsedTables[tableName].primaryKey = columnName;
    }

    if (!Array.isArray(column.type) || !column.type.length || typeof column.type[0] !== 'string') {
      return Error(`bad type name: table(${tableName}), column(${columnName})`);
    }

    const typeName = column.type[0];
    const typeConfig = _typeConfigs.typeConfigs[typeName];

    if (!typeConfig) {
      return Error(`unknown type name: table(${tableName}), column(${columnName}), type(${typeName})`);
    }

    parsedTables[tableName].columns[columnName] = _objectSpread({}, column);
  });
  forEachSchema(tableType, models, null, (tableName, tableType, table, columnName, column) => {
    const typeName = column.type[0];
    const typeConfig = _typeConfigs.typeConfigs[typeName];
    const err = typeConfig.normalize({
      table: table,
      tableType,
      tableName,
      column,
      columnName
    });

    if (err) {
      return err;
    }
  });
}

function afterNormalizeRawSchemas(parsedTables, tableType, models, metadata, schemas) {
  forEachSchema(tableType, models, (tableName, tableType, table) => {
    parsedTables[tableName].tableNameInDb = parsedTables[tableName].modelOptions.tableName;
  }, (tableName, tableType, table, columnName, column) => {});
  forEachSchema(tableType, models, null, (tableName, tableType, table, columnName, column) => {
    if (column.type[0] === 'belongsTo') {
      const refTableMetadata = metadata.allModels[column.type[1]];

      if (refTableMetadata.primaryKey) {
        const associationOptions = (0, _typeConfigs.parseAssociationOptions)({
          table: table,
          tableType,
          tableName,
          column,
          columnName,
          schemasMetadata: metadata,
          schemas: schemas
        });

        if (associationOptions instanceof Error) {
          return;
        }

        const foreignKey = associationOptions.foreignKey;
        const refTable = refTableMetadata.isAssociationModel ? schemas.associationModels[column.type[1]] : schemas.models[column.type[1]];

        if (!table.columns[foreignKey] && refTable) {
          if (!refTableMetadata.primaryKey) {
            return new Error('no primaryKey for belongsTo association');
          }

          const primaryKeyColumn = refTable.columns[refTableMetadata.primaryKey];
          table.columns[foreignKey] = {
            type: primaryKeyColumn.type,
            ammReferences: {
              model: column.type[1],
              key: refTableMetadata.primaryKey,
              autogenerated: true
            },
            extraOptions: {}
          };
          parsedTables[tableName].columns[foreignKey] = _objectSpread({}, column);
        }
      }
    } else if (column.type[0] === 'belongsToMany') {
      const c = _typeConfigs.typeConfigs.belongsToMany.parse({
        table: table,
        tableType,
        tableName,
        column,
        columnName,
        schemasMetadata: metadata,
        schemas: schemas
      });

      const associationOptions = c.type[2];
      const {
        foreignKey,
        through: {
          ammModelName,
          ammThroughTableColumnAs
        }
      } = associationOptions;
      const associationModel = schemas.associationModels[ammModelName];
      metadata.associationModels[ammModelName].columns[foreignKey] = _objectSpread({}, associationModel.columns[ammThroughTableColumnAs]);
    }
  });
  forEachSchema(tableType, models, (tableName, tableType, table) => {
    const columns = parsedTables[tableName].columns;
    Object.keys(columns).forEach(k => {
      const c = columns[k];
      const columnNameInDb = getRealColumnName(k, c);

      if (columnNameInDb) {
        c.columnNameInDb = columnNameInDb;
        c.isForeignKey = false;
        c.isAssociationColumn = false;
      } else {
        const fk = getForeignKey(c);

        if (fk) {
          c.columnNameInDb = fk;
          c.isForeignKey = true;
          c.isAssociationColumn = true;
        }
      }
    });
  }, (tableName, tableType, table, columnName, column) => {});
}

function parseRawSchemas(schemasMetadata, rawSchemas, tableType, models) {
  forEachSchema(tableType, models, null, (tableName, tableType, table, columnName, column) => {
    const typeName = column.type[0];
    const typeConfig = _typeConfigs.typeConfigs[typeName];
    const result = typeConfig.parse({
      schemasMetadata,
      schemas: rawSchemas,
      table: table,
      tableType,
      tableName,
      column,
      columnName
    });

    if (result instanceof Error) {
      return result;
    }

    table.columns[columnName] = result;
  });
}

function afterParseRawSchemas(parsedTables, tableType, models, metadata, schemas) {
  forEachSchema(tableType, models, (tableName, tableType, table) => {}, (tableName, tableType, table, columnName, column) => {});
  forEachSchema(tableType, models, (tableName, tableType, table) => {
    const modelMetadata = metadata.allModels[tableName];
    table.options.indexes = table.options.indexes || [];
    ['created_at', 'updated_at', 'deleted_at'].map(k => {
      const index = table.options.indexes.find(i => i.fields && i.fields.length === 1 && i.fields[0] === k);

      if (!index) {
        modelMetadata.tableNameInDb;
        table.options.indexes.push({
          name: `${modelMetadata.tableNameInDb}_${k}`,
          fields: [k]
        });
      }
    });
    modelMetadata.indexes = table.options.indexes.map(i => _objectSpread(_objectSpread({}, i), {}, {
      columns: i.fields?.map(f => typeof f === 'string' ? f : f.name)
    })).reduce((m, i) => _objectSpread(_objectSpread({}, m), {}, {
      [i.name]: i
    }), {});
  }, (tableName, tableType, table, columnName, column) => {
    const modelMetadata = metadata.allModels[tableName];

    if (column.ammReferences) {
      const columnMetadata = modelMetadata.columns[columnName];
      const index = table.options.indexes.find(i => i.fields && i.fields.length === 1 && i.fields[0] === columnMetadata.columnNameInDb);

      if (!index) {
        modelMetadata.tableNameInDb;
        table.options.indexes.push({
          name: `${modelMetadata.tableNameInDb}_${columnMetadata.columnNameInDb}`,
          fields: [columnMetadata.columnNameInDb]
        });
      }
    }
  });
}

function toCoreModels(schemasMetadata, rawSchemas, tableType, models, resultModels) {
  forEachSchema(tableType, models, (tableName, tableType, table) => {
    resultModels[tableName] = {
      columns: {},
      options: table.options
    };
  }, (tableName, tableType, table, columnName, column) => {
    const typeName = column.type[0];
    const typeConfig = _typeConfigs.typeConfigs[typeName];
    const parseResult = typeConfig.toCoreColumn({
      schemasMetadata,
      schemas: rawSchemas,
      table: table,
      tableType: 'associationModel',
      tableName,
      column,
      columnName
    });

    if (parseResult instanceof Error) {
      return Error(`parse type error: table(${tableName}), column(${columnName}), type(${typeName}), error: ${parseResult.message}`);
    }

    const mod = () => {
      if (column.ammReferences) {
        const modelName = column.ammReferences.model;

        if (!modelName) {
          return;
        }

        const metadata = schemasMetadata.allModels[modelName];

        if (!metadata) {
          return;
        }

        const columnMetadata = metadata.columns[column.ammReferences.key || metadata.primaryKey];
        parseResult.references = {
          model: metadata.modelOptions.tableName,
          key: columnMetadata && columnMetadata.columnNameInDb,
          deferrable: (0, _IJsonSchemas.toSqlzDeferrable)(column.ammReferences.deferrable)
        };
      }
    };

    mod();
    resultModels[tableName].columns[columnName] = parseResult;
  });
}