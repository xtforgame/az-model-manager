"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getNormalizedModelOptions = exports.ThroughValues = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var columnTypes = _interopRequireWildcard(require("./columnTypes"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const ThroughValues = Symbol('through-values');
exports.ThroughValues = ThroughValues;

const autoInclude = (ammOrm, modelName, values, inputInclude = undefined) => {
  const ammModel = ammOrm.getAmmModel(modelName);
  const includeMap = {};
  let include = inputInclude;
  (include || []).map(incl => incl.as && (includeMap[incl.as] = incl));

  if (ammModel && values) {
    Object.keys(ammModel.associations).forEach(associationName => {
      if (values[associationName] !== undefined) {
        const association = ammModel.associations[associationName];

        if (!includeMap[associationName]) {
          include = include || [];
          const childValue = Array.isArray(values[associationName]) ? values[associationName][0] : values[associationName];
          const childInclude = autoInclude(ammOrm, association.targetModel.name, childValue);
          const includeToAdd = {
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

const getNormalizedModelOptions = (modelName, tablePrefix, options) => _sequelize.default.Utils.mergeDefaults({
  timestamps: true,
  paranoid: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  name: {
    plural: _sequelize.default.Utils.pluralize(modelName),
    singular: _sequelize.default.Utils.singularize(modelName)
  },
  tableName: options.tableName || `${tablePrefix}${_sequelize.default.Utils.underscore(_sequelize.default.Utils.singularize(modelName))}`
}, options);

exports.getNormalizedModelOptions = getNormalizedModelOptions;

class AmmModel {
  constructor(ammOrm, modelName, tableDefine, tablePrefix = 'tbl_') {
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
    const {
      columns,
      sqlzOptions,
      associations
    } = this.getNormalizedSettings(this.modelName);
    const {
      name,
      tableName
    } = sqlzOptions;

    if (!name || !tableName) {
      throw new Error('no name');
    }

    this.sqlzOptions = sqlzOptions;
    const sqlzModel = this.db.define(modelName, columns, sqlzOptions);
    this.columns = columns;
    this.name = name;
    this.tableName = tableName;
    this.associations = associations;
    this.sqlzModel = sqlzModel;
    this.addModelMethods();
  }

  get primaryKey() {
    return this.sqlzModel.primaryKeyAttribute;
  }

  separateNxNAssociations(instance) {
    const result = {
      nxNAssociations: [],
      originalInclude: []
    };

    if (!instance._options.include) {
      return result;
    }

    result.originalInclude = instance._options.include;
    instance._options.include = [];
    result.originalInclude.forEach(i => {
      if (!i || !this.associations[i.as]) {
        instance._options.include.push(i);
      } else if (this.associations[i.as].type !== 'belongsToMany') {
        instance._options.include.push(i);
      } else {
        result.nxNAssociations.push(i);
      }
    });
    return result;
  }

  addModelMethods() {
    const originalBuild = this.sqlzModel.build.bind(this.sqlzModel);

    this.sqlzModel.build = (values, options = {}) => {
      let {
        include
      } = options;

      if (options.isNewRecord) {
        include = autoInclude(this.ammOrm, this.modelName, values, options.include);
      }

      const result = originalBuild(values, _objectSpread(_objectSpread({}, options), {}, {
        include
      }));
      values && values[ThroughValues] && (result._options[ThroughValues] = values[ThroughValues]);
      return result;
    };

    const This = this;
    const originalSave = this.sqlzModel.prototype.save;

    this.sqlzModel.prototype.save = function (options) {
      const {
        originalInclude,
        nxNAssociations
      } = This.separateNxNAssociations(this);

      if (!originalInclude || !nxNAssociations.length) {
        return originalSave.call(this, options);
      }

      return originalSave.call(this, options).then(me => {
        me._options.include = originalInclude;
        return Promise.all(nxNAssociations.map(include => {
          const includeOptions = _objectSpread({
            transaction: options.transaction,
            logging: options.logging,
            parentRecord: this
          }, _sequelize.default.Utils.cloneDeep(include));

          delete includeOptions.association;
          const instances = this.get(include.as);
          return Promise.all(instances.map(instance => {
            let throughValues = {};

            if (instance._options[ThroughValues]) {
              throughValues = instance._options[ThroughValues];
              delete instance._options[ThroughValues];
            }

            return instance.save(includeOptions).then(() => {
              const values = _objectSpread({}, throughValues);

              values[include.association.foreignKey] = this.get(this.constructor.primaryKeyAttribute, {
                raw: true
              });
              values[include.association.otherKey] = instance.get(instance.constructor.primaryKeyAttribute, {
                raw: true
              });
              Object.assign(values, include.association.through.scope);
              return include.association.throughModel.create(values, includeOptions);
            }).then(throughInstance => {
              const throughAs = This.associations[include.as].extraOptions.ammThroughAs;
              instance.dataValues[throughAs] = throughInstance;
            });
          }));
        })).then(() => me);
      });
    };

    this.ammOrm.addSqlzModelMethod(this.sqlzModel);
  }

  getNormalizedSettings(modelName) {
    const {
      columns: inputColumns,
      options = {}
    } = this.tableDefine;
    const associations = {};
    const columns = {};
    Object.keys(inputColumns).forEach(columnName => {
      const column = inputColumns[columnName];

      if (column.type && columnTypes.isAssociationColumn(column.type)) {
        associations[columnName] = column.type;
        associations[columnName].setAs(columnName);
      } else {
        columns[columnName] = column;
      }
    });
    const sqlzOptions = getNormalizedModelOptions(modelName, this.tablePrefix, options);
    sqlzOptions.tableName = sqlzOptions.tableName || `${this.tablePrefix}${_sequelize.default.Utils.underscore(sqlzOptions.name.singular)}`;
    return {
      columns,
      sqlzOptions,
      associations
    };
  }

  setupAssociations() {
    Object.keys(this.associations).forEach(associationName => {
      const association = this.associations[associationName];
      let TargetModel = association.targetModel;

      if (typeof TargetModel === 'string') {
        TargetModel = association.targetModel = this.ammOrm.getSqlzModel(TargetModel);
      }

      let throughModel;
      let options;

      if (association.type === 'belongsToMany') {
        const o = association.options;
        throughModel = this.ammOrm.getSqlzAssociationModel(o.through.ammModelName);
        options = _sequelize.default.Utils.mergeDefaults({
          through: {
            model: throughModel
          },
          as: associationName,
          ammAs: associationName
        }, association.options);
      } else {
        options = _sequelize.default.Utils.mergeDefaults({
          as: associationName,
          ammAs: associationName
        }, association.options);
      }

      if (association.type === 'hasMany' || association.type === 'belongsToMany') {
        options.as = {
          plural: _sequelize.default.Utils.pluralize(associationName),
          singular: _sequelize.default.Utils.singularize(associationName)
        };
      }

      if (options.ammAs && options.ammAs !== associationName) {
        throw new Error(`Association.as (${options.ammAs}) should be the same as column name (${associationName}) in model (${this.modelName})`);
      }

      this.sqlzModel[association.type](TargetModel, options);
    });
  }

}

exports.default = AmmModel;

_defineProperty(AmmModel, "columnTypes", columnTypes);

_defineProperty(AmmModel, "ThroughValues", ThroughValues);