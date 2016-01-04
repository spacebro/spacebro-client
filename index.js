'use strict'

var mdns = require('./lib/mdns.js')
var io = require('socket.io-client')
var _ = require('lodash')
var socket

function registerToMaster (actionList, clientName, zeroconfName) {
  mdns.connectToService(zeroconfName || 'spacebro', function socketioInit (err, address, port) {
    console.log('service found: ', address)
    socket = io('http://' + address + ':' + port)
      .on('connect', function () {
        console.log('socketio connected to ' + 'http://' + address + ':' + port)
        var nameList = _.map(actionList, function (el) {
          return el.name
        })
        socket.emit('register', { eventsList: nameList, clientName: clientName || 'pid-' + process.pid })
      })
    for (let action of actionList) {
      console.log(action.name)
      socket.on(action.name, function (data) {
        if (action.trigger) {
          action.trigger(data)
        }
      })
    }
  })
}

module.exports = {
  registerToMaster: registerToMaster,
  emit: function (event, data) {
    if (socket) {
      socket.emit(event, data)
    }
  }
}
