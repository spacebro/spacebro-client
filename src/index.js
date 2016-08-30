'use strict'

import patchMaker from 'socketio-wildcard'
import io from 'socket.io-client'
import Signal from 'signals'
import mdns from './mdns'
import _ from 'lodash'
import config from './config'
import log from './log'

// Variables
let connected = false
let unpackers = []
let packers = []
let events = {}
let sockets = []
const patch = patchMaker(io.Manager)

// Initialization
function connect (address, port, options) {
  if (typeof address === 'object') {
    return connect(false, false, address)
  } else if (typeof port === 'object'){
    return connect(address, false, port)
  }
  Object.assign(config, options)

  log('Connect with the config:', config)
  if (address && port) {
    socketioInit(null, address, port)
  } else if (address) {
    mdns.connectToService(config.zeroconfName, function (err, addressReceived, port) {
      if (address === addressReceived){
        socketioInit(err, address, port)
      } else {
        log(`Not connecting, the address does not match the one defined ${address}`)
      }
    })
  } else {
    mdns.connectToService(config.zeroconfName, function (err, address, port) {
      socketioInit(err, address, port)
    })
  }
  for (let packer of config.packers){
    addPacker(packer.handler, packer.priority, packer.eventName)
  }
  for (let unpacker of config.unpackers){
    addUnpacker(unpacker.handler, unpacker.priority, unpacker.eventName)
  }
}

function socketioInit (err, address, port) {
  if (err) log(err.stack)
  let url = 'http://' + address + ':' + port
  let socket = io(url)
  patch(socket)
  socket
    .on('connect', function () {
      log('Socket', url, 'connected')
      socket.emit('register', {
        clientName: config.clientName,
        channelName: config.channelName
      })
      sockets.push(socket)
      connected = true
      if (events['connect']) {
        events['connect'].dispatch({
          server: {
            address: address,
            port: port
          }
        })
      }
    })
    .on('error', function (err) {
      log('Socket', url, 'error:', err)
      if (events['error']) {
        events['error'].dispatch({
          server: {
            address: address,
            port: port
          }, 
          err: err
        })
      }
    })
    .on('disconnect', function () {
      log('Socket', url, 'down')
      sockets.splice(sockets.indexOf(socket), 1)
      connected = false
      if (events['disconnect']) {
        events['disconnect'].dispatch({
          server: {
            address: address,
            port: port
          }
        })
      }
    })
    .on('reconnect', function(){
      log('Socket', url, 'reconnected')
      sockets.push(socket)
      connected = true
      if (events['reconnect']) {
        events['reconnect'].dispatch({
          server: {
            address: address,
            port: port
          }
        })
      }
    })
    .on('*', function ({ data }) {
      let [eventName, args] = data
      log('Socket', url, 'received', eventName, 'with data:', args)
      if (!config.sendBack && args._from === config.clientName) {
        log('Received my own event, not dispatching')
        return
      } else {
        for (let unpack of filterHooks(eventName, unpackers)) {
          let unpacked = unpack({ eventName, data: args })
          if (unpacked === false) return
          data = unpacked || data
        }
        if (_.has(events, eventName)) {
          events[eventName].dispatch(args)
        }
      }
    })
}

function addPacker (handler, priority, eventName) { addHook(packers, eventName, handler, priority) }
function addUnpacker (handler, priority, eventName) { addHook(unpackers, eventName, handler, priority) }

// Emission
function emit (eventName, data) {
  sendTo(eventName, null, data)
}

function sendTo (eventName, to = null , data = {}) {
  if (!connected) {
    return log("You're not connected.")
  } else {
    data._to = to
    data._from = config.clientName
    for (let pack of filterHooks(eventName, packers)) {
      data = pack({ eventName, data}) || data
    }
    for (let socket of sockets) {
      socket.emit(eventName, data)
    }
  }
}

// Reception
function on (eventName, handler, handlerContext, priority) {
  return touch(eventName).add(handler, handlerContext, priority)
}

function once (eventName, handler, handlerContext, priority) {
  return touch(eventName).addOnce(handler, handlerContext, priority)
}

// Disposal
function clear (eventName) {
  return touch(eventName).removeAll()
}

function remove (eventName, listener, context) {
  return touch(eventName).remove(listener, context)
}

function dispose () {
  for (let eventName in events) touch(eventName).dispose()
}

module.exports = {
  connect, addPacker, addUnpacker,
  emit, sendTo,
  on, once,
  clear, remove, dispose,
// Old Stuff
registerToMaster, iKnowMyMaster}

function filterHooks (eventName, hooks) {
  return hooks
    .filter(hook => [eventName, '*'].indexOf(hook.eventName) !== -1)
    .sort(hook => -hook.priority || 0)
    .map(hook => hook.handler)
}

function addHook (hooks, eventName = '*' , handler, priority = 0) {
  hooks.push({ eventName, handler, priority})
}

function touch (eventName) {
  if (!_.has(events, eventName)) {
    events[eventName] = new Signal()
  }
  return events[eventName]
}

// Old Stuff
let staticAddress, staticPort

function iKnowMyMaster (address, port) {
  console.warn('this are deprecated function and will be removed')
  staticAddress = address
  staticPort = port
}

function registerToMaster (actionList, clientName, zeroconfName) {
  console.warn('this are deprecated function and will be removed')
  return connect(staticAddress, staticPort, { clientName, zeroconfName})
}
