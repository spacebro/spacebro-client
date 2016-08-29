'use strict';

var spaceBro = require('../');

spaceBro.connect('localhost', 8888, {
  clientName: 'pinger',
  channelName: 'starPort',
  packers: [{ handler: function handler(args) {
      return console.log(args.eventName, '=>', args.data);
    } }],
  unpackers: [{ handler: function handler(args) {
      return console.log(args.eventName, '<=', args.data);
    } }],
  verbose: false
});

spaceBro.on('pong', function () {
  console.log('get ponged');
});

var count = 0;
setInterval(function () {
  spaceBro.emit('ping', { count: ++count });
}, 1000);