const spaceBro = require('../')

spaceBro.connect({
  clientName: 'ponger',
  channelName: 'starPort',
  packers: [{ handler: args => console.log(args.eventName, '=>', args.data) }],
  unpackers: [{ handler: args => console.log(args.eventName, '<=', args.data) }],
  verbose: false
})

spaceBro.on('ping', function () {
  console.log('get pinged')
  spaceBro.emit('pong')
})
