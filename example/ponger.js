'use strict';

var spaceBro = require('../');

spaceBro.connect({
  clientName: 'ponger',
  channelName: 'pegasus',
  packers: [{ handler: function handler(args) {
      return console.log(args.eventName, '=>', args.data);
    } }],
  unpackers: [{ handler: function handler(args) {
      return console.log(args.eventName, '<=', args.data);
    } }],
  verbose: true
});

/*spaceBro.on('connect', data => {
  console.log('*** connected:', data)
})*/

spaceBro.on('ping', function () {
  console.log('get pinged');
  spaceBro.emit('pong');
});