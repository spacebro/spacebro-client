const spaceBro = require('../')

spaceBro.connect('spacebro.space', 3333, {
  clientName: 'pinger',
  channelName: 'pegasus',
  packers: [{ handler: args => console.log(args.eventName, '=>', args.data) }],
  unpackers: [{ handler: args => console.log(args.eventName, '<=', args.data) }],
  verbose: true
})

spaceBro.on('pong', function (data) {
  console.log('get ponged:', data.count)
})

var count = 0
setInterval(function () { spaceBro.emit('ping', { count: ++count }) }, 1000)
