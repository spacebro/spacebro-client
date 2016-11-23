'use strict'

const spacebroClient = require('../dist/spacebro-client')

spacebroClient.connect('127.0.0.1', 8888, {
  clientName: 'foo',
  channelName: 'bar',
  verbose: true
})

spacebroClient.on('pong', function () { console.log('pong') })
spacebroClient.emit('ping')