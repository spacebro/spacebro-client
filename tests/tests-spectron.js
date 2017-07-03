import test from 'ava'
import sleep from 'sleep-promise'
import { Application } from 'spectron'
import path from 'path'

test.beforeEach(async (t) => {
  t.context.app = new Application({
    path: './node_modules/.bin/electron',
    args: [path.resolve(__dirname, '../example/electron/main.js')]
  })
  await t.context.app.start()
})

test.afterEach.always(async t => {
  await t.context.app.stop()
})

test('Integration test', async (t) => {
  const { app } = t.context

  await app.client.waitUntilWindowLoaded()
  t.pass('Loaded')
  await sleep(3500)

  t.is(
    await app.client.getText('#log'),
    'Log:\n' +
    '{"_from":"foo","_to":null,"hello":"world"}\n' +
    '{"_from":"foo","_to":null,"world":"hello"}'
  )
})
