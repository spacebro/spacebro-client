'use strict'

const { SpacebroClient } = require('spacebro-client')

function addTextNode (text) {
  let logDiv = document.getElementById('log')
  logDiv.insertAdjacentHTML('beforeend', `<p>${text}</p>`)
  console.log(text)
}

const client = new SpacebroClient({
  host: 'spacebro.space',
  port: 3333,
  client: {name: 'foo'},
  channelName: 'bar'
})

client.on('connect', () => {
  addTextNode('connected')
})

const events = ['hello', 'world']
events.forEach((event) => {
  client.on(event, (data) => {
    addTextNode(JSON.stringify(data))
  })
})

setInterval(() => { client.emit('hello', { hello: 'world' }) }, 3000)
