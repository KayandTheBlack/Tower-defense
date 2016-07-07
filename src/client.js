/* global requestAnimationFrame */
const PIXI = require('pixi.js')
const { Game } = require('./Game.js')
const socket = require('socket.io-client')()
const C = require('./constants.js')
// CANVAS AND RENDERER
var renderer = PIXI.autoDetectRenderer(1000, 1000)
document.body.appendChild(renderer.view)
var stage = new PIXI.Container()

var imgResources = [
  'img/grass.png',
  'img/path.png',
  'img/tower1.png',
  'img/tower2_1.png',
  'img/tower2_2.png',
  'img/tower3_1.png',
  'img/tower3_2.png',
  'img/tower3_3.png'
]

// LOAD IMAGES
var ops = null
var game
socket.on('game:state', (state) => {
  game.turn = state.turn
  game.waveNumber = state.waveNumber
})
socket.once('game:bootstrap', (init) => {
  ops = init.ops
  game = new Game(ops)
  game.spawn = init.spawn
  game.waves = init.waves
  PIXI.loader.add(imgResources).load(setup)
})
var tileWidth, tileHeight
function setup () {
  var grass = new PIXI.Sprite(
    PIXI.loader.resources['img/grass.png'].texture
  )
  var path = new PIXI.Sprite(
    PIXI.loader.resources['img/path.png'].texture
  )
  stage.addChild(grass)
  stage.addChild(path)
  tileWidth = grass.width
  tileHeight = grass.height
  renderer.render(stage)

  renderLoop()
  setInterval(game.tick.bind(game), game.ops.timeInterval)
}

function renderLoop () {
  requestAnimationFrame(renderLoop)
  setStage(game.turn.board)
  renderer.render(stage)
}

function setStage (board) {
  for (let a = 0; a < board.length + board[0].length - 1; a++) {
    for (let b = Math.max(0, a - board[0].length + 1); b <= Math.min(a, board.length - 1); b++) {
      var pos = TilePos(board.length, b, a - b)
      var sprite
      if (board[b][a - b] === C.BUILDABLE_CELL) {
        sprite = new PIXI.Sprite(PIXI.loader.resources['img/grass.png'].texture)
      } else if (board[b][a - b] === C.PATH_CELL) {
        sprite = new PIXI.Sprite(PIXI.loader.resources['img/path.png'].texture)
      } else {
        sprite = new PIXI.Sprite(PIXI.loader.resources['img/tower1.png'].texture)
      }
      sprite.x = pos.x
      sprite.y = pos.y
      stage.addChild(sprite)
      console.log('Adding Sprite')
    }
  }
}

function TilePos (boardi, i, j) {
  let y = 0.65 * (i + j) * tileHeight / 2
  let x = (boardi - i + j) * tileWidth / 2
  return {x: x, y: y}
}
