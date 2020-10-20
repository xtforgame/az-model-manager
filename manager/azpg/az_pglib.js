"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeRoleAndDb = removeRoleAndDb;
exports.createRoleAndDb = createRoleAndDb;
exports["default"] = exports.AzPgImi = exports.DB_DEFAULT_SETTINGS = exports.AzPgClient = exports.ConnectionState = exports.ErrorTypes = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _pg = _interopRequireDefault(require("pg"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ErrorTypes = function ErrorTypes() {
  _classCallCheck(this, ErrorTypes);
};

exports.ErrorTypes = ErrorTypes;

_defineProperty(ErrorTypes, "Connection", "connection");

_defineProperty(ErrorTypes, "Readfile", "readfile");

_defineProperty(ErrorTypes, "Query", "query");

var ConnectionState = function ConnectionState() {
  _classCallCheck(this, ConnectionState);
};

exports.ConnectionState = ConnectionState;

_defineProperty(ConnectionState, "Connecting", "connecting");

_defineProperty(ConnectionState, "Connected", "connected");

_defineProperty(ConnectionState, "Disconnecting", "disconnecting");

_defineProperty(ConnectionState, "Disconnected", "disconnected");

function read_file_promise(file, encoding) {
  return new Promise(function (resolve, reject) {
    _fs["default"].readFile(file, encoding, function (error, data) {
      if (error) {
        reject({
          error_type: ErrorTypes.Readfile,
          error: error
        });
      } else {
        resolve(data);
      }
    });
  });
}

var AzPgClient = function () {
  function AzPgClient(con_str) {
    _classCallCheck(this, AzPgClient);

    this.client = null;
    this.con_str = con_str;
    this.connection_state = ConnectionState.Disconnected;
  }

  _createClass(AzPgClient, [{
    key: "connect",
    value: function connect(con_str) {
      var _this = this;

      if (con_str) {
        this.con_str = con_str;
      }

      this.connection_state = ConnectionState.Connecting;
      var This = this;
      this.client = new _pg["default"].Client(this.con_str);
      this.client.on('error', function (error) {
        if (error.code === "ECONNRESET") {} else if (error.code === "57P01") {
          console.error("Catch 57P01 !!!");
        } else {
          console.error("Catch uncaughtException pg err !!!");
          throw error;
        }

        try {
          This.disconnect();
        } catch (e) {}
      });
      return new Promise(function (resolve, reject) {
        _this.client.connect(function (error) {
          if (error) {
            _this.connection_state = ConnectionState.Disconnected;
            reject({
              client: _this,
              error_type: ErrorTypes.Connection,
              error: error
            });
          } else {
            _this.connection_state = ConnectionState.Connected;
            resolve({
              client: _this,
              result: _this
            });
          }
        });
      });
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      if (this.client) {
        var temp = this.client;
        this.client = null;
        temp.end();
      }

      this.connection_state = ConnectionState.Disconnected;
    }
  }, {
    key: "end",
    value: function end() {
      return this.disconnect();
    }
  }, {
    key: "query",
    value: function query() {
      var _this$client;

      return (_this$client = this.client).query.apply(_this$client, arguments);
    }
  }, {
    key: "query_promise",
    value: function query_promise(query_text) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.client.query(query_text, function (error, result) {
          if (error) {
            var near = error.position && error.position >= query_text.length && query_text.substring(Math.max(0, error.position - 5), Math.min(error.position + 10, query_text.length));
            reject({
              client: _this2,
              error_type: ErrorTypes.Query,
              error: error,
              near: near
            });
          } else {
            resolve({
              client: _this2,
              result: result
            });
          }
        });
      });
    }
  }, {
    key: "query_from_file_promise",
    value: function query_from_file_promise(file, encoding) {
      var _this3 = this;

      return read_file_promise(file, encoding).then(function (data) {
        return _this3.query_promise(data);
      }).then(function (result) {
        return Promise.resolve(result);
      })["catch"](function (error) {
        return Promise.reject(error);
      });
    }
  }]);

  return AzPgClient;
}();

exports.AzPgClient = AzPgClient;

var AzPg = function () {
  function AzPg() {
    _classCallCheck(this, AzPg);

    this.read_file_promise = read_file_promise;
  }

  _createClass(AzPg, [{
    key: "create_connection",
    value: function create_connection(con_str) {
      return new Promise(function (resolve, reject) {
        var client = new _pg["default"].Client(con_str);
        client.on('error', function (error) {
          if (error.code === "ECONNRESET") {
            console.error("Catch ECONNRESET !!!");
          } else if (error.code === "57P01") {
            console.error("Catch 57P01 !!!");
          } else {
            console.error("Catch uncaughtException pg err !!!");
            throw error;
          }
        });
        client.connect(function (error) {
          if (error) {
            reject({
              error_type: ErrorTypes.Connection,
              client: client,
              error: error
            });
          } else {
            resolve({
              client: client,
              result: client
            });
          }
        });
      });
    }
  }, {
    key: "send_query_promise",
    value: function send_query_promise(client, query_text) {
      return new Promise(function (resolve, reject) {
        client.query(query_text, function (error, result) {
          if (error) {
            reject({
              error_type: ErrorTypes.Query,
              client: client,
              error: error
            });
          } else {
            resolve({
              client: client,
              result: result
            });
          }
        });
      });
    }
  }, {
    key: "disconnect_all_user",
    value: function disconnect_all_user(client, dbname) {
      var query_text = "";

      if (dbname) {
        query_text = "SELECT pg_terminate_backend(pg_stat_activity.pid)\n                    FROM pg_stat_activity\n                    WHERE pg_stat_activity.datname = '".concat(dbname, "'\n                    AND pid <> pg_backend_pid()");
      } else {
        query_text = "SELECT pg_terminate_backend(pg_stat_activity.pid)\n                    FROM pg_stat_activity\n                    WHERE pid <> pg_backend_pid();";
      }

      return this.send_query_promise(client, query_text);
    }
  }, {
    key: "send_query_from_file_promise",
    value: function send_query_from_file_promise(client, file, encoding) {
      var _this4 = this;

      return this.read_file_promise(file, encoding).then(function (data) {
        return _this4.send_query_promise(client, data);
      }).then(function (result) {
        return Promise.resolve(result);
      })["catch"](function (error) {
        return Promise.reject(error);
      });
    }
  }]);

  return AzPg;
}();

var _AzPg = new AzPg();

var DB_DEFAULT_SETTINGS = " TEMPLATE template1 ENCODING = 'UTF8' TABLESPACE = pg_default CONNECTION LIMIT = -1";
exports.DB_DEFAULT_SETTINGS = DB_DEFAULT_SETTINGS;

function removeRoleAndDb(client, dbName, roleName) {
  return _AzPg.disconnect_all_user(client, dbName).then(function (result) {
    return _AzPg.send_query_promise(client, "DROP DATABASE IF EXISTS ".concat(dbName, ";"));
  }).then(function (result) {
    return _AzPg.send_query_promise(client, "DROP ROLE IF EXISTS ".concat(roleName, ";"));
  });
}

function createRoleAndDb(client, dbName, roleName, rolePassword) {
  return _AzPg.send_query_promise(client, "CREATE ROLE ".concat(roleName, " SUPERUSER INHERIT CREATEDB CREATEROLE NOREPLICATION LOGIN PASSWORD '").concat(rolePassword, "';")).then(function (result) {
    return _AzPg.send_query_promise(client, "ALTER ROLE ".concat(roleName, " VALID UNTIL 'infinity';"));
  }).then(function (result) {
    return _AzPg.send_query_promise(client, "CREATE DATABASE ".concat(dbName, " OWNER = ").concat(roleName, " ").concat(DB_DEFAULT_SETTINGS, ";"));
  });
}

var AzPgImi = function () {
  function AzPgImi() {
    _classCallCheck(this, AzPgImi);
  }

  _createClass(AzPgImi, null, [{
    key: "get_system_state",
    value: function get_system_state(conn) {
      if (conn instanceof _pg["default"].Client) {
        return _AzPg.send_query_promise(conn, "SELECT fn_get_core_env_var('system_state');").then(function (result) {
          return {
            client: result.client,
            system_state: result.result.rows[0].fn_get_core_env_var
          };
        })["catch"](function (error) {
          return Promise.reject({
            error: error,
            client: conn,
            system_state: null
          });
        });
      } else if (typeof conn === "string") {
        return _AzPg.create_connection(conn).then(function (result) {
          return _AzPg.send_query_promise(result.client, "SELECT fn_get_core_env_var('system_state');");
        }).then(function (result) {
          return {
            client: result.client,
            system_state: result.result.rows[0].fn_get_core_env_var
          };
        })["catch"](function (error) {
          if (error.error_type === ErrorTypes.Connection) {
            return Promise.reject({
              error: error,
              client: null,
              system_state: null
            });
          }

          return Promise.reject({
            error: error,
            client: error.client,
            system_state: null
          });
        });
      }

      return Promise.reject({
        error: 'no connect string provided'
      });
    }
  }]);

  return AzPgImi;
}();

exports.AzPgImi = AzPgImi;
var _default = _AzPg;
exports["default"] = _default;