'use strict'

const spacebroClient = require('../../')

spacebroClient.connect('127.0.0.1', 8888, {
  clientName: 'foo',
  channelName: 'bar'
})

spacebroClient.on('hello', (data) => {
  log(`received event hello with ${data}`)
})
setTimeout(() => { spacebroClient.emit('hello', 'world') }, 3000)
setTimeout(() => { spacebroClient.emit('hello', {world: 'hello'}) }, 5000)
setTimeout(() => { spacebroClient.off('hello') }, 6000)
setTimeout(() => { spacebroClient.emit('hello') }, 7000)

function log (data) {
  console.log(data)
  document.body.innerHTML += `<p>${data}</p>`
}
