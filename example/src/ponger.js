const spaceBro = require('../')

spaceBro.connect({
  clientName: 'ponger',
  channelName: 'starport',
  packers: [{ handler: args => console.log(args.eventName, '=>', args.data) }],
  unpackers: [{ handler: args => console.log(args.eventName, '<=', args.data) }],
  verbose: true
})

spaceBro.on('connect', data => {
  console.log('connected:', data)
})

spaceBro.on('ping', function () {
  console.log('get pinged')
  spaceBro.emit('pong')
})
