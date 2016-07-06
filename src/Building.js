const C = require('./constants.js')
class Building {
  constructor (type, position) {
    this.type = type
    this.lvl = 1
    this.dmg = C[type].BASEDMG
    this.cooldown = C[type].MAX_COOLDOWN
    this.maxCD = C[type].MAX_COOLDOWN
    this.target = null
    this.position = {
      i: position.i,
      j: position.j
    }
  }
  SellCost () {
    var cost = C.COST[this.type]
    for (let i = 1; i < this.lvl; i++) cost += C[this.type].UPCOST * (i + 1)
    return cost * C.SELL_MODIFIER
  }
  upgradeCost () {
    return C[this.type].UPCOST * (this.lvl + 1)
  }
  upgrade () {
    this.lvl ++
    this.dmg += C[this.type].UPDMG
    this.maxCD -= C[this.type].UPCOOL
    if (this.maxCD < 0) this.maxCD = 0
    this.cooldown = this.maxCD + 2
  }
}
exports.Building = Building
