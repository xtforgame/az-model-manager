"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _AmmModel = _interopRequireDefault(require("../AmmModel"));

var _AssociationModel = _interopRequireDefault(require("../AssociationModel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class OriginalAmmOrm {
  constructor(sequelizeDb, ammSchemas) {
    _defineProperty(this, "db", void 0);

    _defineProperty(this, "ammSchemas", void 0);

    _defineProperty(this, "tableInfo", void 0);

    _defineProperty(this, "associationModelInfo", void 0);

    this.db = sequelizeDb;
    this.ammSchemas = ammSchemas;
    this.tableInfo = {};
    this.associationModelInfo = {};
    const {
      models = {},
      associationModels = {},
      options = {}
    } = this.ammSchemas;
    Object.keys(associationModels).forEach(name => this.associationModelInfo[name] = new _AssociationModel.default(this, name, associationModels[name], options.associationModel?.tablePrefix));
    Object.keys(models).forEach(name => this.tableInfo[name] = new _AmmModel.default(this, name, models[name], options.model?.tablePrefix));
    Object.keys(this.tableInfo).forEach(name => this.tableInfo[name].setupAssociations());
    Object.keys(this.associationModelInfo).forEach(name => this.associationModelInfo[name].setupAssociations());
  }

  sync(force = true) {
    return this.db.sync({
      force
    });
  }

  addSqlzModelMethod(sqlzModel) {}

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

exports.default = OriginalAmmOrm;

_defineProperty(OriginalAmmOrm, "ThroughValues", _AmmModel.default.ThroughValues);

_defineProperty(OriginalAmmOrm, "columnTypes", _AmmModel.default.columnTypes);

Object.keys(_AmmModel.default.columnTypes).forEach(name => {
  OriginalAmmOrm[name] = _AmmModel.default.columnTypes[name];
});