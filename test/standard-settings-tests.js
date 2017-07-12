import test from 'ava'
import sleep from 'sleep-promise'

import { SpacebroClient, setDefaultSettings } from '../src/spacebro-client'

test('setDefaultSettings - With standard-settings', async (t) => {
  setDefaultSettings()

  const client = new SpacebroClient()

  t.deepEqual(
    client.config,
    {
      packers: [],
      unpackers: [],
      sendBack: true,
      multiService: false,
      host: 'spacebro.space',
      port: 3333,
      channelName: 'spacebro-client-test-with-standard',
      client: {name: 'with-standard'},
      verbose: false
    }
  )

  await sleep(5000)
})
