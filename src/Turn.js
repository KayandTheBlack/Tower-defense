const C = require('./constants.js')
const { Building } = require('./Building.js')
const clone = require('clone')

function searchPosInVector (position, vector) {
  var it = 0
  var found = false
  while (!found && it < vector.length) {
    if (vector[it].position.i === position.i && vector[it].position.j === position.j) {
      found = true
    } else it++
  }
  return it
}

class Turn {
  constructor (board, inputs, buildings, gold) {
    this.board = board
    this.inputs = inputs
    this.gold = gold
    this.buildings = buildings
  }
  evolve () {
    var nwboard = clone(this.board)
    var nwgold = this.gold
    var nwbuildings = clone(this.buildings)
    // work inputs
    var workedTiles = []
    for (let i = 0; i < C.MAX_PLAYERS; i++) {
      if (this.inputs[i] !== null) {
        let x = true
        workedTiles.forEach(tile => {
          if (this.inputs[i].tile.i === tile.i && this.inputs[i].tile.j === tile.j) x = false
        })
        if (!x) console.log('Tile already worked on this turn!')
        else {
          workedTiles.push(this.inputs[i].tile) // move to every case where it works ?
          if (this.inputs[i].action === 'BUILD') {
            if (nwboard[this.inputs[i].tile.i][this.inputs[i].tile.j] !== C.BUILDABLE_CELL) console.log('cant build there')
            else {
              if (nwgold < C.COST[this.inputs[i].type]) console.log('Not Enough Credits')
              else {
                nwgold -= C.COST[this.inputs[i].type]
                nwbuildings.push(new Building(this.inputs[i].type, this.inputs[i].tile))
              }
            }
          } else if (this.inputs[i].action === 'UPGRADE') {
            const it = searchPosInVector(this.inputs[i].tile, nwbuildings)
            if (it === nwbuildings.length) console.log('No building there, :S')
            else {
              const oldTower = nwbuildings[it]
              const cost = oldTower.upgradeCost()
              if (nwgold < cost) console.log('Not Enough Credits')
              else {
                if (oldTower.lvl >= C.MAXLVL) console.log('Already max updated')
                else {
                  nwgold -= cost
                  oldTower.upgrade()
                }
              }
            }
          } else if (this.inputs[i].action === 'SELL') {
            const it = searchPosInVector(this.inputs[i].tile, nwbuildings)
            if (it === nwbuildings.length) console.log('No building there, :S')
            else {
              const oldTower = nwbuildings[it]
              const cost = oldTower.SellCost()
              nwbuildings.splice(it, 1)
              nwgold += cost
            }
          }
        }
      }
    }
    // Towers work (targetting, shooting)
    // kill enemies
    // enemies move (or not)
    return new Turn(nwboard, [null, null, null, null], nwbuildings, nwgold)
  }
}

exports.Turn = Turn
