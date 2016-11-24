'use strict'

const spacebroClient = require('../../')

spacebroClient.connect('127.0.0.1', 8888, {
  clientName: 'foo',
  channelName: 'bar'
})

setInterval(() => { spacebroClient.emit('hello', {world: 'hello'}) }, 2000)
