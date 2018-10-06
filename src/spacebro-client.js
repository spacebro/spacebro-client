'use strict'

import wildcard from 'socketio-wildcard'
import io from 'socket.io-client'
import Signal from 'signals'
import Logger from './logger'
import assignment from 'assignment'
import util from 'util'
import url from 'url'

const patch = wildcard(io.Manager)

/*
** Returns an array of packers / unpackers applicable to a given event, sorted
** by priority; used by `SpacebroClient.on` and `SpacebroClient.sendTo`
*/
function _filterHooks (eventName, hooks) {
  return hooks
    .filter(hook => [eventName, '*'].indexOf(hook.eventName) !== -1)
    .sort(hook => -hook.priority || 0)
    .map(hook => hook.handler)
}

const defaultConfig = {
  channelName: null,
  client: {name: null},
  packers: [],
  unpackers: [],
  sendBack: true,
  verbose: true,
  multiService: false
}

class SpacebroClient {
  constructor (options = {}, connect = true) {
    this.config = assignment({}, defaultConfig, options)

    if (this.config.clientName) {
      console.warn(`DEPRECATED: clientName is deprecated, please use \`client: {name: '${this.config.clientName}'}\` instead`)
      this.config.client.name = this.config.clientName
    }

    this.logger = new Logger(this.config.verbose)

    this.packers = []
    for (const packer of this.config.packers) {
      this.addPacker(packer.handler, packer.priority, packer.eventName)
    }
    this.unpackers = []
    for (const unpacker of this.config.unpackers) {
      this.addUnpacker(unpacker.handler, unpacker.priority, unpacker.eventName)
    }

    this.events = {}
    this.connected = false
    this.socket = null

    if (connect) {
      if (this.config.host == null || this.config.port == null) {
        console.warn('Cannot connect without host address and port')
        return
      }
      this.connect(this.config.host, this.config.port)
        .catch(() => {})
    }
  }

  connect (host, port) {
    if (this.connected) {
      console.warn(`This client is already connected to ${this.config.host}:${this.config.port}`)
      return
    }

    if (typeof host !== 'string') {
      throw new Error('host must be a valid string')
    }
    if (port < 0) {
      throw new Error('port must be a positive integer')
    }

    this.logger.log(
      `Trying to connect to ${host}:${port} with config:\n`, this.config
    )
    this.config.host = host
    this.config.port = port
    this._initSocketIO(host, port)

    return new Promise((resolve, reject) => {
      this.on('connect', () => resolve(this))
      this.on('connect_error', (err) => reject(err))
      this.on('connect_timeout', () => reject(new Error('Connection timeout')))
      this.on('error', (err) => reject(err))
    })
  }

  _initSocketIO (address, port) {
    let parsedURI = url.parse(address)
    let path = parsedURI.host && parsedURI.pathname
    if (path === '/') {
      path = null
    }
    if (path) {
      parsedURI.pathname = ''
      address = url.format(parsedURI)
    }
    let protocol = parsedURI.protocol ? '' : 'ws://'
    let serverUrl = `${protocol}${address}`
    if (port) {
      serverUrl = `${serverUrl}:${port}`
    }

    let socket = io(serverUrl, {path})

    patch(socket)

    socket
      .on('connect', () => {
        this.connected = true
        this.logger.log('socket connected')
        this.socket = socket
        socket.emit('register', {
          channelName: this.config.channelName,
          client: this.config.client,
          // legacy
          clientName: this.config.client.name
        })
        if (this.config.connection) {
          this.emit('addConnections', this.config.connection)
        }
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

        if (!this.config.sendBack && args._from === this.config.client.name) {
          return
        }
        if (this.events[eventName] || this.events['*']) {
          this.logger.log(`socket received ${eventName} with data:`, args)
          for (let unpack of _filterHooks(eventName, this.unpackers)) {
            const unpacked = unpack({ eventName, data: args })
            args = unpacked || args
          }
          this.events[eventName] && this.events[eventName].dispatch.apply(this.events[eventName], data.slice(1))
          this.events['*'] && this.events['*'].dispatch(args)
        }
      })
  }

  disconnect () {
    if (this.socket) {
      this.socket.disconnect()
    }
    this.connected = false
    this.unpackers = []
    this.packers = []
  }

  addPacker (handler, priority, eventName) {
    this.packers.push({ eventName, handler, priority })
  }
  addUnpacker (handler, priority, eventName) {
    this.unpackers.push({ eventName, handler, priority })
  }

  emit (eventName, data = {}) {
    // null is a type of Object. so we have to check null and undefined with loosy compare
    if (typeof data !== 'object' || data === null) {
      data = {data: data}
      data.altered = true
    }
    // do the same thing as this.sendTo(eventName, null, data) but with multiple args after data
    var args = Array.prototype.slice.call(arguments, 2)
    args.unshift(eventName, null, data)
    this.sendTo.apply(this, args)
  }

  sendTo (eventName, to = null, data = {}) {
    if (!this.connected) {
      console.error(`Error: "${this.config.client.name}" is disconnected and cannot emit "${eventName}"`)
      return
    }
    if (typeof data === 'object' && typeof data.toJSON === 'function') {
      data = data.toJSON()
    }
    data._to = to
    data._from = this.config.client.name
    for (let pack of _filterHooks(eventName, this.packers)) {
      data = pack({eventName, data}) || data
    }
    // do the same thing as this.socket.emit(eventName, data) but with multiple args after data
    var args = Array.prototype.slice.call(arguments, 3)
    args.unshift(eventName, data)
    this.socket.emit.apply(this.socket, args)
  }

  // Reception
  on (eventName, handler, handlerContext, priority) {
    if (!this.events[eventName]) {
      this.events[eventName] = new Signal()
    }
    this.events[eventName].add(handler, handlerContext, priority)
  }

  once (eventName, handler, handlerContext, priority) {
    if (!this.events[eventName]) {
      this.events[eventName] = new Signal()
    }
    this.events[eventName].addOnce(handler, handlerContext, priority)
  }

  off (eventName) {
    this.events[eventName].dispose()
    delete this.events[eventName]
  }
}

function setDefaultSettings (options = null, verbose = false, _noErr = false) {
  const inspect = (obj) => util.inspect(obj, {showHidden: false, depth: null})

  if (options == null) {
    let settings = null

    try {
      if (typeof process !== 'undefined' && !process.env.NO_STANDARD_SETTINGS) {
        settings = require('standard-settings').getSettings()
      }
    } catch (err) {}

    if (!settings) {
      if (!_noErr) {
        console.warn('Cannot load standard-settings; did you add it to node_modules?')
      }
    } else {
      const spacebroSettings = settings.service && settings.service.spacebro
      if (!spacebroSettings) {
        console.warn('Settings file does not include service.spacebro')
        if (verbose) {
          console.warn('Settings object:', inspect(spacebroSettings))
        }
      } else {
        options = spacebroSettings
      }
    }
  }
  if (verbose) {
    console.log('Former settings:', inspect(defaultConfig))
  }
  assignment(defaultConfig, options)
  if (verbose) {
    console.log('New settings:', inspect(defaultConfig))
  }
}

function create (options = {}) {
  const client = new SpacebroClient(options, false)
  return client.connect(client.config.host, client.config.port)
}

/*
** The following functions are for legacy purposes
** Instances of SpacebroClient should be used instead
*/

let spacebroClientSingleton = null

/*
** This variable is used to allow calling `on` before `connect`
*/
let beforeConnectEvents = {
  events: [],

  on: SpacebroClient.prototype.on,
  once: SpacebroClient.prototype.once,
  off: SpacebroClient.prototype.off
}

function connect (host, port, options) {
  if (spacebroClientSingleton) {
    console.warn('A SpacebroClient socket is already open')
  }
  spacebroClientSingleton = new SpacebroClient(
    assignment({}, options, {host, port})
  )
  if (beforeConnectEvents) {
    spacebroClientSingleton.events = beforeConnectEvents.events
    beforeConnectEvents = null
  }
  return spacebroClientSingleton
}

function _checkSocket () {
  if (!spacebroClientSingleton) {
    console.warn('No SpacebroClient socket is open')
  }
  return !!spacebroClientSingleton
}

function disconnect () {
  if (_checkSocket()) {
    spacebroClientSingleton.disconnect()
  }
  spacebroClientSingleton = null
}

function addPacker (handler, priority, eventName) {
  if (_checkSocket()) {
    spacebroClientSingleton.addPacker(handler, priority, eventName)
  }
}

function addUnpacker (handler, priority, eventName) {
  if (_checkSocket()) {
    spacebroClientSingleton.addUnpacker(handler, priority, eventName)
  }
}

function emit (eventName, data = {}) {
  if (_checkSocket()) {
    var args = Array.prototype.slice.call(arguments, 0)
    spacebroClientSingleton.emit.apply(spacebroClientSingleton, args)
    // this.sendTo.apply(this, args)
  }
}

function sendTo (eventName, to = null, data = {}) {
  if (_checkSocket()) {
    var args = Array.prototype.slice.call(arguments, 0)
    spacebroClientSingleton.sendTo.apply(spacebroClientSingleton, args)
    // spacebroClientSingleton.sendTo(eventName, to, data)
  }
}

function _eventSocket () {
  if (!spacebroClientSingleton && !beforeConnectEvents) {
    console.warn('No SpacebroClient socket is open')
  }
  return spacebroClientSingleton || beforeConnectEvents
}

function on (eventName, handler, handlerContext, priority) {
  const socket = _eventSocket()

  if (socket) {
    socket.on(eventName, handler, handlerContext, priority)
  }
}

function once (eventName, handler, handlerContext, priority) {
  const socket = _eventSocket()

  if (socket) {
    socket.once(eventName, handler, handlerContext, priority)
  }
}

function off (eventName) {
  const socket = _eventSocket()

  if (socket) {
    socket.off(eventName)
  }
}

setDefaultSettings(null, false, true)

export default {
  SpacebroClient,
  setDefaultSettings,
  create,
  connect,
  disconnect,
  addPacker,
  addUnpacker,
  emit,
  sendTo,
  on,
  once,
  off
}
