'use strict'

const chywalryClient = require('../index.js')

var actionList = [
  {
    name: 'shoot',
    trigger: function (data) {
      console.log('shoot')
    }
  },
  {
    name: 'stop',
    trigger: function (data) {
      console.log('stop')
    }
  }
]

chywalryClient.registerToMaster(actionList, 'example-chy')
