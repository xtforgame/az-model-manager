"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forEachSchema = forEachSchema;
exports.beforeNormalizeRawSchemas = beforeNormalizeRawSchemas;
exports.normalizeRawSchemas = normalizeRawSchemas;
exports.afterNormalizeRawSchemas = afterNormalizeRawSchemas;
exports.parseRawSchemas = parseRawSchemas;
exports.toCoreModels = toCoreModels;
exports.getTargetKey = exports.getForeignKey = exports.getRealColumnName = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _typeConfigs = require("./typeConfigs");

var _core = require("../../../core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      columns: {}
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

    parsedTables[tableName].columns[columnName] = column;
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
    const columns = parsedTables[tableName].columns;
    Object.keys(columns).forEach(k => {
      const c = columns[k];
      const columnNameInDb = getRealColumnName(k, c);

      if (columnNameInDb) {
        c.columnNameInDb = columnNameInDb;
        c.isForeignKey = false;
      } else {
        const fk = getForeignKey(c);

        if (fk) {
          c.columnNameInDb = fk;
          c.isForeignKey = true;
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

    resultModels[tableName].columns[columnName] = parseResult;
  });
}