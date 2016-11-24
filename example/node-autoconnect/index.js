'use strict'

const spacebroClient = require('../../')

// spacebroClient.connect('127.0.0.1', 8888, {
// spacebroClient.connect('undefined.local', {
spacebroClient.connect({
  clientName: 'foo',
  channelName: 'bar',
  // verbose: false
})

spacebroClient.on('hello', (data) => {
  console.log('received hello', data)
})
setTimeout(() => { spacebroClient.emit('hello', 'world') }, 1000)
