'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _socketioWildcard = require('socketio-wildcard');

var _socketioWildcard2 = _interopRequireDefault(_socketioWildcard);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _signals = require('signals');

var _signals2 = _interopRequireDefault(_signals);

var _mdns = require('./mdns');

var _mdns2 = _interopRequireDefault(_mdns);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Default config
var config = {
  zeroconfName: 'spacebro',
  channelName: null,
  clientName: null,
  packers: [],
  unpackers: [],
  sendBack: true,
  verbose: true
};

// Variables
var connected = false;
var unpackers = [];
var packers = [];
var events = {};
var sockets = [];
var patch = (0, _socketioWildcard2.default)(_socket2.default.Manager);

// Initialization
function connect(address, port, options) {
  if ((typeof address === 'undefined' ? 'undefined' : (0, _typeof3.default)(address)) === 'object') {
    return connect(false, false, address);
  }
  config = _lodash2.default.merge(config, options);
  log('Connect with the config:', config);
  if (address && port) {
    socketioInit(null, address, port);
  } else {
    _mdns2.default.connectToService(config.zeroconfName, function (err, address, port) {
      socketioInit(err, address, port);
    });
  }
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(config.packers), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var packer = _step.value;

      addPacker(packer.handler, packer.priority, packer.eventName);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = (0, _getIterator3.default)(config.unpackers), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var unpacker = _step2.value;

      addUnpacker(unpacker.handler, unpacker.priority, unpacker.eventName);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

function socketioInit(err, address, port) {
  if (err) log(err.stack);
  var url = 'http://' + address + ':' + port;
  var socket = (0, _socket2.default)(url);
  patch(socket);
  socket.on('connect', function () {
    log('Socket', url, 'connected');
    socket.emit('register', {
      clientName: config.clientName,
      channelName: config.channelName
    });
    sockets.push(socket);
    connected = true;
  }).on('error', function (err) {
    log('Socket', url, 'error:', err);
  }).on('disconnect', function () {
    log('Socket', url, 'down');
    sockets.splice(sockets.indexOf(socket), 1);
    connected = false;
  }).on('*', function (_ref) {
    var data = _ref.data;
    var _data = data;

    var _data2 = (0, _slicedToArray3.default)(_data, 2);

    var eventName = _data2[0];
    var args = _data2[1];

    log('Socket', url, 'received', eventName, 'with data:', args);
    if (config.sendBack && args._from === config.clientName) return;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = (0, _getIterator3.default)(filterHooks(eventName, unpackers)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var unpack = _step3.value;

        var unpacked = unpack({ eventName: eventName, data: args });
        if (unpacked === false) return;
        data = unpacked || data;
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    if (_lodash2.default.has(events, eventName)) events[eventName].dispatch(args);
  });
}

function addPacker(handler, priority, eventName) {
  addHook(packers, eventName, handler, priority);
}
function addUnpacker(handler, priority, eventName) {
  addHook(unpackers, eventName, handler, priority);
}

// Emission
function emit(eventName, data) {
  sendTo(eventName, null, data);
}

function sendTo(eventName) {
  var to = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
  var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  if (!connected) return log('You\'re not connected.');
  data._to = to;
  data._from = config.clientName;
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = (0, _getIterator3.default)(filterHooks(eventName, packers)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var pack = _step4.value;

      data = pack({ eventName: eventName, data: data }) || data;
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = (0, _getIterator3.default)(sockets), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var socket = _step5.value;
      socket.emit(eventName, data);
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }
}

// Reception
function on(eventName, handler, handlerContext, priority) {
  return touch(eventName).add(handler, handlerContext, priority);
}

function once(eventName, handler, handlerContext, priority) {
  return touch(eventName).addOnce(handler, handlerContext, priority);
}

// Disposal
function clear(eventName) {
  return touch(eventName).removeAll();
}

function remove(eventName, listener, context) {
  return touch(eventName).remove(listener, context);
}

function dispose() {
  for (var eventName in events) {
    touch(eventName).dispose();
  }
}

module.exports = {
  connect: connect, addPacker: addPacker, addUnpacker: addUnpacker,
  emit: emit, sendTo: sendTo,
  on: on, once: once,
  clear: clear, remove: remove, dispose: dispose,
  // Old Stuff
  registerToMaster: registerToMaster, iKnowMyMaster: iKnowMyMaster
};

// = Helpers ===
function log() {
  var _console;

  if (!config.verbose) return;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  (_console = console).log.apply(_console, ['SpaceBro -'].concat(args));
}

function filterHooks(eventName, hooks) {
  return hooks.filter(function (hook) {
    return [eventName, '*'].indexOf(hook.eventName) !== -1;
  }).sort(function (hook) {
    return -hook.priority || 0;
  }).map(function (hook) {
    return hook.handler;
  });
}

function addHook(hooks) {
  var eventName = arguments.length <= 1 || arguments[1] === undefined ? '*' : arguments[1];
  var handler = arguments[2];
  var priority = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  hooks.push({ eventName: eventName, handler: handler, priority: priority });
}

function touch(eventName) {
  if (!_lodash2.default.has(events, eventName)) {
    events[eventName] = new _signals2.default();
  }
  return events[eventName];
}

// Old Stuff
var staticAddress = void 0,
    staticPort = void 0;

function iKnowMyMaster(address, port) {
  staticAddress = address;
  staticPort = port;
}

function registerToMaster(actionList, clientName, zeroconfName) {
  return connect(staticAddress, staticPort, { clientName: clientName, zeroconfName: zeroconfName });
}