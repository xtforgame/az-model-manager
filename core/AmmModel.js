"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.ThroughValues = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var columnTypes = _interopRequireWildcard(require("./columnTypes"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ThroughValues = Symbol('through-values');
exports.ThroughValues = ThroughValues;

var autoInclude = function autoInclude(ammOrm, modelName, values) {
  var inputInclude = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
  var ammModel = ammOrm.getAmmModel(modelName);
  var includeMap = {};
  var include = inputInclude;
  (include || []).map(function (incl) {
    return incl.as && (includeMap[incl.as] = incl);
  });

  if (ammModel && values) {
    Object.keys(ammModel.associations).forEach(function (associationName) {
      if (values[associationName] !== undefined) {
        var association = ammModel.associations[associationName];

        if (!includeMap[associationName]) {
          include = include || [];
          var childValue = Array.isArray(values[associationName]) ? values[associationName][0] : values[associationName];
          var childInclude = autoInclude(ammOrm, association.targetModel.name, childValue);
          var includeToAdd = {
            model: association.targetModel,
            as: associationName
          };

          if (childInclude) {
            includeToAdd.include = childInclude;
          }

          includeMap[associationName] = includeToAdd;
          include.push(includeToAdd);
        }
      }
    });
  } else {}

  return include;
};

var AmmModel = function () {
  function AmmModel(ammOrm, modelName, tableDefine) {
    var tablePrefix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'tbl_';

    _classCallCheck(this, AmmModel);

    _defineProperty(this, "ammOrm", void 0);

    _defineProperty(this, "db", void 0);

    _defineProperty(this, "tableDefine", void 0);

    _defineProperty(this, "tablePrefix", void 0);

    _defineProperty(this, "sqlzModel", void 0);

    _defineProperty(this, "sqlzOptions", void 0);

    _defineProperty(this, "modelName", void 0);

    _defineProperty(this, "columns", void 0);

    _defineProperty(this, "name", void 0);

    _defineProperty(this, "tableName", void 0);

    _defineProperty(this, "associations", void 0);

    this.ammOrm = ammOrm;
    this.db = this.ammOrm.db;
    this.tableDefine = tableDefine;
    this.tablePrefix = tablePrefix;
    this.modelName = modelName;

    var _this$getNormalizedSe = this.getNormalizedSettings(this.modelName),
        columns = _this$getNormalizedSe.columns,
        sqlzOptions = _this$getNormalizedSe.sqlzOptions,
        associations = _this$getNormalizedSe.associations;

    var name = sqlzOptions.name,
        tableName = sqlzOptions.tableName;

    if (!name || !tableName) {
      throw new Error('no name');
    }

    var sqlzModel = this.db.define(modelName, columns, sqlzOptions);
    this.columns = columns;
    this.sqlzOptions = sqlzOptions;
    this.name = name;
    this.tableName = tableName;
    this.associations = associations;
    this.sqlzModel = sqlzModel;
    this.addModelMethods();
  }

  _createClass(AmmModel, [{
    key: "separateNxNAssociations",
    value: function separateNxNAssociations(instance) {
      var _this = this;

      var result = {
        nxNAssociations: [],
        originalInclude: []
      };

      if (!instance._options.include) {
        return result;
      }

      result.originalInclude = instance._options.include;
      instance._options.include = [];
      result.originalInclude.forEach(function (i) {
        if (!i || !_this.associations[i.as]) {
          instance._options.include.push(i);
        } else if (_this.associations[i.as].type !== 'belongsToMany') {
          instance._options.include.push(i);
        } else {
          result.nxNAssociations.push(i);
        }
      });
      return result;
    }
  }, {
    key: "addModelMethods",
    value: function addModelMethods() {
      var _this2 = this;

      var originalBuild = this.sqlzModel.build.bind(this.sqlzModel);

      this.sqlzModel.build = function (values) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var include = options.include;

        if (options.isNewRecord) {
          include = autoInclude(_this2.ammOrm, _this2.modelName, values, options.include);
        }

        var result = originalBuild(values, _objectSpread(_objectSpread({}, options), {}, {
          include: include
        }));
        values && values[ThroughValues] && (result._options[ThroughValues] = values[ThroughValues]);
        return result;
      };

      var This = this;
      var originalSave = this.sqlzModel.prototype.save;

      this.sqlzModel.prototype.save = function (options) {
        var _this3 = this;

        var _This$separateNxNAsso = This.separateNxNAssociations(this),
            originalInclude = _This$separateNxNAsso.originalInclude,
            nxNAssociations = _This$separateNxNAsso.nxNAssociations;

        if (!originalInclude || !nxNAssociations.length) {
          return originalSave.call(this, options);
        }

        return originalSave.call(this, options).then(function (me) {
          me._options.include = originalInclude;
          return Promise.all(nxNAssociations.map(function (include) {
            var includeOptions = _objectSpread({
              transaction: options.transaction,
              logging: options.logging,
              parentRecord: _this3
            }, _sequelize["default"].Utils.cloneDeep(include));

            delete includeOptions.association;

            var instances = _this3.get(include.as);

            return Promise.all(instances.map(function (instance) {
              var throughValues = {};

              if (instance._options[ThroughValues]) {
                throughValues = instance._options[ThroughValues];
                delete instance._options[ThroughValues];
              }

              return instance.save(includeOptions).then(function () {
                var values = _objectSpread({}, throughValues);

                values[include.association.foreignKey] = _this3.get(_this3.constructor.primaryKeyAttribute, {
                  raw: true
                });
                values[include.association.otherKey] = instance.get(instance.constructor.primaryKeyAttribute, {
                  raw: true
                });
                Object.assign(values, include.association.through.scope);
                return include.association.throughModel.create(values, includeOptions);
              }).then(function (throughInstance) {
                var throughAs = This.associations[include.as].extraOptions.ammThroughAs;
                instance.dataValues[throughAs] = throughInstance;
              });
            }));
          })).then(function () {
            return me;
          });
        });
      };

      this.ammOrm.addSqlzModelMethod(this.sqlzModel);
    }
  }, {
    key: "getNormalizedSettings",
    value: function getNormalizedSettings(modelName) {
      var _this$tableDefine = this.tableDefine,
          inputColumns = _this$tableDefine.columns,
          _this$tableDefine$opt = _this$tableDefine.options,
          options = _this$tableDefine$opt === void 0 ? {} : _this$tableDefine$opt;
      var associations = {};
      var columns = {};
      Object.keys(inputColumns).forEach(function (columnName) {
        var column = inputColumns[columnName];

        if (column.type && columnTypes.isAssociationColumn(column.type)) {
          associations[columnName] = column.type;
          associations[columnName].setAs(columnName);
        } else {
          columns[columnName] = column;
        }
      });

      var sqlzOptions = _sequelize["default"].Utils.mergeDefaults({
        timestamps: true,
        paranoid: true,
        underscored: true,
        name: {
          plural: _sequelize["default"].Utils.pluralize(modelName),
          singular: _sequelize["default"].Utils.singularize(modelName)
        }
      }, options);

      sqlzOptions.tableName = sqlzOptions.tableName || "".concat(this.tablePrefix).concat(_sequelize["default"].Utils.underscore(sqlzOptions.name.singular));
      return {
        columns: columns,
        sqlzOptions: sqlzOptions,
        associations: associations
      };
    }
  }, {
    key: "setupAssociations",
    value: function setupAssociations() {
      var _this4 = this;

      Object.keys(this.associations).forEach(function (associationName) {
        var association = _this4.associations[associationName];
        var TargetModel = association.targetModel;

        if (typeof TargetModel === 'string') {
          TargetModel = association.targetModel = _this4.ammOrm.getSqlzModel(TargetModel);
        }

        var throughModel;
        var options;

        if (association.type === 'belongsToMany') {
          var o = association.options;
          throughModel = _this4.ammOrm.getSqlzAssociationModel(o.through.ammModelName);
          options = _sequelize["default"].Utils.mergeDefaults({
            through: {
              model: throughModel
            },
            as: associationName
          }, association.options);
        } else {
          options = _sequelize["default"].Utils.mergeDefaults({
            as: associationName
          }, association.options);
        }

        if (options.as && options.as !== associationName) {
          throw new Error("Association.as (".concat(options.as, ") should be the same as column name (").concat(associationName, ") in model (").concat(_this4.modelName, ")"));
        }

        _this4.sqlzModel[association.type](TargetModel, options);
      });
    }
  }, {
    key: "primaryKey",
    get: function get() {
      return this.sqlzModel.primaryKeyAttribute;
    }
  }]);

  return AmmModel;
}();

exports["default"] = AmmModel;

_defineProperty(AmmModel, "columnTypes", columnTypes);

_defineProperty(AmmModel, "ThroughValues", ThroughValues);