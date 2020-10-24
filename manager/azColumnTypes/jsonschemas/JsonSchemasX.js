"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsonSchemasX = void 0;

var _path = _interopRequireDefault(require("path"));

var _liquidjs = require("liquidjs");

var _appRootPath = _interopRequireDefault(require("app-root-path"));

var _typeConfigs = require("./typeConfigs");

var _core = require("../../../core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var appRoot = _appRootPath["default"].resolve('./');

var JsonSchemasX = function () {
  function JsonSchemasX(dbSchemaName, rawSchemas) {
    _classCallCheck(this, JsonSchemasX);

    _defineProperty(this, "rawSchemas", void 0);

    _defineProperty(this, "dbSchemaName", void 0);

    _defineProperty(this, "parsed", void 0);

    _defineProperty(this, "schemasMetadata", void 0);

    _defineProperty(this, "schemas", void 0);

    this.dbSchemaName = dbSchemaName;
    this.rawSchemas = rawSchemas;
    this.clear();
  }

  _createClass(JsonSchemasX, [{
    key: "clear",
    value: function clear() {
      this.parsed = false;
      this.schemasMetadata = {
        models: {},
        associationModels: {}
      };
      this.schemas = {
        models: {},
        associationModels: {}
      };
    }
  }, {
    key: "normalizeRawSchemas",
    value: function normalizeRawSchemas() {
      this.clear();

      if (!this.rawSchemas.models) {
        return Error("bad json data: no models provided");
      }

      this.schemas.models = _objectSpread({}, this.rawSchemas.models);

      if (this.rawSchemas.associationModels) {
        this.schemas.associationModels = _objectSpread({}, this.rawSchemas.associationModels);
      }

      var err = JsonSchemasX.normalizeRawSchemas(this.schemasMetadata.models, 'model', this.schemas.models);
      if (err) return err;
      return JsonSchemasX.normalizeRawSchemas(this.schemasMetadata.associationModels, 'associationModel', this.schemas.associationModels);
    }
  }, {
    key: "parseRawSchemas",
    value: function parseRawSchemas() {
      this.parsed = false;
      var err = this.normalizeRawSchemas();

      if (err) {
        return err;
      }

      var schemasMetadata = this.schemasMetadata,
          schemas = this.schemas;
      err = JsonSchemasX.parseRawSchemas(schemasMetadata, schemas, 'model', this.schemas.models);
      if (err) return err;
      err = JsonSchemasX.parseRawSchemas(schemasMetadata, schemas, 'associationModel', this.schemas.associationModels);
      this.parsed = false;
      return err;
    }
  }, {
    key: "toCoreSchemas",
    value: function toCoreSchemas() {
      var result = {
        models: {},
        associationModels: {}
      };

      if (!this.parsed) {
        var _err = this.parseRawSchemas();

        if (_err) return _err;
      }

      var schemasMetadata = this.schemasMetadata,
          schemas = this.schemas;
      var err = JsonSchemasX.toCoreModels(schemasMetadata, schemas, 'model', schemas.models, result.models);

      if (err) {
        return err;
      }

      err = JsonSchemasX.toCoreModels(schemasMetadata, schemas, 'associationModel', schemas.associationModels, result.associationModels);

      if (err) {
        return err;
      }

      return result;
    }
  }, {
    key: "buildModelTsFile",
    value: function buildModelTsFile(orders) {
      var schemasMetadata = this.schemasMetadata,
          schemas = this.schemas;
      var engine = new _liquidjs.Liquid({
        root: _path["default"].join(appRoot, 'liquids')
      });
      engine.plugin(function (Liquid) {
        this.registerFilter('toTsTypeExpression', function (column) {
          return _typeConfigs.typeConfigs[column.type[0]].getTsTypeExpression(column);
        });
        this.registerFilter('toTsTypeExpressionForCreation', function (column) {
          return _typeConfigs.typeConfigs[column.type[0]].getTsTypeExpressionForCreation(column);
        });
        this.registerFilter('getOptionalMark', function (column) {
          var optionalMark = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '?';
          return column.extraOptions.requiredOnCreation ? '' : optionalMark;
        });
        this.registerFilter('debugPrint', function (value) {
          console.log('value :', value);
          return value;
        });
      });
      return engine.parseAndRender("{% render 'main.liquid', schemasMetadata: schemasMetadata, schemas: schemas, orders: orders, models: models %}", {
        schemasMetadata: schemasMetadata,
        schemas: schemas,
        orders: orders || [].concat(_toConsumableArray(Object.keys(schemas.models)), _toConsumableArray(Object.keys(schemas.associationModels)))
      });
    }
  }, {
    key: "parseSchemaFromDb",
    value: function parseSchemaFromDb(db) {
      var dbSchema = db.schemas.get(this.dbSchemaName);
      var table = db.get('tbl_account_link');
      return this.parseTableFromDb(table);
    }
  }, {
    key: "parseTableFromDb",
    value: function parseTableFromDb(table) {
      var _this = this;

      var columnNames = table.columns.map(function (c) {
        _this.reportColumn(c);

        return c.name;
      });
      console.log('columnNames :', columnNames);
      var indexNames = table.indexes.map(function (i) {
        _this.reportIndex(i);

        return i.name;
      });
      console.log('indexNames :', indexNames);
      var relatedTables = table.hasManyTables;
      console.log('relatedTables :', relatedTables);
    }
  }, {
    key: "reportColumn",
    value: function reportColumn(column) {}
  }, {
    key: "reportIndex",
    value: function reportIndex(index) {
      if (index.isPrimaryKey) {
        console.log('index.columnsAndExpressions :', index.columnsAndExpressions.map(function (col) {
          return typeof col === 'string' ? col : col.name;
        }).join(', '));
      } else if (index.isUnique) {
        console.log('index.partialIndexExpression :', index.partialIndexExpression);
      }
    }
  }], [{
    key: "forEachSchema",
    value: function forEachSchema(tableType, models, modelCb, columnCb) {
      var modelKeys = Object.keys(models);

      for (var i = 0; i < modelKeys.length; i++) {
        var _tableName = modelKeys[i];
        var table = models[_tableName];
        var err = void 0;

        if (modelCb) {
          modelCb(_tableName, tableType, table);
        }

        if (err) return err;

        if (!columnCb) {
          continue;
        }

        var rawColumns = table.columns;
        var rawColumnKeys = Object.keys(rawColumns);

        for (var j = 0; j < rawColumnKeys.length; j++) {
          var _columnName = rawColumnKeys[j];
          var _column = rawColumns[_columnName];
          err = columnCb(_tableName, tableType, table, _columnName, _column);
          if (err) return err;
        }
      }
    }
  }, {
    key: "normalizeRawSchemas",
    value: function normalizeRawSchemas(parsedTables, tableType, models) {
      JsonSchemasX.forEachSchema(tableType, models, function (tableName, tableType, table) {
        parsedTables[tableName] = {};
        table.options = (0, _core.getNormalizedModelOptions)(tableName, table.options || {});
      }, function (tableName, tableType, table, columnName, column) {
        if (typeof column === 'string' || Array.isArray(column)) {
          column = {
            type: column
          };
        }

        table.columns[columnName] = column;

        if (!column.type) {
          return Error("no type name: table(".concat(tableName, "), column(").concat(columnName, ")"));
        }

        if (typeof column.type === 'string') {
          column.type = [column.type];
        }

        column.extraOptions = column.extraOptions || {};

        if (column.primaryKey) {
          parsedTables[tableName].primaryKey = columnName;
        }

        if (!Array.isArray(column.type) || !column.type.length || typeof column.type[0] !== 'string') {
          return Error("bad type name: table(".concat(tableName, "), column(").concat(columnName, ")"));
        }

        var typeName = column.type[0];
        var typeConfig = _typeConfigs.typeConfigs[typeName];

        if (!typeConfig) {
          return Error("unknown type name: table(".concat(tableName, "), column(").concat(columnName, "), type(").concat(typeName, ")"));
        }
      });
      JsonSchemasX.forEachSchema(tableType, models, null, function (tableName, tableType, table, columnName, column) {
        var typeName = column.type[0];
        var typeConfig = _typeConfigs.typeConfigs[typeName];
        var err = typeConfig.normalize({
          table: table,
          tableType: tableType,
          tableName: tableName,
          column: column,
          columnName: columnName
        });

        if (err) {
          return err;
        }
      });
    }
  }, {
    key: "parseRawSchemas",
    value: function parseRawSchemas(schemasMetadata, rawSchemas, tableType, models) {
      JsonSchemasX.forEachSchema(tableType, models, null, function (tableName, tableType, table, columnName, column) {
        var typeName = column.type[0];
        var typeConfig = _typeConfigs.typeConfigs[typeName];
        var result = typeConfig.parse({
          schemasMetadata: schemasMetadata,
          schemas: rawSchemas,
          table: table,
          tableType: tableType,
          tableName: tableName,
          column: column,
          columnName: columnName
        });

        if (result instanceof Error) {
          return result;
        }

        table.columns[columnName] = result;
      });
    }
  }, {
    key: "toCoreModels",
    value: function toCoreModels(schemasMetadata, rawSchemas, tableType, models, resultModels) {
      JsonSchemasX.forEachSchema(tableType, models, function (tableName, tableType, table) {
        resultModels[tableName] = {
          columns: {},
          options: table.options
        };
      }, function (tableName, tableType, table, columnName, column) {
        var typeName = column.type[0];
        var typeConfig = _typeConfigs.typeConfigs[typeName];
        var parseResult = typeConfig.toCoreColumn({
          schemasMetadata: schemasMetadata,
          schemas: rawSchemas,
          table: table,
          tableType: 'associationModel',
          tableName: tableName,
          column: column,
          columnName: columnName
        });

        if (parseResult instanceof Error) {
          return Error("parse type error: table(".concat(tableName, "), column(").concat(columnName, "), type(").concat(typeName, "), error: ").concat(parseResult.message));
        }

        resultModels[tableName].columns[columnName] = parseResult;
      });
    }
  }]);

  return JsonSchemasX;
}();

exports.JsonSchemasX = JsonSchemasX;