import test from 'ava'

import isNode from '../src/is-node'

test('Tests are run on node', t => {
  t.true(isNode)
})
