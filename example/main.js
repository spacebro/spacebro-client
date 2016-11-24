'use strict'

const spacebroClient = require('../').init()

spacebroClient.connect('127.0.0.1', 8888, {
  clientName: 'foo',
  channelName: 'bar',
  verbose: true
})

setTimeout(() => { spacebroClient.emit('hello') }, 3000)
