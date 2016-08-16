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
