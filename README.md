# Spacebro client
Allow to automagically 🌟 connect to a Spacebro server

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![node](https://img.shields.io/badge/node-0.10.x-brightgreen.svg)](https://nodejs.org/en/) [![node](https://img.shields.io/badge/node-0.12.x-brightgreen.svg)](https://nodejs.org/en/) [![node](https://img.shields.io/badge/node-4.0.x-brightgreen.svg)](https://nodejs.org/en/) [![node](https://img.shields.io/badge/node-5.3.x-brightgreen.svg)](https://nodejs.org/en/)

# Install

npm install --save spacebro-client

# API

```
spacebroClient = require('spacebro-client')
// This means you will use mdns
spacebroClient.registerToMaster(actionList, clientName, zeroconfName)
// This means you know where to connect
spacebroClient.socketioConnect(server, port, actionList, clientName, zeroconfName)
spacebroClient.emit('event', data)
```

The actionList parameter is a list of events associated with action (functions) :

```
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