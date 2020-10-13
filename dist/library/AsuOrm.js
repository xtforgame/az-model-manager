"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _AsuModel = _interopRequireDefault(require("./AsuModel"));

var _AssociationModel = _interopRequireDefault(require("./AssociationModel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AsuOrm = function () {
  function AsuOrm(sequelizeDb, asuSchemas) {
    var _this = this;

    _classCallCheck(this, AsuOrm);

    _defineProperty(this, "db", void 0);

    _defineProperty(this, "asuSchemas", void 0);

    _defineProperty(this, "tableInfo", void 0);

    _defineProperty(this, "associationModelInfo", void 0);

    this.db = sequelizeDb;
    this.asuSchemas = asuSchemas;
    this.tableInfo = {};
    this.associationModelInfo = {};
    var _this$asuSchemas = this.asuSchemas,
        _this$asuSchemas$mode = _this$asuSchemas.models,
        models = _this$asuSchemas$mode === void 0 ? {} : _this$asuSchemas$mode,
        _this$asuSchemas$asso = _this$asuSchemas.associationModels,
        associationModels = _this$asuSchemas$asso === void 0 ? {} : _this$asuSchemas$asso;
    Object.keys(associationModels).forEach(function (name) {
      return _this.associationModelInfo[name] = new _AssociationModel["default"](_this, name, associationModels[name]);
    });
    Object.keys(models).forEach(function (name) {
      return _this.tableInfo[name] = new _AsuModel["default"](_this, name, models[name]);
    });
    Object.keys(this.tableInfo).forEach(function (name) {
      return _this.tableInfo[name].setupAssociations();
    });
  }

  _createClass(AsuOrm, [{
    key: "sync",
    value: function sync() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      return this.db.sync({
        force: force
      });
    }
  }, {
    key: "getAsuModel",
    value: function getAsuModel(name) {
      return this.tableInfo[name];
    }
  }, {
    key: "getSqlzModel",
    value: function getSqlzModel(name) {
      var model = this.getAsuModel(name);
      return model && model.sqlzModel;
    }
  }, {
    key: "getAsuAssociationModel",
    value: function getAsuAssociationModel(name) {
      return this.associationModelInfo[name];
    }
  }, {
    key: "getSqlzAssociationModel",
    value: function getSqlzAssociationModel(name) {
      var model = this.getAsuAssociationModel(name);
      return model && model.sqlzModel;
    }
  }]);

  return AsuOrm;
}();

exports["default"] = AsuOrm;

_defineProperty(AsuOrm, "ThroughValues", _AsuModel["default"].ThroughValues);

_defineProperty(AsuOrm, "columnTypes", _AsuModel["default"].columnTypes);

Object.keys(_AsuModel["default"].columnTypes).forEach(function (name) {
  AsuOrm[name] = _AsuModel["default"].columnTypes[name];
});