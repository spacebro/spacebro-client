'use strict'


const io = require('socket.io-client')
const _ = require('lodash')
let socket


var socketioInit = function (err, address, port, actionList, clientName) {
  if (err) {
    console.log(err.stack)
  }
  console.log('---------------------------')
  console.log('service found at address: ', address)
  socket = io('http://' + address + ':' + port)
    .on('connect', function () {
      console.log('socketio connected to ' + 'http://' + address + ':' + port)
      var nameList = _.map(actionList, function (el) {
        return el.name
      })
      socket.emit('register', { eventsList: nameList, clientName: clientName || 'pid-' + process.pid })
    })
  console.log('List of actions registered:')
  for (let action of actionList) {
    console.log(action.name)
    socket.on(action.name, function (data) {
      if (action.trigger) {
        action.trigger(data)
      }
    })
  }
  console.log('---------------------------')
}

var registerToMaster = function (actionList, clientName, zeroconfName) {
  let mdns = require('../lib/mdns.js')
  mdns.on('service-down', function (data) {
    console.log(data + ' is down =(')
  })
  console.log('Wating for spacebro...')
  mdns.connectToService(zeroconfName || 'spacebro', function (err, address, port) {
    socketioInit(err, address, port, actionList, clientName)
  })
}

var socketioConnect = function (address, port, actionList, clientName) {
  socketioInit(null, address, port, actionList, clientName)
}

module.exports = {
  registerToMaster: registerToMaster,
  socketioConnect: socketioConnect,
  emit: function (event, data) {
    if (socket) {
      socket.emit(event, data)
    }
  }
}
