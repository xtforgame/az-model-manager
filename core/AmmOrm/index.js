"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _AmmModel = _interopRequireDefault(require("../AmmModel"));

var _OriginalAmmOrm = _interopRequireDefault(require("./OriginalAmmOrm"));

var _columnTypes = require("../columnTypes");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AmmOrm extends _OriginalAmmOrm.default {
  constructor(sequelizeDb, ammSchemas) {
    super(sequelizeDb, ammSchemas);

    _defineProperty(this, "isAssociation", (baseModelName, associationModelNameAs) => {
      if (!this.ammSchemas.models[baseModelName]) {
        return false;
      }

      if (!this.ammSchemas.models[baseModelName].columns[associationModelNameAs]) {
        return false;
      }

      const coType = this.ammSchemas.models[baseModelName].columns[associationModelNameAs].type;
      return (0, _columnTypes.isAssociationColumn)(coType);
    });

    _defineProperty(this, "getAssociationIncludeData", (baseModelName, associationModelNameAs) => {
      if (!this.ammSchemas.models[baseModelName]) {
        console.log('baseModelName, this.ammSchemas.models :', baseModelName, this.ammSchemas.models);
        throw new Error(`Base Model not found: ${baseModelName}`);
        return null;
      }

      if (!this.ammSchemas.models[baseModelName].columns[associationModelNameAs]) {
        throw new Error(`Association Model not found: ${associationModelNameAs}`);
        return null;
      }

      const coType = this.ammSchemas.models[baseModelName].columns[associationModelNameAs].type;

      if (!(0, _columnTypes.isAssociationColumn)(coType)) {
        return null;
      }

      const {
        targetModel
      } = coType;
      let targetModelName = '';

      if (typeof targetModel !== 'string') {
        targetModelName = targetModel.name;
      } else {
        targetModelName = targetModel;
      }

      const AssociationModel = this.getSqlzModel(targetModelName);
      return {
        targetModelName: targetModel,
        model: AssociationModel,
        as: associationModelNameAs,
        include: []
      };
    });

    _defineProperty(this, "getAssociationIncludeMap", (baseModelName, associationModelNameAsArray = []) => {
      const includeMap = {};
      associationModelNameAsArray.forEach(item => {
        let nameAs = '';
        let options = {};

        if (typeof item !== 'string') {
          var _item = item;
          ({
            as: nameAs
          } = _item);
          options = _objectWithoutProperties(_item, ["as"]);
          _item;
        } else {
          nameAs = item;
        }

        const [associationModelNameAs, ...rest] = nameAs.split('.');

        if (!includeMap[associationModelNameAs]) {
          includeMap[associationModelNameAs] = this.getAssociationIncludeData(baseModelName, associationModelNameAs);

          if (rest.length === 0) {
            includeMap[associationModelNameAs] = _objectSpread(_objectSpread({}, includeMap[associationModelNameAs]), options);
          }
        }

        if (rest.length > 0) {
          let tmn = '';
          const {
            targetModelName
          } = includeMap[associationModelNameAs];

          if (typeof targetModelName === 'string') {
            tmn = targetModelName;
          } else {
            tmn = targetModelName.name;
          }

          includeMap[associationModelNameAs].includeMap = _objectSpread(_objectSpread({}, includeMap[associationModelNameAs].includeMap), this.getAssociationIncludeMap(tmn, [_objectSpread({
            as: rest.join('.')
          }, options)]));
        }
      });
      return includeMap;
    });

    _defineProperty(this, "associationIncludeMapToArray", includeMap => {
      const result = Object.values(includeMap);
      result.forEach(include => {
        if (include.includeMap) {
          include.include = this.associationIncludeMapToArray(include.includeMap);
          delete include.includeMap;
        }
      });
      return result;
    });

    _defineProperty(this, "getAssociationIncludes", (baseModelName, associationModelNameAsArray = []) => {
      const includeMap = this.getAssociationIncludeMap(baseModelName, associationModelNameAsArray);
      return this.associationIncludeMapToArray(includeMap);
    });
  }

  addSqlzModelMethod(sqlzModel) {
    sqlzModel.amm = this;

    sqlzModel.ammIncloud = (associationModelNameAsArray = []) => this.getAssociationIncludes(sqlzModel.name, associationModelNameAsArray);
  }

  getAmmModel(name) {
    return this.tableInfo[name];
  }

  getSqlzModel(name) {
    const model = this.getAmmModel(name);
    return model && model.sqlzModel;
  }

  getAmmAssociationModel(name) {
    return this.associationModelInfo[name];
  }

  getSqlzAssociationModel(name) {
    const model = this.getAmmAssociationModel(name);
    return model && model.sqlzModel;
  }

}

exports.default = AmmOrm;
Object.keys(_AmmModel.default.columnTypes).forEach(name => {
  AmmOrm[name] = _AmmModel.default.columnTypes[name];
});