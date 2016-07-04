const C = require('./constants.js')
// const utils = require('./utils.js')

class BasicAI {
  constructor (name, alignment, spawnpos, baselife, baseattack, speed, difficulty, sprite) {
    this.name = name
    this.life = difficulty * baselife
    this.attack = difficulty * baseattack
    this.speed = speed
    this.position = spawnpos
    this.lastPosition = spawnpos
    this.sprite = sprite
    this.critChance = 0.05 * Math.max(difficulty, 1)
    this.critModifier = 2.5
    this.alignment = alignment
  }
  objectiveTile (board) {
    let posTiles = []
    let r = 0
    var Tile = { i: 0, j: 0 }
    while (r < 4) {
      if (r === 0) {
        Tile = { i: 1, j: 0 }
      } else if (r === 1) Tile = { i: -1, j: 0 }
      else if (r === 2) Tile = { i: 0, j: 1 }
      else Tile = { i: 0, j: -1 }
      Tile.i += this.position.i
      Tile.j += this.position.j
      if (Tile.i >= 0 && Tile.i < board.length && Tile.j >= 0 && Tile.j < board[0].length) {
        if (board[Tile.i][Tile.j] === C.EMPTY_CELL && Tile !== this.lastPosition) {
          posTiles.push(Tile)
          console.log('Possible tile: ' + JSON.stringify(Tile))
        }
      }
      r++
    }
    console.log(JSON.stringify(posTiles))
    if (posTiles.length === 0) console.log('FATAL ERROR, got no place to advance for ' + this.name + ' in ' + this.position.i + 'x' + this.position.j)
    if (posTiles.length === 1) return posTiles[0]
    else {
      let chosen = false
      let i = 0
      while (!chosen && i < posTiles.length) {
        if (board[posTiles[i].i][posTiles[i].j] !== C.EMPTY_CELL) chosen = true
        else i++
      }
      if (chosen) return posTiles[i]
      else {
        i = 1
        var centermostpos = posTiles[0]
        while (i < posTiles.length) {
          if (Math.abs(posTiles[i].i - board.length / 2) > Math.abs(centermostpos.i - board.length / 2) || Math.abs(posTiles[i].j - board[0].length / 2) > Math.abs(centermostpos.j - board[0].length / 2)) {
            centermostpos = posTiles[i]
          }
        }
        return centermostpos
      }
    }
  }
  advance (board, pos) {
    this.lastPosition = this.position
    this.position = pos
    if (board[pos.i][pos.j] === C.EMPTY_CELL) board[pos.i][pos.j] = [this]
    else board[pos.i][pos.j] += this
    if (board[this.lastPosition.i][this.lastPosition.j].length === 1) board[this.lastPosition.i][this.lastPosition.j] = -1
    else {
      let i
      for (i = 0; board[this.lastPosition.i][this.lastPosition.j][i].name !== this.name; i++) {}
      board[this.lastPosition.i][this.lastPosition.j].splice(i, 1)
    }
  }
  attack () {
    if (Math.Random() < this.critChance) return Math.round(this.attack * this.critModifier + Math.Random() * 3 - 1)
    else return Math.round(this.attack + Math.Random() * 3 - 1)
  }
  tickTurn (board) {
    var objectiveTile = this.objectiveTile(board)
    if (board[objectiveTile.i][objectiveTile.j] === C.EMPTY_CELL) {
      this.advance(board, objectiveTile)
    } else {
      if (board[objectiveTile.i][objectiveTile.j][0].alignment === this.alignment) this.advance(board, objectiveTile)
      else {
        board[objectiveTile.i][objectiveTile.j][0].harm(this.attack)
      }
    }
  }
  harm (attack) {
    this.life -= attack
    if (this.life <= 0) console.log()
  }
}
exports.BasicAI = BasicAI
