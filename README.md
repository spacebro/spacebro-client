# Spacebro client
Allow to automagically 🌟 connect to a Spacebro server

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![node](https://img.shields.io/badge/node-0.10.x-brightgreen.svg)](https://nodejs.org/en/) [![node](https://img.shields.io/badge/node-0.12.x-brightgreen.svg)](https://nodejs.org/en/) [![node](https://img.shields.io/badge/node-4.0.x-brightgreen.svg)](https://nodejs.org/en/) [![node](https://img.shields.io/badge/node-5.3.x-brightgreen.svg)](https://nodejs.org/en/)

# Install

npm install --save spacebro-client

# API

```
spacebroClient = require('spacebro-client')
spacebroClient.registerToMaster(actionList, clientName, zeroconfName)
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

The clientName parameter is the name of you client. You will see it in the Spacebro log.

The zeroconfName is the name of the Spacebro service you want to connect.

Enjoy !
