/* global requestAnimationFrame */
const PIXI = require('pixi.js')
var renderer = new PIXI.WebGLRenderer(800, 600)
document.body.appendChild(renderer.view)
var stage = global.stage = new PIXI.Container()

const io = require('socket.io-client')
const { Game } = require('./Game.js')

function onAssetsLoaded () {
  const sprite = PIXI.Sprite.fromFrame("landscape_00.png")
  state.addChild(sprite)
}

const loader = new PIXI.loaders.Loader("./images", 5)
loader.add('landscape-sprites', 'Spritesheet/landscape-sprites.xml')
loader.on('complete', onAssetsLoaded)
loader.load()

/*
const spriteMatrix = []
for ()
  for ()
*/

// necesito las OPS
let game
const socket = io()

/*
socket.on('bootstrap', () => {
  game = new Game(opts)
  game.board
  for ()
    for ()
      game
}
*/

socket.on('game:state', (state, turnIndex) => {
  if (turnIndex === 0)
  game.players = state.players
  game.turn = state.turn
})

function animate () {
  // start the timer for the next animation loop
  requestAnimationFrame(animate)

  // each frame we spin the bunny around a bit
  // bunny.rotation += 0.01

  // this is the main render call that makes pixi draw your container and its children.
  renderer.render(stage)
}
animate()
