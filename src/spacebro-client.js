'use strict'

import wildcard from 'socketio-wildcard'
import io from 'socket.io-client'
import Signal from 'signals'
import logger from './logger'

const patch = wildcard(io.Manager)

let config = {
  channelName: null,
  clientName: null,
  packers: [],
  unpackers: [],
  sendBack: true,
  verbose: true,
  multiService: false
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
  logger.log(`Trying to connect on ${address}:${port} with config:\n`, config)

  if (address && port) {
    initSocketIO(address, port, null)
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
      connected = true
      logger.log('socket connected')
      if (sockets.length < 1) {
        sockets.push(socket)
      } else {
        sockets.forEach((el) => {
          if (el.id !== socket.id) {
            sockets.push(socket)
          }
        })
      }
      socket.emit('register', {
        clientName: config.clientName,
        channelName: config.channelName
      })
      events['connect'] && events['connect'].dispatch(socket)
    })
    .on('connect_error', (err) => {
      logger.warn('error', err)
      connected = false
      events['connect_error'] && events['connect_error'].dispatch(err)
    })
    .on('connect_timeout', ()=>{
      logger.warn('connection timeout')
      events['connect_timeout'] && events['connect_timeout'].dispatch()
    })
    .on('error', function (err) {
      logger.warn('error', err)
      connected = false
      events['error'] && events['error'].dispatch(err)
    })
    .on('disconnect', function (err) {
      logger.log('socket down')
      events['disconnect'] && events['disconnect'].dispatch(err)
      connected = false
    })
    .on('reconnect', function (data) {
      logger.log('socket reconnected')
      events['reconnect'] && events['reconnect'].dispatch(data)
      connected = true
    })
    .on('reconnect_attempt', function (attempt) {
      logger.log(`socket reconnect attempt: ${attempt}`)
      events['reconnect_attempt'] && events['reconnect_attempt'].dispatch(attempt)
    })
    .on('reconnecting', function (attempt) {
      logger.log(`socket try to reconnect, attempt: ${attempt}`)
      events['reconnecting'] && events['reconnecting'].dispatch(attempt)
    }).on('reconnect_error', function (err) {
      logger.warn(`socket reconnection error`)
      logger.warn(err)
      events['reconnect_error'] && events['reconnect_error'].dispatch(err)
    }).on('reconnect_failed', function (err) {
      logger.warn(`socket can't reconnect`)
      logger.warn(err)
      events['reconnect_failed'] && events['reconnect_failed'].dispatch(err)
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
  // null is a type of Object. so we have to check null and undefined with loosy compare
  if (typeof data !== 'object' || data == null) {
    data = {data: data}
    data.altered = true
  }
  sendTo(eventName, null, data)
}

function sendTo (eventName, to = null, data = {}) {
  if (connected) {
    data._to = to
    data._from = config.clientName
    for (let pack of filterHooks(eventName, packers)) {
      data = pack({eventName, data}) || data
    }
    for (let socket of sockets) {
      socket.emit(eventName, data)
    }
  } else {
    logger.warn('can\'t emit, not connected.')
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
var send = emit

export default { connect, addPacker, addUnpacker, emit, send, sendTo, on, once, off }
