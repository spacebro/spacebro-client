import test from 'ava'
import sleep from 'sleep-promise'

import { SpacebroClient } from '../src/spacebro-client'

test('connect', async (t) => {
  const client = new SpacebroClient({
    host: 'spacebro.space',
    port: 3333,
    channelName: 'spacebro-client-test-connect',
    client: {name: 'connect1'},
    verbose: false
  })

  client.on('connect', () => {
    t.pass('Connected')
  })
  await sleep(5000)
})

test('connect - Wrong address', async (t) => {
  const client = new SpacebroClient({
    host: 'a.wrong.address',
    port: 12345,
    channelName: 'spacebro-client-test-connect',
    client: {name: 'connect2'},
    verbose: false
  })

  client.on('connect_error', (err) => {
    t.pass('Connection error')
    t.skip.is(err, 'Cannot find server at address "a.wrong.address:12345"')
  })
  await sleep(5000)
})

test('connect - Wrong port', async (t) => {
  const client = new SpacebroClient({
    host: 'spacebro.space',
    port: 12345,
    channelName: 'spacebro-client-test-connect',
    client: {name: 'connect3'},
    verbose: false
  })

  client.on('connect_error', (err) => {
    t.pass('Connection error')
    t.skip.is(err, 'Cannot connect to server - wrong port')
  })
  await sleep(5000)
})

test('connect - Delayed', async (t) => {
  const client = new SpacebroClient({
    host: 'whatever',
    port: 12345,
    channelName: 'spacebro-client-test-connect-delayed',
    client: {name: 'connect'},
    verbose: false
  }, false)

  client.connect('spacebro.space', 3333)
  client.on('connect', () => {
    t.pass('Connected')
  })
  await sleep(5000)
})

test('connect - Without host', (t) => {
  const consoleWarn = console.warn
  const warnings = []
  console.warn = (message) => warnings.push(message)

  /* eslint-disable no-new */
  new SpacebroClient({
    port: 12345,
    verbose: false
  })

  console.warn = consoleWarn
  t.deepEqual(warnings, ['Cannot connect without host address and port'])
})

test('connect - Without port', (t) => {
  const consoleWarn = console.warn
  const warnings = []
  console.warn = (message) => warnings.push(message)

  /* eslint-disable no-new */
  new SpacebroClient({
    host: 'spacebro.space',
    verbose: false
  })

  console.warn = consoleWarn
  t.deepEqual(warnings, ['Cannot connect without host address and port'])
})

test('connect with connection', async (t) => {
  const client = new SpacebroClient({
    host: 'spacebro.space',
    port: 3333,
    channelName: 'spacebro-client-test-connect-connection',
    client: {name: 'connect-connections'},
    verbose: false,
    connection: 'chokibro/outMedia => etna/inMedia'
  })

  client.on('connections', (data) => {
    t.deepEqual(data, [{
      src: {
        clientName: 'chokibro',
        eventName: 'outMedia'
      },
      tgt: {
        clientName: 'etna',
        eventName: 'inMedia'
      }
    }])
  })
  await sleep(5000)
})

test('connect with connections', async (t) => {
  const client = new SpacebroClient({
    host: 'spacebro.space',
    port: 3333,
    channelName: 'spacebro-client-test-connect-connections',
    client: {name: 'connect-connections'},
    verbose: false,
    connection: [
      'chokibro/outMedia => etna/inMedia',
      'foo/outMedia => bar/inMedia'
    ]
  })

  client.on('connections', (data) => {
    t.deepEqual(data, [
      {
        src: {
          clientName: 'chokibro',
          eventName: 'outMedia'
        },
        tgt: {
          clientName: 'etna',
          eventName: 'inMedia'
        }
      }, {
        src: {
          clientName: 'foo',
          eventName: 'outMedia'
        },
        tgt: {
          clientName: 'bar',
          eventName: 'inMedia'
        }
      }
    ])
  })
  await sleep(5000)
})
test.failing('disconnect', async (t) => {
  const client = new SpacebroClient({
    host: 'spacebro.space',
    port: 3333,
    channelName: 'spacebro-client-test-disconnect',
    client: {name: 'connect4'},
    verbose: false
  })

  t.plan(2)

  client.on('connect', async () => {
    client.on('disconnect', () => t.pass('Disconnected'))
    client.disconnect()

    await sleep(2000)
    await t.throws(() => client.emit('what', () => 'ever'))
  })
  await sleep(5000)
})
