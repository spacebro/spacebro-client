'use strict'

const io = require('socket.io-client')
const _ = require('lodash')

let staticPort, staticAddress
let sockets = []

function socketioInit (err, address, port, actionList, clientName) {
  if (err) console.log(err.stack)
  let socket
  console.log('---------------------------')
  socket = io('http://' + address + ':' + port)
  socket.on('connect', function () {
    sockets.push(socket)
    console.log('socketio connected to ' + 'http://' + address + ':' + port)
    var nameList = _.map(actionList, function (el) {
      return el.name
    })
    socket.emit('register', { eventsList: nameList, clientName: clientName || 'pid-' + process.pid })
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
  })
  socket.on('disconnect', function () {
    console.log('socket down: ', address + ':' + port)
    sockets.splice(sockets.indexOf(socket), 1)
  })
}

function registerToMaster (actionList, clientName, zeroconfName) {
  if (staticAddress) {
    socketioInit(null, staticAddress, staticPort, actionList, clientName)
  } else {
    let mdns = require('../lib/mdns.js')
    // event propagation for andling error at the top level
    // next is implement EventEmitter in spacebro
    /*
    mdns.on('service-down', function (data) {
      console.log(data + ' is down =(')
    })
    */
    console.log('Waiting for spacebro...')
    mdns.connectToService(zeroconfName || 'spacebro', function (err, address, port) {
      socketioInit(err, address, port, actionList, clientName)
    })
  }
}

function iKnowMyMaster (address, port) {
  staticPort = port
  staticAddress = address
}

module.exports = {
  registerToMaster, iKnowMyMaster,
  emit: function (event, data) {
    sockets.forEach(function (socket) {
      socket.emit(event, data)
    })
  }
}
