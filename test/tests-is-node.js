import test from 'ava'

import isNode from '../src/is-node'

test('Tests run on node', t => {
  t.true(isNode)
})
