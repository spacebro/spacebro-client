'use strict'

const spacebroClient = require('../../')

spacebroClient.connect('127.0.0.1', 8888, {
  clientName: 'foo',
  channelName: 'bar',
  verbose: true
})

spacebroClient.on('hello', (data) => {
  console.log('received hello', data)
})
setTimeout(() => { spacebroClient.emit('hello', 'world') }, 3000)
setTimeout(() => { spacebroClient.emit('hello', {world: 'hello'}) }, 5000)
setTimeout(() => { spacebroClient.off('hello') }, 6000)
setTimeout(() => { spacebroClient.emit('hello') }, 7000)

spacebroClient.on('new-member', (data) => {
  console.log(`${data.member} has joined.`)
})
