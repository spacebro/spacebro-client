import test from 'ava'
import sleep from 'sleep-promise'

import { SpacebroClient } from '../src/spacebro-client'

const SB_TEST_ADDRESS = process.env.SB_TEST_ADDRESS || 'spacebro.space'
const SB_TEST_PORT = process.env.SB_TEST_PORT || 3333

test('connect', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
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
    host: SB_TEST_ADDRESS,
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

  client.connect(SB_TEST_ADDRESS, SB_TEST_PORT)
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
    host: SB_TEST_ADDRESS,
    verbose: false
  })

  console.warn = consoleWarn
  t.deepEqual(warnings, ['Cannot connect without host address and port'])
})

test.serial('disconnect', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: 'spacebro-client-test-disconnect',
    client: {name: 'connect4'},
    verbose: false
  })

  t.plan(2)

  client.on('connect', async () => {
    const consoleError = console.error
    const errors = []

    console.error = (err) => {
      errors.push(err)
    }

    client.on('disconnect', () => t.pass('Disconnected'))
    client.disconnect()
    client.emit('what', () => 'ever')

    t.deepEqual(errors, [
      'Error: "connect4" is disconnected and cannot emit "what"'
    ])
    console.error = consoleError
  })
  await sleep(5000)
})

test('connect with connection', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
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

test('receive data with connection', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: 'spacebro-client-test-receive-data-connection',
    client: {name: 'connect-connections'},
    verbose: false,
    connection: 'connect-connections/outMedia => connect-connections/inMedia'
  })

  client.on('connect', () => {
    client.emit('outMedia', {
      that: 'message'
    })
  })

  client.on('inMedia', (data) => {
    t.deepEqual(data, {
      that: 'message',
      _to: null,
      _from: 'connect-connections'
    })
  })
  await sleep(5000)
})

test('receive two data with connection', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: 'spacebro-client-test-receive-two-data-connection',
    client: {name: 'connect-connections'},
    verbose: false,
    connection: 'connect-connections/outMedia => connect-connections/inMedia'
  })

  client.on('connect', () => {
    client.emit('outMedia', {
      that: 'message'
    }, {
      this: 'message'
    })
  })

  client.on('inMedia', (data1, data2) => {
    t.deepEqual(data1, {
      that: 'message',
      _to: null,
      _from: 'connect-connections'
    })
    t.deepEqual(data2, {
      this: 'message'
    })
  })
  await sleep(5000)
})

test('receive one string and one data with connection', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: 'spacebro-client-test-receive-string-data-connection',
    client: {name: 'connect-connections'},
    verbose: false,
    connection: 'connect-connections/outMedia => connect-connections/inMedia'
  })

  client.on('connect', () => {
    client.emit('outMedia', 'create', {
      this: 'message'
    })
  })

  client.on('inMedia', (data1, data2) => {
    t.is(data1, 'create')
    t.deepEqual(data2, {
      this: 'message'
    })
  })
  await sleep(5000)
})

test('receive ack with connection', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: 'spacebro-client-test-receive-ack-connection',
    client: {name: 'connect-connections'},
    verbose: false,
    connection: 'connect-connections/outMedia => connect-connections/inMedia'
  })

  client.on('connect', () => {
    client.emit('outMedia', {
      that: 'message'
    }, function (data) {
      t.is(data, '_pong')
    })
  })

  client.on('inMedia', (data, fn) => {
    fn('_pong')
  })
  await sleep(5000)
})

test('connect with connections', async (t) => {
  const client = new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
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
