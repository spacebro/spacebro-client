'use strict';

var spaceBro = require('../');
var moment = require('moment');
var startTime = null;
var nowmore = null;

spaceBro.connect('spacebro.space', 3333, {
  clientName: 'pinger',
  channelName: 'pegasus',
  //packers: [{ handler: args => console.log(args.eventName, '=>', args.data) }],
  unpackers: [{ handler: function handler(args) {
      //nowmore = moment()
      var latency = Date.now() - startTime;
      console.log('Delay: ' + latency);
      //console.log(args.eventName, '<=', args.data) 
    }
  }],
  verbose: true
});

spaceBro.on('pongy', function (data) {
  console.log('get ponged:', data.count);
});

var count = 0;
setInterval(function () {
  startTime = Date.now();
  spaceBro.emit('pingy', {
    count: ++count
  });
}, 2000);