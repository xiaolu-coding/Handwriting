import { howOld } from './howold.js'
import { howAreYou } from './howareyou.js'

export function sayHi (str) {
  return 'hi ' + str + '\n' + howOld(str) + '\n' + howAreYou(str)
} 