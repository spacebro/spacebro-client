'use strict';

var mdns = require('../lib/mdns.js');
var io = require('socket.io-client');
var _ = require('lodash');
var socket = undefined;

function registerToMaster(actionList, clientName, zeroconfName) {
  mdns.connectToService(zeroconfName || 'spacebro', function socketioInit(err, address, port) {
    console.log('service found: ', address);
    socket = io('http://' + address + ':' + port).on('connect', function () {
      console.log('socketio connected to ' + 'http://' + address + ':' + port);
      var nameList = _.map(actionList, function (el) {
        return el.name;
      });
      socket.emit('register', { eventsList: nameList, clientName: clientName || 'pid-' + process.pid });
    });
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
  });
}

module.exports = {
  registerToMaster: registerToMaster,
  emit: function emit(event, data) {
    if (socket) {
      socket.emit(event, data);
    }
  }
};