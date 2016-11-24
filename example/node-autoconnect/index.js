'use strict'

const spacebroClient = require('../../')

spacebroClient.connect({
  clientName: 'foo',
  channelName: 'bar'
})

spacebroClient.on('hello', (data) => {
  console.log('received hello', data)
})
setTimeout(() => { spacebroClient.emit('hello', 'world') }, 1000)
