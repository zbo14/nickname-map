'use strict'

const t = require('tap')
const NicknameMap = require('.')

t.beforeEach(t => {
  t.context.map = new NicknameMap()
})

t.test('throws if options isn\'t object literal', t => {
  try {
    /* eslint-disable-next-line no-new */
    new NicknameMap(null)
    throw new Error('Should throw')
  } catch (err) {
    t.equal(err.message, 'Expected options to be an object literal')
  }

  t.end()
})

t.test('throws if options.nicknaming isn\'t boolean or function', t => {
  try {
    /* eslint-disable-next-line no-new */
    new NicknameMap({ nicknaming: 1 })
    throw new Error('Should throw')
  } catch (err) {
    t.equal(err.message, 'Expected options.nicknaming to be a boolean or function')
  }

  t.end()
})

t.test('specify nicknaming function', t => {
  const map = new NicknameMap({ nicknaming: NicknameMap.defaultNicknameFunction })

  t.equal(map.nicknaming, true)
  t.end()
})

t.test('disables nicknaming', t => {
  const map = new NicknameMap({ nicknaming: false })

  t.equal(map.nicknaming, false)
  t.end()
})

t.test('enables nicknaming', t => {
  const map = new NicknameMap({ nicknaming: true })

  t.equal(map.nicknaming, true)
  t.end()
})

t.test('fails to get object key', t => {
  const value = t.context.map.get({ foo: 1 })
  t.equal(value, undefined)
  t.end()
})

t.test('sets and gets primitive key', t => {
  t.context.map.set(1, 2)

  const value = t.context.map.get(1)

  t.equal(value, 2)
  t.end()
})

t.test('sets and deletes primitive key', t => {
  t.context.map.set(1, 2)
  t.context.map.delete(1)

  const value = t.context.map.get(1)

  t.equal(value, undefined)
  t.end()
})

t.test('sets and gets object key', t => {
  t.context.map.set({ foo: 1 }, 'bar')

  const value = t.context.map.get({ foo: 1 })

  t.equal(value, 'bar')
  t.end()
})

t.test('sets object keys with same nicknames', t => {
  t.context.map.set({ foo: 1, bar: 2 }, 'baz')
  t.context.map.set({ foo: 2, bar: 1 }, 'bam')

  const keys = [...t.context.map.keys()].sort()

  t.same(keys, [
    '%bar%foo',
    '{"bar":1,"foo":2}',
    '{"bar":2,"foo":1}'
  ])

  t.end()
})

t.test('sets array keys with same nicknames', t => {
  t.context.map.set([1, 2], 'baz')
  t.context.map.set([2, 3], 'bam')

  const keys = [...t.context.map.keys()].sort()

  t.same(keys, [
    '$2',
    '[1,2]',
    '[2,3]'
  ])

  t.end()
})

t.test('sets array keys with same nicknames and deletes 1', t => {
  t.context.map.set([1, 2], 'baz')
  t.context.map.set([2, 3], 'bam')
  t.context.map.delete([1, 2])

  const keys = [...t.context.map.keys()].sort()

  t.same(keys, [
    '$2',
    '[2,3]'
  ])

  t.end()
})

t.test('sets object key and fails to get other object key', t => {
  t.context.map.set({ foo: 1, baz: 3 }, 'bar')

  const value = t.context.map.get({ bar: 0, baz: ['2'] })

  t.equal(value, undefined)
  t.end()
})

t.test('sets and gets deletes object key', t => {
  t.context.map.set({ foo: 1, a: 'b' }, 'bar')

  {
    const keys = [...t.context.map.keys()].sort()

    t.same(keys, [
      '%a%foo',
      '{"a":"b","foo":1}'
    ])
  }

  const result = t.context.map.delete({ foo: 1, a: 'b' })
  t.equal(result, true)

  {
    const keys = [...t.context.map.keys()].sort()
    t.same(keys, [])
  }

  t.end()
})

t.test('sets object key and fails to delete other object key with same properties', t => {
  t.context.map.set({ foo: 1, baz: 3 }, 'bar')

  const result = t.context.map.delete({ foo: 1, baz: '3' })

  t.equal(result, false)
  t.end()
})

t.test('sets object key and fails to delete other object key with different properties', t => {
  t.context.map.set({ foo: 1, baz: 3 }, 'bar')

  const result = t.context.map.delete({ foo: 1, bar: 3 })

  t.equal(result, false)
  t.end()
})
