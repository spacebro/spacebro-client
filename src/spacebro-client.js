'use strict'

import wildcard from 'socketio-wildcard'
import io from 'socket.io-client'
import Signal from 'signals'
import Logger from './logger'

const patch = wildcard(io.Manager)

const defaultConfig = {
  channelName: null,
  clientName: null,
  packers: [],
  unpackers: [],
  sendBack: true,
  verbose: true,
  multiService: false
}

function filterHooks (eventName, hooks) {
  return hooks
    .filter(hook => [eventName, '*'].indexOf(hook.eventName) !== -1)
    .sort(hook => -hook.priority || 0)
    .map(hook => hook.handler)
}

class SpacebroClient {
  constructor (address, port, options) {
    this.config = Object.assign({}, defaultConfig, options)
    this.logger = new Logger(this.config.verbose)

    this.packers = []
    for (const packer of this.config.packers) {
      this.addPacker(packer.handler, packer.priority, packer.eventName)
    }
    this.unpackers = []
    for (const unpacker of this.config.unpackers) {
      this.addUnpacker(unpacker.handler, unpacker.priority, unpacker.eventName)
    }

    if (typeof address !== 'string') {
      throw new Error('address must be a valid string')
    }
    if (!(port > 0)) {
      throw new Error('port must be a positive integer')
    }

    this.events = {}
    this.connected = false
    this.socket = null

    this.logger.log(
      `Trying to connect on ${address}:${port} with config:\n`, this.config
    )
    this.initSocketIO(address, port)
  }

  initSocketIO (address, port) {
    let parsedURI = require('url').parse(address)
    let protocol = parsedURI.protocol ? '' : 'ws://'
    let url = `${protocol}${address}:${port}`

    let socket = io(url)

    patch(socket)

    socket
      .on('connect', () => {
        this.connected = true
        this.logger.log('socket connected')
        lastSocket = socket
        socket.emit('register', {
          clientName: this.config.clientName,
          channelName: this.config.channelName
        })
        this.events['connect'] && this.events['connect'].dispatch(socket)
      })
      .on('connect_error', (err) => {
        this.logger.warn('error', err)
        this.connected = false
        this.events['connect_error'] && this.events['connect_error'].dispatch(err)
      })
      .on('connect_timeout', () => {
        this.logger.warn('connection timeout')
        this.events['connect_timeout'] && this.events['connect_timeout'].dispatch()
      })
      .on('error', (err) => {
        this.logger.warn('error', err)
        this.connected = false
        this.events['error'] && this.events['error'].dispatch(err)
      })
      .on('disconnect', (err) => {
        this.logger.log('socket down')
        this.events['disconnect'] && this.events['disconnect'].dispatch(err)
        this.connected = false
      })
      .on('reconnect', (data) => {
        this.logger.log('socket reconnected')
        this.events['reconnect'] && this.events['reconnect'].dispatch(data)
        this.connected = true
      })
      .on('reconnect_attempt', (attempt) => {
        this.logger.log(`socket reconnect attempt: ${attempt}`)
        this.events['reconnect_attempt'] && this.events['reconnect_attempt'].dispatch(attempt)
      })
      .on('reconnecting', (attempt) => {
        this.logger.log(`socket try to reconnect, attempt: ${attempt}`)
        this.events['reconnecting'] && this.events['reconnecting'].dispatch(attempt)
      })
      .on('reconnect_error', (err) => {
        this.logger.warn('socket reconnection error')
        this.logger.warn(err)
        this.events['reconnect_error'] && this.events['reconnect_error'].dispatch(err)
      })
      .on('reconnect_failed', (err) => {
        this.logger.warn('socket cannot reconnect')
        this.logger.warn(err)
        this.events['reconnect_failed'] && this.events['reconnect_failed'].dispatch(err)
      })

      .on('*', ({ data }) => {
        let [eventName, args] = data
        if (!this.config.sendBack && args._from === this.config.clientName) {
          return
        }
        if (this.events[eventName]) {
          this.logger.log(`socket received ${eventName} with data:`, args)
          for (let unpack of filterHooks(eventName, this.unpackers)) {
            const unpacked = unpack({ eventName, data: args })
            args = unpacked || args
          }
          this.events[eventName].dispatch(args)
        }
      })
  }

  disconnect () {
    this.connected = false
    this.unpackers = []
    this.packers = []
    for (const eventName of this.events.keys()) {
      this.off(eventName)
    }
  }

  addPacker (handler, priority, eventName) {
    this.packers.push({ eventName, handler, priority })
  }
  addUnpacker (handler, priority, eventName) {
    this.unpackers.push({ eventName, handler, priority })
  }

  emit (eventName, data = {}) {
    // null is a type of Object. so we have to check null and undefined with loosy compare
    if (typeof data !== 'object' || data == null) {
      data = {data: data}
      data.altered = true
    }
    this.sendTo(eventName, null, data)
  }

  sendTo (eventName, to = null, data = {}) {
    if (this.connected) {
      data._to = to
      data._from = this.config.clientName
      for (let pack of filterHooks(eventName, this.packers)) {
        data = pack({eventName, data}) || data
      }
      this.socket.emit(eventName, data)
    } else {
      this.logger.warn('can\'t emit, not connected.')
    }
  }

  // Reception
  on (eventName, handler, handlerContext, priority) {
    if (this.events[eventName]) {
      this.logger.warn(`Signal ${eventName} already exists`)
    }
    this.events[eventName] = new Signal()
    this.events[eventName].add(handler, handlerContext, priority)
  }

  once (eventName, handler, handlerContext, priority) {
    if (this.events[eventName]) {
      this.logger.warn(`Signal ${eventName} already exists`)
    }
    this.events[eventName] = new Signal()
    this.events[eventName].addOnce(handler, handlerContext, priority)
  }

  off (eventName) {
    this.events[eventName].dispose()
    delete this.events[eventName]
  }
}

let lastSocket = null

function connect (address, port, options) {
  if (lastSocket) {
    console.warn('A SpacebroClient socket is already open')
  }
  lastSocket = new SpacebroClient(address, port, options)
}

function checkSocket () {
  if (!lastSocket) {
    throw new Error('No SpacebroClient socket is open')
  }
}

function disconnect () {
  checkSocket()
  lastSocket.disconnect()
  lastSocket = null
}

function addPacker (handler, priority, eventName) {
  checkSocket()
  lastSocket.addPacker(handler, priority, eventName)
}

function addUnpacker (handler, priority, eventName) {
  checkSocket()
  lastSocket.addUnpacker(handler, priority, eventName)
}

function emit (eventName, data = {}) {
  checkSocket()
  lastSocket.emit(eventName, data)
}

function sendTo (eventName, to = null, data = {}) {
  checkSocket()
  lastSocket.sendTo(eventName, to, data)
}

// Reception
function on (eventName, handler, handlerContext, priority) {
  checkSocket()
  lastSocket.on(eventName, handler, handlerContext, priority)
}

function once (eventName, handler, handlerContext, priority) {
  checkSocket()
  lastSocket.once(eventName, handler, handlerContext, priority)
}

function off (eventName) {
  checkSocket()
  lastSocket.off(eventName)
}

export default {
  SpacebroClient,
  connect,
  disconnect,
  addPacker,
  addUnpacker,
  emit,
  send: emit,
  sendTo,
  on,
  once,
  off
}
