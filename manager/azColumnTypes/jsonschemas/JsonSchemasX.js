"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsonSchemasX = void 0;

var _typeConfigs = require("./typeConfigs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var JsonSchemasX = function () {
  function JsonSchemasX(dbSchemaName, rawSchemas) {
    _classCallCheck(this, JsonSchemasX);

    _defineProperty(this, "rawSchemas", void 0);

    _defineProperty(this, "dbSchemaName", void 0);

    _defineProperty(this, "parsed", void 0);

    _defineProperty(this, "schemasMetadata", void 0);

    _defineProperty(this, "schema", void 0);

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
      this.schema = {
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

      this.schema.models = _objectSpread({}, this.rawSchemas.models);

      if (this.rawSchemas.associationModels) {
        this.schema.associationModels = _objectSpread({}, this.rawSchemas.associationModels);
      }

      var err = JsonSchemasX.normalizeRawSchemas(this.schemasMetadata.models, 'model', this.schema.models);
      if (err) return err;
      return JsonSchemasX.normalizeRawSchemas(this.schemasMetadata.associationModels, 'associationModel', this.schema.associationModels);
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
          schema = this.schema;
      err = JsonSchemasX.parseRawSchemas(schemasMetadata, schema, 'model', this.schema.models);
      if (err) return err;
      err = JsonSchemasX.parseRawSchemas(schemasMetadata, schema, 'associationModel', this.schema.associationModels);
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
          schema = this.schema;
      var err = JsonSchemasX.toCoreModels(schemasMetadata, schema, 'model', schema.models, result.models);

      if (err) {
        return err;
      }

      err = JsonSchemasX.toCoreModels(schemasMetadata, schema, 'associationModel', schema.associationModels, result.associationModels);

      if (err) {
        return err;
      }

      return result;
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
      JsonSchemasX.forEachSchema(tableType, models, function (tableName) {
        parsedTables[tableName] = {};
      }, function (tableName, tableType, table, columnName, column) {
        if (!column.type) {
          return Error("no type name: table(".concat(tableName, "), column(").concat(columnName, ")"));
        }

        if (typeof column.type === 'string') {
          column.type = [column.type];
        }

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