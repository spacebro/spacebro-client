const { app, BrowserWindow } = require('electron')
const { SpacebroClient } = require('../../')

let win = null
const client = new SpacebroClient({
  host: 'spacebro.space',
  port: 3333,
  client: {name: 'foo'},
  channelName: 'bar'
})

app.on('ready', () => {
  win = new BrowserWindow({ width: 800, height: 600 })
  win.loadURL(`file://${__dirname}/index.html`)

  for (const eventName of ['hello', 'world']) {
    client.on(eventName, (data) => {
      win.webContents.send(eventName, data)
    })
  }

  win.webContents.on('did-finish-load', () => {
    setTimeout(() => { client.emit('hello', { hello: 'world' }) }, 2000)
    setTimeout(() => { client.emit('world', { world: 'hello' }) }, 3000)
  })
})
