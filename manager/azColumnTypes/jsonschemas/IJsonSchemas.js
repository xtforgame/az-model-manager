"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toSqlzDeferrable = exports.deferrableMap = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const deferrableMap = {
  initially_immediate: _sequelize.default.Deferrable.INITIALLY_IMMEDIATE,
  initially_deferred: _sequelize.default.Deferrable.INITIALLY_DEFERRED,
  not: _sequelize.default.Deferrable.NOT
};
exports.deferrableMap = deferrableMap;

const toSqlzDeferrable = text => deferrableMap[text];

exports.toSqlzDeferrable = toSqlzDeferrable;