'use strict'

const mdns = require('./lib/mdns.js')
const io = require('socket.io-client')
const _ = require('lodash')

function registerToMaster (actionList, clientName, zeroconfName) {
  mdns.connectToService(zeroconfName || 'chywalry', function socketioInit(err, address, port) {
    console.log('service found: ', address)
    var socket = io('http://' + address + ':' + port)
    socket
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
        action.trigger(data)
      })
    }
  })
}

module.exports = {
  registerToMaster: registerToMaster
}
