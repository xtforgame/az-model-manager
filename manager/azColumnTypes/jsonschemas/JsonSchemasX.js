"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsonSchemasX = void 0;

var _path = _interopRequireDefault(require("path"));

var _liquidjs = require("liquidjs");

var _appRootPath = _interopRequireDefault(require("app-root-path"));

var _utils = require("../../../core/utils");

var _typeConfigs = require("./typeConfigs");

var _core = require("../../../core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const appRoot = _appRootPath.default.resolve('./');

class JsonSchemasX {
  constructor(dbSchemaName, rawSchemas) {
    _defineProperty(this, "rawSchemas", void 0);

    _defineProperty(this, "dbSchemaName", void 0);

    _defineProperty(this, "parsed", void 0);

    _defineProperty(this, "schemasMetadata", void 0);

    _defineProperty(this, "schemas", void 0);

    this.dbSchemaName = dbSchemaName;
    this.rawSchemas = rawSchemas;
    this.clear();
  }

  clear() {
    this.parsed = false;
    this.schemasMetadata = {
      models: {},
      associationModels: {},
      allModels: {}
    };
    this.schemas = {
      models: {},
      associationModels: {}
    };
  }

  static forEachSchema(tableType, models, modelCb, columnCb) {
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

  static normalizeRawSchemas(parsedTables, tableType, models) {
    JsonSchemasX.forEachSchema(tableType, models, (tableName, tableType, table) => {
      table.options = (0, _core.getNormalizedModelOptions)(tableName, tableType === 'associationModel' ? 'mn_' : 'tbl_', table.options || {});
      parsedTables[tableName] = {
        isAssociationModel: tableType === 'associationModel',
        modelOptions: table.options,
        columns: []
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
    });
    JsonSchemasX.forEachSchema(tableType, models, null, (tableName, tableType, table, columnName, column) => {
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

  static afterNormalizeRawSchemas(parsedTables, tableType, models, metadata, schemas) {
    JsonSchemasX.forEachSchema(tableType, models, (tableName, tableType, table) => {}, (tableName, tableType, table, columnName, column) => {});
  }

  static parseRawSchemas(schemasMetadata, rawSchemas, tableType, models) {
    JsonSchemasX.forEachSchema(tableType, models, null, (tableName, tableType, table, columnName, column) => {
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

  static toCoreModels(schemasMetadata, rawSchemas, tableType, models, resultModels) {
    JsonSchemasX.forEachSchema(tableType, models, (tableName, tableType, table) => {
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

  normalizeRawSchemas() {
    this.clear();

    if (!this.rawSchemas.models) {
      return Error(`bad json data: no models provided`);
    }

    this.schemas.models = _objectSpread({}, this.rawSchemas.models);

    if (this.rawSchemas.associationModels) {
      this.schemas.associationModels = _objectSpread({}, this.rawSchemas.associationModels);
    }

    const err = JsonSchemasX.normalizeRawSchemas(this.schemasMetadata.models, 'model', this.schemas.models);
    if (err) return err;
    return JsonSchemasX.normalizeRawSchemas(this.schemasMetadata.associationModels, 'associationModel', this.schemas.associationModels);
  }

  afterNormalizeRawSchemas() {
    this.schemas.models = _objectSpread({}, this.rawSchemas.models);

    if (this.rawSchemas.associationModels) {
      this.schemas.associationModels = _objectSpread({}, this.rawSchemas.associationModels);
    }

    const err = JsonSchemasX.afterNormalizeRawSchemas(this.schemasMetadata.models, 'model', this.schemas.models, this.schemasMetadata, this.schemas);
    if (err) return err;
    return JsonSchemasX.afterNormalizeRawSchemas(this.schemasMetadata.associationModels, 'associationModel', this.schemas.associationModels, this.schemasMetadata, this.schemas);
  }

  parseRawSchemas() {
    this.parsed = false;
    let err = this.normalizeRawSchemas();

    if (err) {
      return err;
    }

    err = this.afterNormalizeRawSchemas();

    if (err) {
      return err;
    }

    const {
      schemasMetadata,
      schemas
    } = this;
    err = JsonSchemasX.parseRawSchemas(schemasMetadata, schemas, 'model', this.schemas.models);
    if (err) return err;
    err = JsonSchemasX.parseRawSchemas(schemasMetadata, schemas, 'associationModel', this.schemas.associationModels);
    this.parsed = false;
    return err;
  }

  toCoreSchemas() {
    const result = {
      models: {},
      associationModels: {}
    };

    if (!this.parsed) {
      const err = this.parseRawSchemas();
      if (err) return err;
    }

    const {
      schemasMetadata,
      schemas
    } = this;
    let err = JsonSchemasX.toCoreModels(schemasMetadata, schemas, 'model', schemas.models, result.models);

    if (err) {
      return err;
    }

    err = JsonSchemasX.toCoreModels(schemasMetadata, schemas, 'associationModel', schemas.associationModels, result.associationModels);

    if (err) {
      return err;
    }

    return result;
  }

  buildModelTsFile(args = {}) {
    const {
      schemasMetadata,
      schemas
    } = this;
    const engine = new _liquidjs.Liquid({
      root: args.liquidRoot || _path.default.join(appRoot, 'liquids')
    });

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

    engine.plugin(function (Liquid) {
      this.registerFilter('capitalizeFirstLetter', _utils.capitalizeFirstLetter);
      this.registerFilter('toTsTypeExpression', column => {
        return _typeConfigs.typeConfigs[column.type[0]].getTsTypeExpression(column);
      });
      this.registerFilter('toTsTypeExpressionForCreation', column => {
        return _typeConfigs.typeConfigs[column.type[0]].getTsTypeExpressionForCreation(column);
      });
      this.registerFilter('getForeignKey', column => {
        return getForeignKey(column);
      });
      this.registerFilter('getForeignKeyTsTypeExpression', column => {
        const targetKey = getTargetKey(column);
        const c = schemas.models[column.type[1]].columns[targetKey];
        return _typeConfigs.typeConfigs[c.type[0]].getTsTypeExpressionForCreation(column);
      });
      this.registerFilter('hasForeignKey', column => {
        const foreignKey = getForeignKey(column);
        return !!foreignKey;
      });
      this.registerFilter('getOptionalMark', (column, optionalMark = '?') => {
        return column.extraOptions.requiredOnCreation ? '' : optionalMark;
      });
      this.registerFilter('debugPrint', value => {
        console.log('value :', value);
        return value;
      });
    });
    return engine.parseAndRender(`{% render 'main.liquid', schemasMetadata: schemasMetadata, schemas: schemas, orders: orders, models: models %}`, {
      schemasMetadata,
      schemas,
      orders: args.orders || [...Object.keys(schemas.models), ...Object.keys(schemas.associationModels)]
    });
  }

  parseSchemaFromDb(db) {
    const dbSchema = db.schemas.get(this.dbSchemaName);
    const table = db.get('tbl_account_link');
    dbSchema.tables.forEach(table => {
      this.parseTableFromDb(table);
    });
  }

  parseTableFromDb(table) {
    const columnNames = table.columns.map(c => {
      this.reportColumn(c);
      return c.name;
    });
    console.log('columnNames :', columnNames);
    const indexNames = table.indexes.map(i => {
      this.reportIndex(i);
      return i.name;
    });
    console.log('indexNames :', indexNames);
    const relatedTables = table.hasManyTables;
    console.log('relatedTables :', relatedTables);
  }

  reportColumn(column) {}

  reportIndex(index) {
    if (index.isPrimaryKey) {} else if (index.isUnique) {}
  }

}

exports.JsonSchemasX = JsonSchemasX;