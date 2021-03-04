"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pgStructure = _interopRequireDefault(require("pg-structure"));

var _az_pglib = _interopRequireDefault(require("./azpg/az_pglib"));

var _azColumnTypes = require("./azColumnTypes");

var _getTestSchema = _interopRequireDefault(require("./getTestSchema"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AzModelManager {
  constructor(connectString) {
    _defineProperty(this, "connectString", void 0);

    this.connectString = connectString;
  }

  async reportDb() {
    const r = await _az_pglib.default.create_connection(this.connectString);
    const db = await (0, _pgStructure.default)(r.client, {
      includeSchemas: ['public'],
      keepConnection: true
    });
    await r.client.end();
    const jsonSchemasX = new _azColumnTypes.JsonSchemasX('public', {});
    jsonSchemasX.parseSchemaFromDb(db);
  }

  testParseSchema() {
    const rawSchemas = (0, _getTestSchema.default)();
    const jsonSchemasX = new _azColumnTypes.JsonSchemasX('public', rawSchemas);
    return jsonSchemasX.toCoreSchemas();
  }

}

exports.default = AzModelManager;