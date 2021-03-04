"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _AmmModel = _interopRequireDefault(require("./AmmModel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AssociationModel extends _AmmModel.default {
  constructor(ammOrm, modelName, tableDefine) {
    super(ammOrm, modelName, tableDefine, 'mn_');
  }

}

exports.default = AssociationModel;