# Spacebro client
Allow to automagically 🌟 connect to a Spacebro server

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![node](https://img.shields.io/badge/node-0.10.x-brightgreen.svg)](https://nodejs.org/en/) [![node](https://img.shields.io/badge/node-0.12.x-brightgreen.svg)](https://nodejs.org/en/) [![node](https://img.shields.io/badge/node-4.0.x-brightgreen.svg)](https://nodejs.org/en/) [![node](https://img.shields.io/badge/node-5.3.x-brightgreen.svg)](https://nodejs.org/en/)

## Installation
```bash
npm i -S spacebro-client
```

## Basic Usage

First, you need to start a [spaceBro server](https://github.com/soixantecircuits/spacebro). To run one locally, run the following line in your terminal (mind that you need to have spaceBro installed):
```bash
spacebro
```

Then, it's time to write some code:
```js
const spacebroClient = require('spacebro-client')

spacebroClient.connect('localhost', 8888, {
  computer: 'foo',
  channel: 'bar'
})

spacebroClient.on('pong', function () { console.log('pong') })
spacebroClient.emit('ping')
```

## Basic API
### spacebroClient.connect(address, port, options) or spacebroClient.connect(options)

Allows you to connect to a spaceBro server. Options is hash table of settings that will be used to define your client.
If you choose not to pass an address (*string*) and a port (*integer*), spaceBro will try to connect to a server using MDNS.

Available options are :
- **clientName** (strongly advised) : The name of your app that will be used to receive and send events.
- **channelName** (strongly advised) : The common channel your apps will share. This will allow your to have multiple apps using the same server without worring about conflicts.
- **packers** (optional) : Array of packers (see Hooks below), defined as hash object with the properties *handler* (required), *eventName* (all if null), *priority* (0 if null).
- **unpackers** (optional) : Array of unpackers (see Hooks below), defined as hash object with the properties *handler* (required), *eventName* (all if null), *priority* (0 if null).
- **verbose** (optional) : Boolean, if set to false, spaceBro will not show any log.
- **sendBack** (optional) : Boolean, if set to false, you will not receive the event you broadcast.

### spacebroClient.emit(eventName, data)
Broadcast a specific event to all the apps in the channel. data must be an object.

### spacebroClient.sendTo(eventName, target, data)
Send an event to a specific target in the channel. data must be an object.

### spacebroClient.on(eventName, handler)
Listen to a specific event.

### spacebroClient.once(eventName, handler)
Listen to a specific event, the listener only once.

## Hooks

### Packers
Before you send an event to the server, all packers associated with that event and all global packers (with no associated event) are called and applied to that event. They receive a single argument which is an object with two properties, the eventName and the data, and can return a new version of those data. If nothing is returned, the message will remain unchanged.

### Unpackers
Unpackers are call when you receive a message from spaceBro, before any handler is called. You can use to alter data (same as packers) but also to check the message as if an unpacker returns *false*, the message will not be sent to the handlers, it will also break the unpacking chain.




# Install

npm install --save spacebro-client

# API

```js
spacebroClient = require('spacebro-client')
// This means you will use mdns
spacebroClient.registerToMaster(actionList, clientName, zeroconfName)
// This means you know where to connect
spacebroClient.socketioConnect(server, port, actionList, clientName, zeroconfName)
spacebroClient.emit('event', data)
```

The actionList parameter is a list of events associated with action (functions) :

```js
var actionList = [
  {
    name: 'shoot',
    trigger: function (data) {
      console.log('someone shoot: ', data)
    }
  },
  {
    name: 'stop',
    trigger: function (data) {
      console.log('someone stop: ', data)
    }
  }
]
```

Do not forget to add the event you want to broadcast to the actionList.

The clientName parameter is the name of you client. You will see it in the Spacebro log.

The zeroconfName is the name of the Spacebro service you want to connect.

Enjoy !

Please follow [standard style](https://github.com/feross/standard) conventions.

## Contribute

You can modify the source in `src/index.js`. Run `npm run build` to transpile and test.
