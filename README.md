# Spacebro client

Allow to automagically 🌟 connect to a Spacebro server

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
