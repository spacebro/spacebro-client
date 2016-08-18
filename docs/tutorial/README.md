To showcase how spaceBro client works, we are going to make a simple ping - pong between two apps (named `pinger` and `ponger`).

### Prerequisites

First you need to have a spaceBro server running. If you do not have spacebro installed on your computer, you should follow the Installation guide [here](https://github.com/soixantecircuits/spacebro). Install spaceBro globally and launch a server by tapping the following lines in your terminal:
``` bash
npm i -g --save spacebro
spacebro
```

There is now a spaceBro server running on your machine at the address `localhost:8888`.

Now create two directories `pinger` and `ponger` and add `spacebro-client` as a dependency by running `npm install --save spacebro-client` in both `pinger/` and `ponger/`.

### Setup

We can now create `pinger/pinger.js` and start scripting.
For it to work, we need to give a name to each application in the network and to specify which events it will listen. For now, you will call the pinger `'pinger'` and let it without any listener.
``` js
// Require SpaceBro Client
const spacebroClient = require('spacebro-client')

// Listeners
var actionList = []

// And connect to the server we just launched
spacebroClient.iKnowMyMaster('localhost', 8888)
spacebroClient.registerToMaster(actionList, 'pinger')
```

And that's it ! If you start the application by running `node pinger.js` you should see it appear on you spaceBro server.

### Action List

With spaceBro, you will listen to events and perform actions in return. Currenty our application is not doing anything nor listening to any events. We need to set actionList.

The actions list is an array of objects with two properties:
- **name** (string) - the event's name
- **trigger** (function) - the function that will be called when you receive the event. it can reveice one argument that will be passed with the event.

For our example, we will only listen to `pong` and log `'pong'` in return:

``` js
// Listeners
var actionList = [
  {
    name: 'pong',
    trigger: function () { console.log('pong') }
  }
]
```

If you rerun the app with node, you should see `pong` appearing in the events registered next by our pinger client.

### Sending events

We still need to send event to make our application alive. With SpaceBro Client it is quite easy as we have an `emit` function available. For instance to send `ping`, you can simply do:
``` js
spacebroClient.emit('ping')
```
(Note that you don't need to register to an event to emit it)

### Complete Code
So lets edit our `pinger.js` to make it interact with other apps:
```js
// Require SpaceBro Client
const spacebroClient = require('spacebro-client')

// An helper function to emit "ping"
function sendPing () {
  setTimeout(function () {
    spacebroClient.emit('ping')
  }, 250)
}

// Listeners
var actionList = [
  {
    name: 'pong',
    trigger: function () {
      // When receiving "pong":
      //   -> log "pong"
      //   -> emit "ping"
      console.log('pong')
      sendPing()
    }
  }
]

// Connect to the server we just launched
spacebroClient.iKnowMyMaster('localhost', 8888)
spacebroClient.registerToMaster(actionList, 'pinger')

// Emit "ping"
sendPing()

```

And let's create `ponger/ponger.js` on the same basis:
```js
const spacebroClient = require('spacebro-client')

function sendPong () {
  setTimeout(function () {
    spacebroClient.emit('pong')
  }, 250)
}

// Listener
var actionList = [
  {
    name: 'ping',
    trigger: function () {
      console.log('ping')
      sendPong()
    }
  }
]

// Connect to the server we just launched
spacebroClient.iKnowMyMaster('localhost', 8888)
spacebroClient.registerToMaster(actionList, 'ponger')
```

You can now launch `ponger.js` then `pinger.js` and see them interact.
