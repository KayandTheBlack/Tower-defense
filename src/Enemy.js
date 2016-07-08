'use strict'
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
    console.log(type)
    this.cd = C[type].MOVSPEED * (1 - lvl / 10)
    this.maxCD = C[type].MOVSPEED * (1 - lvl / 10)
    this.type = type
    this.life = C[type].BASELIFE * (1 + lvl / 2)
  }
  killVal () {
    return (this.lvl + 1) * C[this.type].BASELIFE * 1 / (C[this.type].MOVSPEED + 1) * 3
  }
}
exports.Enemy = Enemy
