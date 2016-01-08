'use strict';

var io = require('socket.io-client');
var _ = require('lodash');
var staticPort = undefined,
    staticAddress = undefined;
var sockets = [];

var socketioInit = function socketioInit(err, address, port, actionList, clientName) {
  if (err) {
    console.log(err.stack);
  }
  var socket = undefined;
  console.log('---------------------------');
  socket = io('http://' + address + ':' + port);
  socket.on('connect', function () {
    sockets.push(socket);
    console.log('socketio connected to ' + 'http://' + address + ':' + port);
    var nameList = _.map(actionList, function (el) {
      return el.name;
    });
    socket.emit('register', { eventsList: nameList, clientName: clientName || 'pid-' + process.pid });
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
  });
  socket.on('disconnect', function () {
    console.log('socket down: ', address + ':' + port);
    sockets.splice(sockets.indexOf(socket), 1);
  });
};

var registerToMaster = function registerToMaster(actionList, clientName, zeroconfName) {
  if (staticAddress) {
    socketioInit(null, staticAddress, staticPort, actionList, clientName);
  } else {
    var mdns = require('../lib/mdns.js');
    // not useful as it is already in lib/mdns.js
    /*
    mdns.on('service-down', function (data) {
      console.log(data + ' is down =(')
    })
    */
    console.log('Waiting for spacebro...');
    mdns.connectToService(zeroconfName || 'spacebro', function (err, address, port) {
      socketioInit(err, address, port, actionList, clientName);
    });
  }
};

var iKnowMyMaster = function iKnowMyMaster(address, port) {
  staticPort = port;
  staticAddress = address;
};

module.exports = {
  registerToMaster: registerToMaster,
  iKnowMyMaster: iKnowMyMaster,
  emit: function emit(event, data) {
    sockets.forEach(function (socket) {
      socket.emit(event, data);
    });
  }
};