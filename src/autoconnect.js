'use strict'

import mdns from 'mdns'
import Signal from 'signals'
import logger from './logger'

const emitter = new Signal()
const services = []
const sequence = [
  mdns.rst.DNSServiceResolve(),
  ('DNSServiceGetAddrInfo' in mdns.dns_sd) ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [4] }),
  mdns.rst.makeAddressesUnique()
]

let browser = null

const setup = function setup (servicename, callback) {
  browser = mdns.createBrowser(mdns.tcp(servicename), { resolverSequence: sequence })
  browser.start()

  browser.on('serviceUp', (_service) => {
    const service = {
      name: _service.type.name,
      host: _service.host.substr(0, _service.host.length - 1),
      port: _service.port
    }
    logger.log('service up: ', service.name, service.host, service.port)
    const exists = services.includes(service)
    if (!exists) {
      services.push(service)
      callback(service.host, service.port)
    }
  })
  browser.on('serviceDown', (_service) => {
    logger.log('service down: ', _service.type.name)
    emitter.dispatch('service-down', _service.type.name)
  })
  browser.on('error', (err) => {
    logger.warn(err)
  })
}

export default { setup, emitter }
