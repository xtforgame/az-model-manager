"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _AmmModel = _interopRequireDefault(require("../AmmModel"));

var _OriginalAmmOrm2 = _interopRequireDefault(require("./OriginalAmmOrm"));

var _columnTypes = require("../columnTypes");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AmmOrm = function (_OriginalAmmOrm) {
  _inherits(AmmOrm, _OriginalAmmOrm);

  var _super = _createSuper(AmmOrm);

  function AmmOrm(sequelizeDb, ammSchemas) {
    var _this;

    _classCallCheck(this, AmmOrm);

    _this = _super.call(this, sequelizeDb, ammSchemas);

    _defineProperty(_assertThisInitialized(_this), "isAssociation", function (baseModelName, associationModelNameAs) {
      if (!_this.ammSchemas.models[baseModelName]) {
        return false;
      }

      if (!_this.ammSchemas.models[baseModelName].columns[associationModelNameAs]) {
        return false;
      }

      var coType = _this.ammSchemas.models[baseModelName].columns[associationModelNameAs].type;
      return (0, _columnTypes.isAssociationColumn)(coType);
    });

    _defineProperty(_assertThisInitialized(_this), "getAssociationIncludeData", function (baseModelName, associationModelNameAs) {
      if (!_this.ammSchemas.models[baseModelName]) {
        console.log('baseModelName, this.ammSchemas.models :', baseModelName, _this.ammSchemas.models);
        return null;
      }

      if (!_this.ammSchemas.models[baseModelName].columns[associationModelNameAs]) {
        return null;
      }

      var coType = _this.ammSchemas.models[baseModelName].columns[associationModelNameAs].type;

      if (!(0, _columnTypes.isAssociationColumn)(coType)) {
        return null;
      }

      var targetModel = coType.targetModel;
      var targetModelName = '';

      if (typeof targetModel !== 'string') {
        targetModelName = targetModel.name;
      } else {
        targetModelName = targetModel;
      }

      var AssociationModel = _this.getSqlzModel(targetModelName);

      return {
        targetModelName: targetModel,
        model: AssociationModel,
        as: associationModelNameAs,
        include: []
      };
    });

    _defineProperty(_assertThisInitialized(_this), "getAssociationIncludeMap", function (baseModelName) {
      var associationModelNameAsArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var includeMap = {};
      associationModelNameAsArray.forEach(function (item) {
        var nameAs = '';
        var options = {};

        if (typeof item !== 'string') {
          var _item = item;
          nameAs = _item.as;
          options = _objectWithoutProperties(_item, ["as"]);
          _item;
        } else {
          nameAs = item;
        }

        var _nameAs$split = nameAs.split('.'),
            _nameAs$split2 = _toArray(_nameAs$split),
            associationModelNameAs = _nameAs$split2[0],
            rest = _nameAs$split2.slice(1);

        if (!includeMap[associationModelNameAs]) {
          includeMap[associationModelNameAs] = _this.getAssociationIncludeData(baseModelName, associationModelNameAs);

          if (rest.length === 0) {
            includeMap[associationModelNameAs] = _objectSpread(_objectSpread({}, includeMap[associationModelNameAs]), options);
          }
        }

        if (rest.length > 0) {
          var tmn = '';
          var targetModelName = includeMap[associationModelNameAs].targetModelName;

          if (typeof targetModelName === 'string') {
            tmn = targetModelName;
          } else {
            tmn = targetModelName.name;
          }

          includeMap[associationModelNameAs].includeMap = _objectSpread(_objectSpread({}, includeMap[associationModelNameAs].includeMap), _this.getAssociationIncludeMap(tmn, [_objectSpread({
            as: rest.join('.')
          }, options)]));
        }
      });
      return includeMap;
    });

    _defineProperty(_assertThisInitialized(_this), "associationIncludeMapToArray", function (includeMap) {
      var result = Object.values(includeMap);
      result.forEach(function (include) {
        if (include.includeMap) {
          include.include = _this.associationIncludeMapToArray(include.includeMap);
          delete include.includeMap;
        }
      });
      return result;
    });

    _defineProperty(_assertThisInitialized(_this), "getAssociationIncludes", function (baseModelName) {
      var associationModelNameAsArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var includeMap = _this.getAssociationIncludeMap(baseModelName, associationModelNameAsArray);

      return _this.associationIncludeMapToArray(includeMap);
    });

    return _this;
  }

  _createClass(AmmOrm, [{
    key: "addSqlzModelMethod",
    value: function addSqlzModelMethod(sqlzModel) {
      var _this2 = this;

      sqlzModel.amm = this;

      sqlzModel.ammIncloud = function () {
        var associationModelNameAsArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        return _this2.getAssociationIncludes(sqlzModel.name, associationModelNameAsArray);
      };
    }
  }, {
    key: "getAmmModel",
    value: function getAmmModel(name) {
      return this.tableInfo[name];
    }
  }, {
    key: "getSqlzModel",
    value: function getSqlzModel(name) {
      var model = this.getAmmModel(name);
      return model && model.sqlzModel;
    }
  }, {
    key: "getAmmAssociationModel",
    value: function getAmmAssociationModel(name) {
      return this.associationModelInfo[name];
    }
  }, {
    key: "getSqlzAssociationModel",
    value: function getSqlzAssociationModel(name) {
      var model = this.getAmmAssociationModel(name);
      return model && model.sqlzModel;
    }
  }]);

  return AmmOrm;
}(_OriginalAmmOrm2["default"]);

exports["default"] = AmmOrm;
Object.keys(_AmmModel["default"].columnTypes).forEach(function (name) {
  AmmOrm[name] = _AmmModel["default"].columnTypes[name];
});