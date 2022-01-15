'use strict'

const stringify = require('safe-stable-stringify')

const isObjectLiteral = any => any?.constructor?.name === 'Object'
const kNicknameFunction = Symbol('nicknameFunction')

/**
 * @class   NicknameMap
 *
 * @extends Map
 */
class NicknameMap extends Map {
  /**
   * @param  {Object}             [options = {}]
   * @param  {(Boolean|Function)} [options.nicknaming]
   */
  constructor (options = {}) {
    if (!isObjectLiteral(options)) {
      throw new Error('Expected options to be an object literal')
    }

    const type = typeof options.nicknaming

    let nicknameFunction

    switch (type) {
      case 'boolean':
        nicknameFunction = options.nicknaming
          ? NicknameMap.defaultNicknameFunction
          : null

        break

      case 'function':
        nicknameFunction = options.nicknaming
        break

      case 'undefined':
        nicknameFunction = NicknameMap.defaultNicknameFunction
        break

      default:
        throw new Error('Expected options.nicknaming to be a boolean or function')
    }

    super()

    this[kNicknameFunction] = nicknameFunction
    this.nicknaming = !!nicknameFunction
  }

  static defaultNicknameFunction (key) {
    if (Array.isArray(key)) {
      return '$' + key.length
    }

    if (isObjectLiteral(key)) {
      return '%' + Object.keys(key).sort().join('%')
    }
  }

  /**
   * @param  {*} key
   *
   * @return {Boolean}
   */
  delete (key) {
    const nickname = this[kNicknameFunction] && this[kNicknameFunction](key)

    let count

    if (nickname && !(count = super.get(nickname))) {
      return false
    }

    const deleted = super.delete(stringify(key))

    if (!deleted) return false

    if (nickname) {
      count === 1
        ? super.delete(nickname)
        : super.set(nickname, count - 1)
    }

    return true
  }

  /**
   * @param  {*} key
   *
   * @return {*}
   */
  get (key) {
    const nickname = this[kNicknameFunction] && this[kNicknameFunction](key)

    if (nickname && !super.get(nickname)) return

    return super.get(stringify(key))
  }

  /**
   * @param {*} key
   *
   * @param {*} value
   */
  set (key, value) {
    const nickname = this[kNicknameFunction] && this[kNicknameFunction](key)

    super.set(stringify(key), value)
    nickname && super.set(nickname, (super.get(nickname) || 0) + 1)

    return this
  }
}

module.exports = NicknameMap
