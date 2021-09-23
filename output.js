import regeneratorRuntime from "regenerator-runtime";
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _asyncToGenerator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
// const { access } = require('fs').promises
var fs = require('fs');
var split2 = require('split2');
var events = require('events');
var pkjson = require('./package.json');
var emitter = new events.EventEmitter();
(function() {
    var ctx = {
        _init: new Date(),
        args: process.argv
    };
    emitter.on('start', function() {
        return console.log('starting conversion');
    });
    csvtosql.call(ctx);
})();
function _csvtosql() {
    _csvtosql = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var _this, _this1, _this2, _this3, args, usage, count, isEmail, isNumber, isDate, isTime, isDateTime, isBoolean, isString, isEmpty, generateSQL;
        return regeneratorRuntime.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    _this = this, _this1 = this, _this2 = this, _this3 = this;
                    var ref;
                    ref = this, args = ref.args, ref;
                    usage = function() {
                        return process.stdout.write(" \n\t".concat(pkjson.name, " v").concat(pkjson.version, "\n\t").concat(pkjson.description, "\nUsage:\n  \t--source | -s [dir] select the source file or directory\n  \t--help | -h [dir] get help\n  \t--version | -v [dir] get the current version\n  \t\n"));
                    };
                    if (args.length < 3) {
                        usage();
                        process.exit(1);
                    }
                    if (args.find(function(arg) {
                        return arg === '--help' || arg === '-h';
                    })) {
                        usage();
                        process.exit(0);
                    }
                    if (args.find(function(arg) {
                        return arg === '--version' || arg === '-v';
                    })) {
                        process.stdout.write("".concat(pkjson.name, " v").concat(pkjson.version, "\n"));
                        process.exit(0);
                    }
                    if (args.find(function(arg) {
                        return arg === '--source' || arg === '-s';
                    })) {
                        if (args[args.indexOf('--source') + 1] === undefined || args[args.indexOf('-s') + 1] === undefined) {
                            process.stdout.write("--source | -s [dir] select the source file or directory \n");
                        } else if (args[args.indexOf('-s') + 1].endsWith('.csv')) {
                            this.source = args[args.indexOf('-s') + 1];
                            this.tableName = this.source.split('/').pop().split('.')[0].toLowerCase();
                            console.log("source: ".concat(this.source));
                        }
                    }
                    _ctx.next = 9;
                    return fs.access(this.source, fs.constants.R_OK | fs.constants.W_OK).catch(function(e) {
                        // new Error to send back stack trace
                        throw new Error("".concat(_this.source, " is not readable or writable \n ").concat(e, "\n"));
                    });
                case 9:
                    count = 0;
                    isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    isNumber = /^[0-9]+$/;
                    isDate = /^\d{4}-\d{2}-\d{2}$/;
                    isTime = /^\d{2}:\d{2}:\d{2}$/;
                    isDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
                    isBoolean = /^(true|false)$/;
                    isString = /^[^\s]+$/;
                    isEmpty = /^$/;
                    fs.createReadStream(this.source).pipe(split2()).on('data', function(line) {
                        count++;
                        if (count === 1) {
                            _this1.headers = line.split(',').map(function(col) {
                                if (col.match(/^[0-9]+$/)) return "".concat(col, " INT");
                                if (col.match(/^[0-9]+\.[0-9]+$/)) return "".concat(col, " FLOAT");
                                if (col.match(isEmail)) return "".concat(col.toLowerCase(), " TEXT");
                                if (col.match(isNumber)) return "".concat(col, " INT");
                                if (col.match(isDate)) return "".concat(col, " DATE");
                                if (col.match(isTime)) return "".concat(col, " TIME");
                                if (col.match(isDateTime)) return "".concat(col, " DATETIME");
                                if (col.match(isBoolean)) return "".concat(col, " BOOLEAN");
                                if (col.match(isString)) return "".concat(col.toLowerCase(), " TEXT");
                                if (col.match(isEmpty)) return "".concat(col.toLowerCase(), " TEXT");
                                return "".concat(col.toLowerCase(), " TEXT");
                            });
                        } else {
                            var values = line.split(',').map(function(val) {
                                if (val.match(isEmail)) return "'".concat(val, "'");
                                if (val.match(isNumber)) return "".concat(val);
                                if (val.match(isDate)) return "'".concat(val, "'");
                                if (val.match(isTime)) return "'".concat(val, "'");
                                if (val.match(isDateTime)) return "'".concat(val, "'");
                                if (val.match(isBoolean)) return "".concat(val);
                                if (val.match(isString)) return "'".concat(val, "'");
                                if (val.match(isEmpty)) return "NULL";
                                return "'".concat(val, "'");
                            });
                            var sql = "INSERT INTO ".concat(_this1.tableName, " (").concat(_this1.headers.join(','), ") VALUES (").concat(values.join(','), "); \n \n");
                            _this1.sql += sql;
                        }
                    }).on('end', function() {
                        console.log("".concat(_this2.headers.length, " headers found"));
                        console.log("".concat(count, " lines processed"));
                        console.log("".concat(new Date().getTime() - _this2._init.getTime(), " ms elapsed"));
                        var sql = generateSQL();
                        fs.writeFile("./".concat(_this2.tableName, ".sql"), sql, function(err) {
                            if (err) throw err;
                            console.log('SQL file created');
                        });
                    }).once('readable', function() {
                        emitter.emit('start');
                    }).on('error', function(err) {
                        throw new Error(err);
                    });
                    generateSQL = function() {
                        var inStatement = "".concat(_this3.headers.map(function(h) {
                            return "".concat(h);
                        }));
                        var create = "CREATE TABLE IF NOT EXISTS ".concat(_this3.tableName, " (").concat(inStatement, ")");
                        return "".concat(create, ";\n").concat(_this3.sql);
                    };
                case 20:
                case "end":
                    return _ctx.stop();
            }
        }, _callee, this);
    }).bind(this));
    return _csvtosql.apply(this, arguments);
}
function csvtosql() {
    return _csvtosql.apply(this, arguments);
}
module.exports = csvtosql;

