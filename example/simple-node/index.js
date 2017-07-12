'use strict'

const { SpacebroClient } = require('../../')

const client = new SpacebroClient({
  host: 'spacebro.space',
  port: 3333,
  client: {name: 'foo'},
  channelName: 'bar',
  verbose: true
})

client.on('hello', (data) => {
  console.log('received hello', data)
})
setTimeout(() => { client.emit('hello', 'world') }, 3000)
setTimeout(() => { client.emit('hello', {world: 'hello'}) }, 5000)
setTimeout(() => { client.off('hello') }, 6000)
setTimeout(() => { client.emit('hello') }, 7000)

client.on('new-member', (data) => {
  console.log(`${data.member} has joined.`)
})
