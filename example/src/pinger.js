const spaceBro = require('../')
const moment = require('moment');
var now = null
var nowmore = null

spaceBro.connect('spacebro.space', 3333, {
  clientName: 'pinger',
  channelName: 'pegasus',
  packers: [{ handler: args => console.log(args.eventName, '=>', args.data) }],
  unpackers: [{ handler: args => {
      nowmore = moment()
      var ms = nowmore.diff(now)
      console.log(`Delay: ${ms}`)
      console.log(args.eventName, '<=', args.data) 
    } 
  }],
  verbose: true
})

spaceBro.on('pongy', function (data) {
  console.log('get ponged:', data.count)
})

var count = 0
setInterval(function () { 
  now = moment()
  spaceBro.emit('pingy', { 
    count: ++count 
  }) 
}, 1000)
