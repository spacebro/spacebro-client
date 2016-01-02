# Chywalry client

Allow to automagically connect to a chywalry server by simply specifying a zeroconf service name

# Install

npm install chywalry-client

# API

```
chywalryClient = require('chywalry-client')
chywalryClient.registerToMaster(actionList, clientName, zeroconfName)
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

The clientName parameter is the name of you client. You will see it in the Chywalry log.

The zeroconfName is the name of the Chywalry service you want to connect.

Enjoy !
