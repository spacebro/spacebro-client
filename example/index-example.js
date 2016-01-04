'use strict'

const spacebroClient = require('../')

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

spacebroClient.registerToMaster(actionList, 'example-bro')
