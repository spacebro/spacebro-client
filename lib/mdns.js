'use strict'

var mdns = require('mdns')
var _ = require('lodash')

var EventEmitter = require('events').EventEmitter
var mdns_register = new EventEmitter()

mdns_register.connectToService = function (servicename, callback) {
  var services = []
  var sequence = [
    mdns.rst.DNSServiceResolve(),
    'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({
      families: [4]
    }),
    mdns.rst.makeAddressesUnique()
  ]
  var browser = mdns.createBrowser(mdns.tcp(servicename), {
    resolverSequence: sequence
  })
  browser.on('serviceUp', function (service) {
    // console.log('service up: ', service.type.name)
    if (_.findWhere(services, {
      name: service.type.name,
      host: service.host.substr(0, service.host.length - 1),
      port: service.port
    }) === undefined) {
      // console.log('New socket.io connection with service "' + service.type.name + '" on: ' + service.host.substr(0, service.host.length - 1) + ':' + service.port)
      services.push({
        name: service.type.name,
        host: service.host.substr(0, service.host.length - 1),
        port: service.port
      })
      callback(null, service.host.substr(0, service.host.length - 1), service.port)
    }
  })
  browser.on('serviceDown', function (service) {
    console.log('service down: ', service.type.name)
    mdns_register.emit('service-down', service.type.name)
  })
  browser.on('error', function (Exp) {
    console.log(Exp)
  })
  browser.start()
}

module.exports = mdns_register
