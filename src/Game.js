var { Turn } = require('./Turn.js')
const wave = require('./wave.js')
const { Enemy } = require('./Enemy.js')
// const C = require('./constants.js')
function elemsInArray (array) {
  var length = array.length
  for (let i = 0; i < array.length; i++) {
    if (array[i] === null) length--
  }
  return length
}
function insert (a, array) {
  let i = 0
  let inserted = false
  while (!inserted && i < array.length) {
    if (array[i] === null) {
      inserted = true
      array[i] = a
    } else i++
  }
  if (!inserted) array.push(a)
  return i
}
class Game {
  constructor (ops) {
    this.waveNumber = 0
    this.sockets = []
    this.spawn = {i: 1, j: 0}
    var board = [
      [-1, -1, -1, -1, -3],
      [0, 0, 0, -1, 0],
      [-1, -1, 0, -1, 0],
      [-1, -1, 0, 0, 0],
      [-1, -1, -1, -1, -1]
    ]
    var inputs = Array(ops.MAX_PLAYERS).fill(null)
    this.ops = ops
    this.players = {}
    this.waves = wave
    this.foesToSpawn = wave[0]
    this.turn = new Turn(board, inputs, [], ops.gold, [], ops.lifes)
  }
  onPlayerJoin (socket) {
    if (elemsInArray(this.sockets) === this.ops.MAX_PLAYERS) {
      console.log('KICKED ' + socket.id + ' for entering a full game')
      return
    }
    var pos = insert(socket, this.sockets)
    this.players[socket.id] = pos
    this.sockets[pos].emit('game:bootstrap', {
      ops: this.ops,
      spawn: this.spawn,
      waves: this.waves
    })
  }
  onPlayerLeave (socket) {
    const playernumber = this.players[socket.id]
    this.sockets[playernumber] = null
    delete this.players[socket.id]
  }
  onInput (socket, input) {
    const playernumber = this.players[socket.id]
    this.turn.inputs[playernumber] = input
  }
  sendState () {
    const state = {
      turn: this.turn,
      waveNumber: this.waveNumber
    }
    this.sockets.forEach((socket) => socket && socket.emit('game:state', state))
  }
  tick () {
    if (elemsInArray(this.sockets) === 0) {
      console.log('Not enough players!')
      return
    }
    if (this.foesToSpawn.length !== 0) {
      this.turn.enemies.push(new Enemy(this.foesToSpawn[0].type, this.spawn, Math.floor(this.waveNumber / this.waves.length + this.foesToSpawn[0].lvlmod)))
    }
    this.turn = this.turn.evolve()
    if (this.turn.enemies.length === 0) {
      this.waveNumber++
      this.foesToSpawn = this.waves[this.waveNumber % this.waves.length]
      console.log('Wave survived')
    }
    this.sendState()
  }
}
exports.Game = Game
