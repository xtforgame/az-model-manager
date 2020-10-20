"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _AmmModel = _interopRequireDefault(require("../AmmModel"));

var _AssociationModel = _interopRequireDefault(require("../AssociationModel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var OriginalAmmOrm = function () {
  function OriginalAmmOrm(sequelizeDb, ammSchemas) {
    var _this = this;

    _classCallCheck(this, OriginalAmmOrm);

    _defineProperty(this, "db", void 0);

    _defineProperty(this, "ammSchemas", void 0);

    _defineProperty(this, "tableInfo", void 0);

    _defineProperty(this, "associationModelInfo", void 0);

    this.db = sequelizeDb;
    this.ammSchemas = ammSchemas;
    this.tableInfo = {};
    this.associationModelInfo = {};
    var _this$ammSchemas = this.ammSchemas,
        _this$ammSchemas$mode = _this$ammSchemas.models,
        models = _this$ammSchemas$mode === void 0 ? {} : _this$ammSchemas$mode,
        _this$ammSchemas$asso = _this$ammSchemas.associationModels,
        associationModels = _this$ammSchemas$asso === void 0 ? {} : _this$ammSchemas$asso;
    Object.keys(associationModels).forEach(function (name) {
      return _this.associationModelInfo[name] = new _AssociationModel["default"](_this, name, associationModels[name]);
    });
    Object.keys(models).forEach(function (name) {
      return _this.tableInfo[name] = new _AmmModel["default"](_this, name, models[name]);
    });
    Object.keys(this.tableInfo).forEach(function (name) {
      return _this.tableInfo[name].setupAssociations();
    });
  }

  _createClass(OriginalAmmOrm, [{
    key: "sync",
    value: function sync() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      return this.db.sync({
        force: force
      });
    }
  }, {
    key: "addSqlzModelMethod",
    value: function addSqlzModelMethod(sqlzModel) {}
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

  return OriginalAmmOrm;
}();

exports["default"] = OriginalAmmOrm;

_defineProperty(OriginalAmmOrm, "ThroughValues", _AmmModel["default"].ThroughValues);

_defineProperty(OriginalAmmOrm, "columnTypes", _AmmModel["default"].columnTypes);

Object.keys(_AmmModel["default"].columnTypes).forEach(function (name) {
  OriginalAmmOrm[name] = _AmmModel["default"].columnTypes[name];
});