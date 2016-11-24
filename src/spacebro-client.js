'use strict'

import wildcard from 'socketio-wildcard'
import io from 'socket.io-client'
import Signal from 'signals'
import logger from './logger'
import autoconnect from './autoconnect'
import isNode from './is-node'

const patch = wildcard(io.Manager)

let config = {
  zeroconfName: 'spacebro',
  channelName: null,
  clientName: null,
  packers: [],
  unpackers: [],
  sendBack: true,
  verbose: true,
  multiServers: false
}

let connected = false
let unpackers = []
let packers = []
let sockets = []
let events = {}

function connect (_address, _port, _options) {
  let address = (typeof _address === 'object') ? null : _address
  let port = (typeof _address === 'object') ? null : (typeof _port === 'object') ? null : _port
  let options = (typeof _address === 'object') ? _address : (typeof _port === 'object') ? _port : _options

  Object.assign(config, options)
  logger.setup(config.verbose)
  logger.log('connected with config:\n', config)

  if (address && port) {
    initSocketIO(address, port, null)
  } else if (isNode && address) {
    autoconnect.setup(config.zeroconfName, (addressFound, port) => {
      if (address === addressFound) {
        initSocketIO(address, port)
      } else {
        logger.log(`address found does not match ${address}`)
      }
    })
  } else if (isNode) {
    autoconnect.setup(config.zeroconfName, (addressFound, found) => {
      if (!connected || config.multiServers) {
        connected = true
        initSocketIO(addressFound, port)
        logger.log(`connecting to the first ${config.zeroconfName} name we found on ${addressFound}:${port}`)
      } else {
        logger.warn(`multiServers is disabled, skipping ${config.zeroconfName} on ${addressFound}:${port}`)
      }
    })
  } else {
    logger.warn('please provide a server address and port')
  }

  for (let packer of config.packers){
    addPacker(packer.handler, packer.priority, packer.eventName)
  }
  for (let unpacker of config.unpackers){
    addUnpacker(unpacker.handler, unpacker.priority, unpacker.eventName)
  }
}

function initSocketIO (address, port) {
  let parsedURI = require('url').parse(address)
  let protocol = parsedURI.protocol ? '' : 'ws://'
  let url = `${protocol}${address}:${port}`

  let socket = io(url)

  patch(socket)

  socket
    .on('connect', function () {
      logger.log('socket connected')
      sockets.push(socket)
      socket.emit('register', {
        clientName: config.clientName,
        channelName: config.channelName
      })
    })
    .on('error', function (err) {
      logger.warn('error', err)
    })
    .on('disconnect', function () {
      logger.log('socket down')
      connected = false
    })
    .on('reconnect', function(){
      logger.log('socket reconnected')
      connected = true
    })
    .on('*', function ({ data }) {
      let [eventName, args] = data
      if (!config.sendBack && args._from === config.clientName) {
        return
      } else if (events[eventName]) {
        logger.log(`socket received ${eventName} with data:`, args)
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
    logger.warn('not connected')
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

export default { connect, addPacker, addUnpacker, emit, sendTo, on, once, off }
