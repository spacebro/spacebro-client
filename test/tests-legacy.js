import test from 'ava'
import sleep from 'sleep-promise'

import sbClient from '../src/spacebro-client'

test('connect - Legacy version', async (t) => {
  sbClient.connect('spacebro.space', 3333, {
    channelName: 'spacebro-client-test-connect',
    clientName: 'connect1',
    verbose: false
  })

  sbClient.on('connect', () => {
    t.pass('Connected')
  })
  await sleep(5000)
  sbClient.disconnect()
})

test.serial('emit / on - Before connect (legacy version)', async (t) => {
  sbClient.on('connect', () => {
    sbClient.emit('hello')
  })
  sbClient.on('hello', (data) => {
    t.pass('Message received')
    t.deepEqual(data, { _from: 'emit-on-before-connect', _to: null })
  })
  sbClient.connect('spacebro.space', 3333, {
    channelName: 'spacebro-client-test-emit-on-before-connect',
    clientName: 'emit-on-before-connect',
    verbose: false
  })
  await sleep(5000)
  sbClient.disconnect()
})
