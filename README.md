# spacebro client

Automagically 🌟 connect to a [spacebro server](https://github.com/spacebro/spacebro).

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![node](https://img.shields.io/badge/node-4.0.x-brightgreen.svg)](https://nodejs.org/en/) [![node](https://img.shields.io/badge/node-5.3.x-brightgreen.svg)](https://nodejs.org/en/) [![node](https://img.shields.io/badge/node-6.x.x-brightgreen.svg)](https://nodejs.org/en/)

## 🌍 Installation

```bash
yarn add spacebro-client
# or
npm i -S spacebro-client
```

## 👋 Usage

First, you need to start a [spacebro server](https://github.com/soixantecircuits/spacebro).

```bash
$ npm i -g spacebro # or yarn global add spacebro
$ spacebro
```

Then, it's time to write some code:

```js
const spacebroClient = require('spacebro-client')

spacebroClient.connect('127.0.0.1', 8888, {
  clientName: 'foo',
  channelName: 'bar'
})

spacebroClient.on('hello', function () { console.log('world') })
spacebroClient.emit('hello')
```

## 🚀 API

### `spacebroClient.connect([[address, ]port, ]options)`

Look for a server.

```js
// For more details about possible options, see below.
const option = {
  clientName: 'foo',
  channelName: 'bar'
}

// this call does not use any auto-discovery (mdns/avahi/bonjour) feature
// and just perfoms a basic connection request on `ws://${address}:${port}`.
spacebroClient.connect('127.0.0.1', 8888, options)

// use auto-discovery to find if the specified MDNS address (xyz.local)
// broadcasts a 'spacebro' service, retrieve its port, and connect to it.
spacebroClient.connect('specific-computer.local', options)

// simply connects to the first 'spacebro' service that is broadcasted on the network.
// (see the `multiService` option if you want to connect to multiple services)
spacebroClient.connect(options)
```

#### options:

| name | default | required | description |
|:---|:---|:---|:---|
| **zeroconfName** | `'spacebro'` | *optional* | Name of the MDNS service that will be looked for if no address and port are given. |
| **clientName** | `null` | *recommended* | Your client name. Can be useful to perform targeted events and for monitoring. |
| **channelName** | `null` | *recommended* | The channel your app will communicate in. This is especially usefull if you have multiple apps using the same server. |
| **packers** | `[]` | *optional* | Array of packers, see hooks below. |
| **unpackers** | `[]` | *optional* | Array of unpackers, see hooks below. |
| **verbose** | `true` | *optional* | Should spacebro-client display logs (connection / emission / reception) ? |
| **sendBack** | `true` | *optional* | Should this client receive its own events ? |
| **multiService** | `false` | *optional* | Should spacebro-client connects to every `zeroconfName` service it finds on the network ? |

### `spacebroClient.emit(eventName[, data])`

Broadcast a specific event to all the clients in channel. `data` must be a JSON object.

### `spacebroClient.sendTo(eventName, target[, data])`

Send an event to a specific target in the channel. `data` must be a JSON object.

### `spacebroClient.on(eventName, handler)`

Listen to a specific event.

### `spacebroClient.once(eventName, handler)`

Listen to a specific event only once.

### `spacebroClient.off(eventName)`

Remove a specific event listener.

## ↪️ Hooks

### Packers

Before you send an event to the server, all packers associated with that event and all global packers (with no associated event) are called and applied to that event. They receive a single argument which is an object with two properties, the eventName and the data, and can return a new version of those data. If nothing is returned, the message will remain unchanged.

### Unpackers

Unpackers are call when you receive a message from the server, before any handler is called. You can use to alter data (same as packers) but also to check the message as if an unpacker returns *false*, the message will not be sent to the handlers, it will also break the unpacking chain.

## 🖥 Browser

You can use spacebro-client in the browser. You will need few depencies that you can find bellow:

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.8/socket.io.min.js"></script>
<script src="https://wzrd.in/standalone/socketio-wildcard@latest"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-signals/1.0.0/js-signals.min.js"></script>
```

After adding this depencies you can include the spacebro-client lib like any script:

```
<script src="./dist/spacebro-client.js"></script>
```

Then use the `window.spacebroClient` object.

## ⚛ Electron

Spacebro-client also works in [Electron](http://electron.atom.io). You just `require('spacebro-client')` in your electron [main process](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md#differences-between-main-process-and-renderer-process) and use [ipc](https://github.com/electron/electron/blob/master/docs/api/ipc-main.md) or [web-contents](https://github.com/electron/electron/blob/master/docs/api/web-contents.md) to forward events to the [renderer process](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md#differences-between-main-process-and-renderer-process).

From the `example/electron/` folder of this repository:

```js
// In the main process.
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

```

```html
<!-- index.html -->
<html>
<body>
  <script>
    require('electron').ipcRenderer.on('hello', (event, message) => {
      console.log(message)
    })
    require('electron').ipcRenderer.on('world', (event, message) => {
      console.log(message)
    })
  </script>
</body>
</html>
```

## Examples

You can find many real life examples in the `example/` folder of this repository.

## 🕳 Troubleshooting

### `new-member` event 👋

Spacebro server automatically broadcasts a `new-memeber` event when a client connects. Thus, you should avoid using that event name. See the `example/simple-node` script more details.

### Using native module in Electron 🌀

If you want to use `spacebro-client` into an Electron app, you'll have to use [electron-rebuild](https://github.com/electron/electron-rebuild) in order to rebuild MDNS according to version of Node.js that is embedded with Electron.

Basically, you do:

```bash
$ npm i --save-dev electron-rebuild # or yarn
$ ./node_modules/.bin/electron-rebuild # call the executable every time you add a new native module
```

You can also add `"rebuild": "./node_modules/.bin/electron-rebuild"` to your `package.json` and run `npm run rebuild` for convenience.

*[source](https://github.com/electron/electron/blob/master/docs/tutorial/using-native-node-modules.md)*

### yarn and node-gyp issue (i.e not compiling) 🤖

You need to use at least yarn version `0.17.8`. You might have similar problem with outdated versions of npm, simply try to update it.

*[source](https://github.com/yarnpkg/yarn/issues/1979)*

### ping pong 🏓

Do not try to test with `'ping'` and `'pong'` events, those are reserved.

```
- `ping`. Fired when a ping packet is written out to the server.
- `pong`. Fired when a pong is received from the server.
```
*[source](https://github.com/socketio/socket.io-client/issues/1022)*

## ❤️ Contribute

Please follow [standard style](https://github.com/feross/standard) conventions.

We will name our version by the name of the stars that you can find [here](https://en.wikipedia.org/wiki/List_of_stars_in_Andromeda)

Currently latest correspond to Sirrah, which belongs to the Andromeda galaxy.

You can modify the source in `src/index.js`.

Run `npm run build` to transpile and test.

Enjoy !
