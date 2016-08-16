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
