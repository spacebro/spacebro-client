'use strict';

var spaceBro = require('../');

spaceBro.connect('tigre.local', 8888, {
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

spaceBro.on('pongy', function (data) {
  console.log('get ponged:', data.count);
});

var count = 0;
setInterval(function () {
  spaceBro.emit('pingy', { count: ++count });
}, 1000);