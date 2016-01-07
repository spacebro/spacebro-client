'use strict'

const mdns = require('../lib/mdns.js')
const io = require('socket.io-client')
const _ = require('lodash')
let socket

function registerToMaster (actionList, clientName, zeroconfName) {
  console.log('Wating for spacebro...')
  mdns.connectToService(zeroconfName || 'spacebro', function socketioInit (err, address, port) {
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
