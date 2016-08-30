'use strict';

var spaceBro = require('../');

spaceBro.connect('tigre.local', 8888, {
  clientName: 'ponger',
  channelName: 'zhaoxiangjs',
  packers: [{ handler: function handler(args) {
      return console.log(args.eventName, '=>', args.data);
    } }],
  unpackers: [{ handler: function handler(args) {
      return console.log(args.eventName, '<=', args.data);
    } }],
  verbose: true
});

spaceBro.on('connect', function (data) {
  console.log('connected:', data);
});

spaceBro.on('shoot', function (data) {
  console.log('get pinged:', data.count);
  spaceBro.emit('pong', data);
});