'use strict';

var spaceBro = require('../');

spaceBro.connect({
  clientName: 'ponger',
  channelName: 'starPort',
  packers: [{ handler: function handler(args) {
      return console.log(args.eventName, '=>', args.data);
    } }],
  unpackers: [{ handler: function handler(args) {
      return console.log(args.eventName, '<=', args.data);
    } }],
  verbose: false
});

spaceBro.on('ping', function () {
  console.log('get pinged');
  spaceBro.emit('pong');
});