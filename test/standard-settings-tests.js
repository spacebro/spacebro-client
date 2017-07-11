import test from 'ava'
import sleep from 'sleep-promise'

import { SpacebroClient } from '../src/spacebro-client'

test('connect - With standard-settings', async (t) => {
  const client = new SpacebroClient()

  client.on('connect', () => {
    client.emit('hello')
  })
  client.on('hello', (data) => {
    t.pass('Message received')
    t.deepEqual(data, { _from: 'with-standard', _to: null })
  })
  await sleep(5000)
})
