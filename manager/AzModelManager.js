"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _pgStructure = _interopRequireDefault(require("pg-structure"));

var _az_pglib = _interopRequireDefault(require("./azpg/az_pglib"));

var _azColumnTypes = require("./azColumnTypes");

var _getTestSchema = _interopRequireDefault(require("./getTestSchema"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AzModelManager = function () {
  function AzModelManager(connectString) {
    _classCallCheck(this, AzModelManager);

    _defineProperty(this, "connectString", void 0);

    this.connectString = connectString;
  }

  _createClass(AzModelManager, [{
    key: "reportDb",
    value: function () {
      var _reportDb = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var r, db, jsonSchemasX;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _az_pglib["default"].create_connection(this.connectString);

              case 2:
                r = _context.sent;
                _context.next = 5;
                return (0, _pgStructure["default"])(r.client, {
                  includeSchemas: ['public'],
                  keepConnection: true
                });

              case 5:
                db = _context.sent;
                _context.next = 8;
                return r.client.end();

              case 8:
                jsonSchemasX = new _azColumnTypes.JsonSchemasX('public', {});
                jsonSchemasX.parseSchemaFromDb(db);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function reportDb() {
        return _reportDb.apply(this, arguments);
      }

      return reportDb;
    }()
  }, {
    key: "testParseSchema",
    value: function testParseSchema() {
      var rawSchemas = (0, _getTestSchema["default"])();
      var jsonSchemasX = new _azColumnTypes.JsonSchemasX('public', rawSchemas);
      return jsonSchemasX.toCoreSchemas();
    }
  }]);

  return AzModelManager;
}();

exports["default"] = AzModelManager;