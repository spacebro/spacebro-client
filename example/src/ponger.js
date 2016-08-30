const spaceBro = require('../')

spaceBro.connect('spacebro.space', 3333, {
  clientName: 'ponger',
  channelName: 'pegasus',
  packers: [{ handler: args => console.log(args.eventName, '=>', args.data) }],
  unpackers: [{ handler: args => console.log(args.eventName, '<=', args.data) }],
  verbose: true
})

spaceBro.on('connect', data => {
  console.log('connected:', data)
})

spaceBro.on('pingy', function (data) {
  console.log('get pinged:', data.count)
  spaceBro.emit('pongy', data)
})
