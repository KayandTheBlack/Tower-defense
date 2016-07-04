const C = require('./constants.js')
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
  objectiveTile(board) {
    let posTiles = []
    let r = 0
    var Tile = { i:0, j:0 }
    while (r < 4) {
      if (r === 0) {
        Tile = { i:1, j:0 }
      } else if (r === 1) Tile = { i:-1, j:0 }
      else if (r === 2) Tile = { i:0, j:1 }
      else  Tile = { i:0, j:-1 }
      Tile.i += this.position.i
      Tile.j += this.position.j
      if (Tile.i > 0 && Tile.i < board.length && Tile.j > 0 && Tile.j < board[0].length) {
        if (board[Tile.i][Tile.j] === C.EMPTY_CELL && Tile !== this.lastPosition) posTiles += Tile
      }
      r++
    }
    if (posTiles.length === 0) console.log('FATAL ERROR, got no place to advance for ' + this.name + ' in ' this.position)
    if (posTiles.length === 1) return posTiles[0]
    else {
      return closestToCenterEmptywhatever
    }
  }
  advance(board) {
    var newPos = objectiveTile(board)
    this.lastPosition = this.position
    this.position = Tile
    if (board[Tile.i][Tile.j] === C.EMPTY_CELL) board[Tile.i][Tile.j] = [this]
    else board[Tile.i][Tile.j] += this
  }
  attack() {
    if (Math.Random() < critChance) return Math.round(this.attack * this.critModifier + Math.Random() * 3 - 1)
    else return Math.round(this.attack + Math.Random() * 3 - 1)
  }
  tickTurn(board, npcPos) {
    var objectiveTile = objectiveTile(board)

  }
}
