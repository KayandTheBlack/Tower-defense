const C = require('./constants.js')

var i = 0

class Enemy {
  constructor (type, position, lvl) {
    this.position = {
      i: position.i,
      j: position.j
    }
    this.lastposition = {
      i: position.i,
      j: position.j
    }
    this.id = i++
    this.lvl = lvl
    this.cd = C[type].MOVSPEED
    this.maxCD = C[type].MOVSPEED
    this.type = type
    this.life = C[type].BASELIFE * (1 + lvl / 2)
  }
  killVal () {
    return this.lvl * C[this.type].BASELIFE * 1 / C[this.type].MOVSPEED * 20
  }
}
exports.Enemy = Enemy
