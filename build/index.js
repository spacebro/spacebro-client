'use strict';

var io = require('socket.io-client');
var _ = require('lodash');
var socket = undefined;

var socketioInit = function socketioInit(err, address, port, actionList, clientName) {
  if (err) {
    console.log(err.stack);
  }
  console.log('---------------------------');
  console.log('service found at address: ', address);
  socket = io('http://' + address + ':' + port).on('connect', function () {
    console.log('socketio connected to ' + 'http://' + address + ':' + port);
    var nameList = _.map(actionList, function (el) {
      return el.name;
    });
    socket.emit('register', { eventsList: nameList, clientName: clientName || 'pid-' + process.pid });
  });
  console.log('List of actions registered:');
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var action = _step.value;

      console.log(action.name);
      socket.on(action.name, function (data) {
        if (action.trigger) {
          action.trigger(data);
        }
      });
    };

    for (var _iterator = actionList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
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

  console.log('---------------------------');
};

var registerToMaster = function registerToMaster(actionList, clientName, zeroconfName) {
  var mdns = require('../lib/mdns.js');
  mdns.on('service-down', function (data) {
    console.log(data + ' is down =(');
  });
  console.log('Wating for spacebro...');
  mdns.connectToService(zeroconfName || 'spacebro', function (err, address, port) {
    socketioInit(err, address, port, actionList, clientName);
  });
};

var socketioConnect = function socketioConnect(address, port, actionList, clientName) {
  socketioInit(null, address, port, actionList, clientName);
};

module.exports = {
  registerToMaster: registerToMaster,
  socketioConnect: socketioConnect,
  emit: function emit(event, data) {
    if (socket) {
      socket.emit(event, data);
    }
  }
};