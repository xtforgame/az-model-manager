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

var _JsonSchemasXHelpers = require("./JsonSchemasXHelpers");

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

  normalizeRawSchemas() {
    this.clear();

    if (!this.rawSchemas.models) {
      return Error(`bad json data: no models provided`);
    }

    this.schemas.models = _objectSpread({}, this.rawSchemas.models);

    if (this.rawSchemas.associationModels) {
      this.schemas.associationModels = _objectSpread({}, this.rawSchemas.associationModels);
    }

    let err = (0, _JsonSchemasXHelpers.beforeNormalizeRawSchemas)(this.schemasMetadata, this.schemas, this.rawSchemas);
    if (err) return err;
    err = (0, _JsonSchemasXHelpers.normalizeRawSchemas)(this.schemasMetadata.models, 'model', this.schemas.models, this.schemas, this.rawSchemas);
    if (err) return err;
    return (0, _JsonSchemasXHelpers.normalizeRawSchemas)(this.schemasMetadata.associationModels, 'associationModel', this.schemas.associationModels, this.schemas, this.rawSchemas);
  }

  afterNormalizeRawSchemas() {
    this.schemas.models = _objectSpread({}, this.rawSchemas.models);

    if (this.rawSchemas.associationModels) {
      this.schemas.associationModels = _objectSpread({}, this.rawSchemas.associationModels);
    }

    this.schemasMetadata.allModels = _objectSpread(_objectSpread({}, this.schemasMetadata.models), this.schemasMetadata.associationModels);
    let err = (0, _JsonSchemasXHelpers.afterNormalizeRawSchemas)(this.schemasMetadata.models, 'model', this.schemas.models, this.schemasMetadata, this.schemas);
    if (err) return err;
    err = (0, _JsonSchemasXHelpers.afterNormalizeRawSchemas)(this.schemasMetadata.associationModels, 'associationModel', this.schemas.associationModels, this.schemasMetadata, this.schemas);
    if (err) return err;
  }

  afterParseRawSchemas() {
    let err = (0, _JsonSchemasXHelpers.afterParseRawSchemas)(this.schemasMetadata.models, 'model', this.schemas.models, this.schemasMetadata, this.schemas);
    if (err) return err;
    err = (0, _JsonSchemasXHelpers.afterParseRawSchemas)(this.schemasMetadata.associationModels, 'associationModel', this.schemas.associationModels, this.schemasMetadata, this.schemas);
    if (err) return err;
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
    err = (0, _JsonSchemasXHelpers.parseRawSchemas)(schemasMetadata, schemas, 'model', this.schemas.models);
    if (err) return err;
    err = (0, _JsonSchemasXHelpers.parseRawSchemas)(schemasMetadata, schemas, 'associationModel', this.schemas.associationModels);
    this.parsed = false;
    err = this.afterParseRawSchemas();
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
    this.rawSchemas.options;
    result.options = this.schemas.options;
    let err = (0, _JsonSchemasXHelpers.toCoreModels)(schemasMetadata, schemas, 'model', schemas.models, result.models);

    if (err) {
      return err;
    }

    err = (0, _JsonSchemasXHelpers.toCoreModels)(schemasMetadata, schemas, 'associationModel', schemas.associationModels, result.associationModels);

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
    engine.plugin(function (Liquid) {
      this.registerFilter('capitalizeFirstLetter', _utils.capitalizeFirstLetter);
      this.registerFilter('toTsTypeExpression', column => {
        return _typeConfigs.typeConfigs[column.type[0]].getTsTypeExpression(column);
      });
      this.registerFilter('toTsTypeExpressionForCreation', column => {
        return _typeConfigs.typeConfigs[column.type[0]].getTsTypeExpressionForCreation(column);
      });
      this.registerFilter('getForeignKey', column => {
        return (0, _JsonSchemasXHelpers.getForeignKey)(column);
      });
      this.registerFilter('getForeignKeyTsTypeExpression', column => {
        const targetKey = (0, _JsonSchemasXHelpers.getTargetKey)(column);
        const c = schemas.models[column.type[1]].columns[targetKey];
        return _typeConfigs.typeConfigs[c.type[0]].getTsTypeExpressionForCreation(column);
      });
      this.registerFilter('hasForeignKey', (column, model) => {
        const foreignKey = (0, _JsonSchemasXHelpers.getForeignKey)(column);

        if (foreignKey && model.columns[foreignKey]) {
          return false;
        }

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

  compareDb(db) {
    const dbSchema = db.schemas.get(this.dbSchemaName);
    const allModelMetadatas = Object.values(this.schemasMetadata.allModels);
    const missedTables = [];
    const missedColumn = [];
    allModelMetadatas.forEach(model => {
      const table = dbSchema.tables.find(t => t.name === model.modelOptions.tableName);

      if (!table) {
        missedTables.push(model.modelOptions.tableName);
        return;
      }

      Object.values(model.columns).forEach(c => {
        if (!c.columnNameInDb) {
          return;
        }

        if (table.name === 'tbl_organization') {
          console.log('c.columnNameInDb! :', c.columnNameInDb);
        }

        const column = table.columns.find(col => col.name === c.columnNameInDb);

        if (!column) {
          missedColumn.push(`${table.name}.${c.columnNameInDb}`);
        }
      });
    });
    return {
      missedTables,
      missedColumn
    };
  }

  compareDb2(db) {
    const dbSchema = db.schemas.get(this.dbSchemaName);
    const allModelMetadatas = Object.values(this.schemasMetadata.allModels);
    const missedTables = [];
    const missedColumn = [];
    dbSchema.tables.forEach(table => {
      const model = allModelMetadatas.find(m => m.modelOptions.tableName === table.name);

      if (!model) {
        missedTables.push(table.name);
        return;
      }

      for (let index = 0; index < table.columns.length; index++) {
        const column = table.columns[index];
        const modelColumns = Object.values(model.columns);
        const modelColumn = modelColumns.find(c => c.columnNameInDb === column.name);

        if (!modelColumn && column.name !== 'created_at' && column.name !== 'updated_at' && column.name !== 'deleted_at') {
          missedColumn.push(`${table.name}.${column.name}`);
        }
      }
    });
    return {
      missedTables,
      missedColumn
    };
  }

  parseSchemaFromDb(db) {
    const dbSchema = db.schemas.get(this.dbSchemaName);
    return {
      dbSchema,
      tables: (0, _utils.toMap)(dbSchema.tables.map(table => this.parseTableFromDb(table)), ({
        table
      }) => table.name)
    };
  }

  parseTableFromDb(table) {
    const columnNames = table.columns.map(c => {
      this.reportColumn(c);
      return c.name;
    });
    const indexNames = table.indexes.map(i => {
      this.reportIndex(i);
      return i.name;
    });
    const relatedTables = table.hasManyTables;
    return {
      table,
      columns: (0, _utils.toMap)(table.columns, column => column.name),
      indexes: (0, _utils.toMap)(table.indexes, index => index.name)
    };
  }

  reportColumn(column) {}

  reportIndex(index) {
    if (index.isPrimaryKey) {} else if (index.isUnique) {}
  }

}

exports.JsonSchemasX = JsonSchemasX;