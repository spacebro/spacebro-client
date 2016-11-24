const { app, BrowserWindow } = require('electron')
const spacebroClient = require('../../dist/spacebro-client')

let win = null

spacebroClient.connect('127.0.0.1', 8888, {
  clientName: 'foo',
  channelName: 'bar'
})

app.on('ready', () => {
  win = new BrowserWindow({ width: 800, height: 600 })
  win.loadURL(`file://${__dirname}/index.html`)

  const events = ['hello', 'world']
  events.forEach((event) => {
    spacebroClient.on(event, (data) => {
      win.webContents.send(event, data)
    })
  })

  win.webContents.on('did-finish-load', () => {
    setTimeout(() => { spacebroClient.emit('hello', { hello: 'world' }) }, 3000)
    setTimeout(() => { spacebroClient.emit('world', { world: 'hello' }) }, 5000)
  })
})
