'use strict'

import patchMaker from 'socketio-wildcard'
import io from 'socket.io-client'
import Signal from 'signals'
import mdns from './mdns'
import _ from 'lodash'

// Default config
let config = {
  zeroconfName: 'spacebro',
  channelName: null,
  clientName: null,
  packers: [],
  unpackers: [],
  sendBack: true,
  verbose: true
}

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
  }
  config = _.merge(config, options)
  log('Connect with the config:', config)
  if (address && port) {
    socketioInit(null, address, port)
  } else {
    mdns.connectToService(config.zeroconfName, function (err, address, port) {
      socketioInit(err, address, port)
    })
  }
  for (let packer of config.packers)
    addPacker(packer.handler, packer.priority, packer.eventName)
  for (let unpacker of config.unpackers)
    addUnpacker(unpacker.handler, unpacker.priority, unpacker.eventName)
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
    })
    .on('error', function (err) {
      log('Socket', url, 'error:', err)
    })
    .on('disconnect', function () {
      log('Socket', url, 'down')
      sockets.splice(sockets.indexOf(socket), 1)
      connected = false
    })
    .on('*', function ({ data }) {
      let [eventName, args] = data
      log('Socket', url, 'received', eventName, 'with data:', args)
      if (config.sendBack && args._from === config.clientName) return
      for (let unpack of filterHooks(eventName, unpackers)) {
        let unpacked = unpack({ eventName, data: args })
        if (unpacked === false) return
        data = unpacked || data
      }
      if (_.has(events, eventName)) events[eventName].dispatch(args)
    })
}

function addPacker (handler, priority, eventName) { addHook(packers, eventName, handler, priority) }
function addUnpacker (handler, priority, eventName) { addHook(unpackers, eventName, handler, priority) }

// Emission
function emit (eventName, data) {
  sendTo(eventName, null, data)
}

function sendTo (eventName, to = null, data = {}) {
  if (!connected) return log('You\'re not connected.')
  data._to = to
  data._from = config.clientName
  for (let pack of filterHooks(eventName, packers))
    data = pack({ eventName, data }) || data
  for (let socket of sockets) socket.emit(eventName, data)
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
  registerToMaster, iKnowMyMaster
}

// = Helpers ===
function log (...args) {
  if (!config.verbose) return
  console.log('SpaceBro -', ...args)
}

function filterHooks (eventName, hooks) {
  return hooks
    .filter(hook => [eventName, '*'].indexOf(hook.eventName) !== -1)
    .sort(hook => -hook.priority || 0)
    .map(hook => hook.handler)
}

function addHook (hooks, eventName = '*', handler, priority = 0) {
  hooks.push({ eventName, handler, priority })
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
  staticAddress = address
  staticPort = port
}

function registerToMaster (actionList, clientName, zeroconfName) {
  return connect(staticAddress, staticPort, { clientName, zeroconfName })
}
