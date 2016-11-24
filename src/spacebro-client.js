'use strict'

import wildcard from 'socketio-wildcard'
import io from 'socket.io-client'
import Signal from 'signals'

const isNode = (typeof process !== 'undefined')
const patch = wildcard(io.Manager)

let config = {
  zeroconfName: 'spacebro',
  channelName: null,
  clientName: null,
  packers: [],
  unpackers: [],
  sendBack: true,
  verbose: true
}

let connected = false
let unpackers = []
let packers = []
let sockets = []
let events = {}

const mdns = isNode ? require('./mdns') : null

function connect (_address, _port, _options) {
  let address = (typeof _address === 'object') ? null : _address
  let port = (typeof _address === 'object') ? null : (typeof _port === 'object') ? null : _port
  let options = (typeof _address === 'object') ? _address : (typeof _port === 'object') ? _port : _options

  Object.assign(config, options)
  log('connected with config:\n', config)

  if (address && port) {
    initSocketIO(address, port, null)
  // the following else if/else will be rewritten
  } else if (isNode && address) {
    mdns.connectToService(config.zeroconfName, (err, addressReceived, port) => {
      if (address === addressReceived){
        initSocketIO(address, port, err)
      } else {
        log(`address provides does not match ${address} mdns found`)
      }
    })
  } else if (isNode) {
    mdns.connectToService(config.zeroconfName, (err, addressReceived, port) => {
      initSocketIO(addressReceived, port, err)
    })
  } else {
    log('please provide a server address and port')
  }

  for (let packer of config.packers){
    addPacker(packer.handler, packer.priority, packer.eventName)
  }
  for (let unpacker of config.unpackers){
    addUnpacker(unpacker.handler, unpacker.priority, unpacker.eventName)
  }
}

function initSocketIO (address, port, err) {
  err && log(err.stack)

  let parsedURI = require('url').parse(address)
  let protocol = parsedURI.protocol ? '' : 'ws://'
  let url = `${protocol}${address}:${port}`

  let socket = io(url)

  patch(socket)

  socket
    .on('connect', function () {
      log('socket connected')
      sockets.push(socket)
      socket.emit('register', {
        clientName: config.clientName,
        channelName: config.channelName
      })
      connected = true
    })
    .on('error', function (err) {
      log('error', err)
    })
    .on('disconnect', function () {
      log('socket down')
      connected = false
    })
    .on('reconnect', function(){
      log('socket reconnected')
      connected = true
    })
    .on('*', function ({ data }) {
      let [eventName, args] = data
      if (!config.sendBack && args._from === config.clientName) {
        return
      } else if (events[eventName]) {
        log(`socket received ${eventName} with data:`, args)
        for (let unpack of filterHooks(eventName, unpackers)) {
          const unpacked = unpack({ eventName, data: args })
          args = unpacked || args
        }
        events[eventName].dispatch(args)
      }
    })
}

function addPacker (handler, priority, eventName) { addHook(packers, eventName, handler, priority) }
function addUnpacker (handler, priority, eventName) { addHook(unpackers, eventName, handler, priority) }

function emit (eventName, data = {}) {
  if(typeof data !== 'object'){
    data = {data: data}
    data.altered = true
  }
  sendTo(eventName, null, data)
}

function sendTo (eventName, to = null , data = {}) {
  if (connected) {
    data._to = to
    data._from = config.clientName
    for (let pack of filterHooks(eventName, packers)) {
      data = pack({ eventName, data}) || data
    }
    for (let socket of sockets) {
      socket.emit(eventName, data)
    }
  } else {
    log('not connected')
  }
}

// Reception
function on (eventName, handler, handlerContext, priority) {
  events[eventName] = new Signal()
  events[eventName].add(handler, handlerContext, priority)
}

function once (eventName, handler, handlerContext, priority) {
  events[eventName] = new Signal()
  events[eventName].addOnce(handler, handlerContext, priority)
}

function off (eventName) {
  delete events[eventName]
}

function filterHooks (eventName, hooks) {
  return hooks
    .filter(hook => [eventName, '*'].indexOf(hook.eventName) !== -1)
    .sort(hook => -hook.priority || 0)
    .map(hook => hook.handler)
}

function addHook (hooks, eventName = '*' , handler, priority = 0) {
  hooks.push({ eventName, handler, priority})
}

function log (...args) {
  console.log('spacebro-client -', ...args)
}

export default { connect, addPacker, addUnpacker, emit, sendTo, on, once, off }
