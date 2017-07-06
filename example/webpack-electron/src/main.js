'use strict'

const spacebroClient = require('spacebro-client')

function addTextNode (text) {
  let logDiv = document.getElementById('log')
  logDiv.insertAdjacentHTML('beforeend', `<p>${text}</p>`)
  console.log(text)
}

spacebroClient.connect('spacebro.space', 3333, {
  client: {name: 'foo'},
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
