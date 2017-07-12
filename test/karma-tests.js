const sleep = require('sleep-promise')
const assert = require('assert')

const { SpacebroClient } = require('../src/spacebro-client')

const SB_TEST_ADDRESS = process.env.SB_TEST_ADDRESS || 'spacebro.space'
const SB_TEST_PORT = process.env.SB_TEST_PORT || 3333

function connect (name) {
  return new SpacebroClient({
    host: SB_TEST_ADDRESS,
    port: SB_TEST_PORT,
    channelName: `spacebro-client-test-${name}`,
    client: {name: name},
    verbose: false
  })
}

describe('Basic tests', function () {
  it('can emit and receive messages', function (done) {
    const client = connect('karma-emit-on-no-data')

    client.on('connect', () => {
      client.emit('hello')
    })
    client.on('hello', (data) => {
      assert.deepEqual(data, { _from: 'karma-emit-on-no-data', _to: null })
      done()
    })
  })

  it('can receive a message once', async function () {
    const client = connect('karma-once')
    let count = 0

    client.on('connect', () => {
      client.emit('hello')
      client.emit('hello')
    })
    client.once('hello', () => count++)

    await sleep(200)
    assert.equal(count, 1)
  })
})
