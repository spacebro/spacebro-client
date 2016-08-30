'use strict';

var spaceBro = require('../');

spaceBro.connect('tigre.local', {
  clientName: 'pinger',
  channelName: 'pegasus',
  packers: [{ handler: function handler(args) {
      return console.log(args.eventName, '=>', args.data);
    } }],
  unpackers: [{ handler: function handler(args) {
      return console.log(args.eventName, '<=', args.data);
    } }],
  verbose: true
});

spaceBro.on('pong', function (data) {
  console.log('get ponged:', data.count);
});

var count = 0;
setInterval(function () {
  spaceBro.emit('ping', { count: ++count });
}, 1000);