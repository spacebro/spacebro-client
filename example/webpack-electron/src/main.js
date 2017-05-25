'use strict'

const spacebroClient = require('spacebro-client')

function addTextNode (text) {
  let logDiv = document.getElementById('log')
  logDiv.insertAdjacentHTML('beforeend', `<p>${text}</p>`)
  console.log(text)
}

spacebroClient.connect('127.0.0.1', 8888, {
  clientName: 'foo',
  channelName: 'bar'
})

spacebroClient.on('connect', () => {
  addTextNode('connected')
})

const events = ['hello', 'world']
events.forEach((event) => {
  spacebroClient.on(event, (data) => {
    addTextNode(JSON.stringify(data))
  })
})

setInterval(() => { spacebroClient.emit('hello', { hello: 'world' }) }, 3000)

