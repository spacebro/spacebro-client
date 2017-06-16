import test from 'ava'

import isNode from '../src/is-node'

test(t => {
  t.true(isNode, 'Tests run on node')
})
