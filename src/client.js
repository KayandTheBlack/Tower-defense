/* global requestAnimationFrame */
'use strict'
const PIXI = require('pixi.js')
const { Game } = require('./Game.js')
const { Turn } = require('./Turn.js')
const { Enemy } = require('./Enemy.js')
const { Building } = require('./Building.js')
const socket = require('socket.io-client')()
const C = require('./constants.js')
// CANVAS AND RENDERER
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.view)
var stage = new PIXI.Container()
stage.scale = {x: 3, y: 3}
var imgResources = [
  'img/grass.png',
  'img/path.png',
  'img/tower1.png',
  'img/tower2_1.png',
  'img/tower2_2.png',
  'img/tower3_1.png',
  'img/tower3_2.png',
  'img/tower3_3.png',
  'img/sell.png',
  'img/chrystal.png',
  'img/orc.png',
  'img/trees_2.png',
  'img/tank.png',
]

// LOAD IMAGES
var ops = null
var game
socket.on('game:state', (state) => {
  game.turn = new Turn(state.turn.board, state.turn.inputs, state.turn.buildings, state.turn.gold, state.turn.enemies, state.turn.lifes)
  game.waveNumber = state.waveNumber
  game.turn.enemies = game.turn.enemies.map(e => {
    const enemy = new Enemy(e.type, e.position, e.lvl)
    Object.assign(enemy, e)
    return enemy
  })
  game.turn.buildings = game.turn.buildings.map(e => {
    const building = new Building(e.type, e.position)
    Object.assign(building, e)
    return building
  })
  game.lifes = state.lifes
})
socket.once('game:bootstrap', (init) => {
  ops = init.ops
  game = new Game(ops)
  game.spawn = init.spawn
  game.waves = init.waves
  game.players = 'CLIENT'
  PIXI.loader.add(imgResources).load(setup)
})

var spriteMat
var tileWidth, tileHeight
function input (type) {
  const input = {
    action: type,
    tile: SelectedTile,
    type: 'ARCHER'
  }
  game.onInput(input)
  socket.emit('input', input)
}
var goldy = new PIXI.Text('Bling Blings: ', {font: '30px Arial', fill: 'gold'})
var lify = new PIXI.Text('Lifes: ', {font: '30px Arial', fill: 'red'})
var wavy = new PIXI.Text('WAVE: ', {font: '30px Arial', fill: 'red'})
var BuildSprite
var UpgradeSprite
var SellSprite
function GUI () {
  var Relheight = TilePos(game.turn.board.length, game.turn.board.length, game.turn.board[0].length).y
  BuildSprite = new PIXI.Sprite(
    PIXI.loader.resources['img/tower1.png'].texture
  )
  UpgradeSprite = new PIXI.Sprite(
    PIXI.loader.resources['img/tower3_3.png'].texture
  )
  SellSprite = new PIXI.Sprite(
    PIXI.loader.resources['img/sell.png'].texture
  )
  const HeightMargin = 50
  const WidthMargin = 250
  BuildSprite.y = Relheight + HeightMargin
  BuildSprite.x = 100
  UpgradeSprite.y = Relheight + HeightMargin
  UpgradeSprite.x = 100 + WidthMargin
  SellSprite.y = Relheight + HeightMargin
  SellSprite.x = 100 + WidthMargin * 2
  SellSprite.height = BuildSprite.height
  SellSprite.width = BuildSprite.width
  BuildSprite.interactive = true
  BuildSprite.buttonMode = true
  UpgradeSprite.interactive = true
  UpgradeSprite.buttonMode = true
  SellSprite.interactive = true
  SellSprite.buttonMode = true
  BuildSprite.on('mouseover', (e) => {
    BuildSprite.tint = 0xFF0000
  })
  BuildSprite.on('mouseout', (e) => {
    BuildSprite.tint = 0xFFFFFF
  })
  BuildSprite.on('click', (e) => {
    input('BUILD')
  })
  UpgradeSprite.on('mouseover', (e) => {
    UpgradeSprite.tint = 0xFF0000
  })
  UpgradeSprite.on('mouseout', (e) => {
    UpgradeSprite.tint = 0xFFFFFF
  })
  UpgradeSprite.on('click', (e) => {
    input('UPGRADE')
  })
  SellSprite.on('mouseover', (e) => {
    SellSprite.tint = 0xFF0000
  })
  SellSprite.on('mouseout', (e) => {
    SellSprite.tint = 0xFFFFFF
  })
  SellSprite.on('click', (e) => {
    input('SELL')
  })
  stage.addChild(BuildSprite)
  stage.addChild(UpgradeSprite)
  stage.addChild(SellSprite)

  lify.y += 30
  wavy.y += 75
  stage.addChild(goldy)
  stage.addChild(lify)
  stage.addChild(wavy)
}
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
function setup () {
  var grass = new PIXI.Sprite(
    PIXI.loader.resources['img/grass.png'].texture
  )
  // stage.addChild(grass)
  // stage.addChild(path)
  tileWidth = grass.width
  tileHeight = grass.height
  renderer.render(stage)
  spriteMat = Array(game.turn.board.length).fill().map(() => Array(game.turn.board[0].length).fill(null))
  setStage(game.turn.board)
  GUI()
  
  renderLoop()
  setInterval(() => {
    game.tick()
    for (let i = 0; i < spriteMat.length; i++) {
      for (let j = 0; j < spriteMat[0].length; j++) {
        spriteMat[i][j].removeChildren()
      }
    }
    let arrived = 0
    game.turn.enemies.forEach(foe => {
      let i = foe.position.i
      let j = foe.position.j
      let OrcSprite 
      if(foe.type === 'BASIC') {
        OrcSprite = new PIXI.Sprite(
          PIXI.loader.resources['img/orc.png'].texture
        )
        OrcSprite.height = 40
        OrcSprite.width = 30
      } else if (foe.type === 'TANK') {
        OrcSprite = new PIXI.Sprite(
          PIXI.loader.resources['img/tank.png'].texture
        )
        OrcSprite.height = 100
        OrcSprite.width = 75
        OrcSprite.y -= 40
      } else if (foe.type === 'QUICK') {
        OrcSprite = new PIXI.Sprite(
          PIXI.loader.resources['img/orc.png'].texture
        )
        OrcSprite.height = 30
        OrcSprite.width = 24
      }
      OrcSprite.x += 30 + Math.random() * 40
      OrcSprite.y -= 8 - arrived * 10
      spriteMat[i][j].addChild(OrcSprite)
    })
    game.turn.buildings.forEach(tower => {
      let i = tower.position.i
      let j = tower.position.j
      spriteMat[i][j].texture = PIXI.loader.resources['img/grass.png'].texture
      let pos = TilePos(game.turn.board.length, i, j)
      spriteMat[i][j].x = pos.x
      spriteMat[i][j].y = pos.y + 40
      if (tower.lvl === 1) {
        let TowerSprite = new PIXI.Sprite(
          PIXI.loader.resources['img/tower1.png'].texture
        )
        TowerSprite.x += 20
        TowerSprite.y -= 20
        spriteMat[i][j].addChild(TowerSprite)
      } else if (tower.lvl === 2) {
        let TowerSprite1 = new PIXI.Sprite(
          PIXI.loader.resources['img/tower2_1.png'].texture
        )
        TowerSprite1.x += 20
        TowerSprite1.y -= 20
        let TowerSprite2 = new PIXI.Sprite(
          PIXI.loader.resources['img/tower2_2.png'].texture
        )
        TowerSprite2.y -= 43
        TowerSprite2.x -= 4
        TowerSprite1.addChild(TowerSprite2)
        spriteMat[i][j].addChild(TowerSprite1)
      } else {
        let TowerSprite1 = new PIXI.Sprite(
          PIXI.loader.resources['img/tower3_1.png'].texture
        )
        TowerSprite1.x += 20
        TowerSprite1.y -= 20
        let TowerSprite2 = new PIXI.Sprite(
          PIXI.loader.resources['img/tower3_2.png'].texture
        )
        TowerSprite2.y -= 32
        TowerSprite2.x += 11
        let TowerSprite3 = new PIXI.Sprite(
          PIXI.loader.resources['img/tower3_3.png'].texture
        )
        TowerSprite3.y -= 60
        TowerSprite3.x -= 4
        TowerSprite2.addChild(TowerSprite3)
        TowerSprite1.addChild(TowerSprite2)
        spriteMat[i][j].addChild(TowerSprite1)
      }
    })
    var gold = new PIXI.Text(Math.round(game.turn.gold * 4) / 4, {font: '30px Arial', fill: 'gold'})
    gold.x += 175
    goldy.removeChildren()
    goldy.addChild(gold)
    var life = new PIXI.Text(game.turn.lifes, {font: '30px Arial', fill: 'red'})
    life.x += 85
    lify.removeChildren()
    lify.addChild(life)
    var wave = new PIXI.Text(game.waveNumber + 1, {font: '30px Arial', fill: 'red'})
    wave.x += 125
    wavy.removeChildren()
    wavy.addChild(wave)
    var TowerCost = new PIXI.Text(C.COST.ARCHER, {font: '30px Arial', fill: 'gold'})
    var UpCost, SellCost
    let it = 0
    it = searchPosInVector (SelectedTile, game.turn.buildings)
    UpCost = new PIXI.Text(0, {font: '30px Arial', fill: 'gold'})
    SellCost = new PIXI.Text(0, {font: '30px Arial', fill: 'gold'})
    if (it !== game.turn.buildings.length) {
      UpCost = new PIXI.Text(game.turn.buildings[it].upgradeCost(), {font: '30px Arial', fill: 'gold'})
      SellCost = new PIXI.Text(game.turn.buildings[it].SellCost(), {font: '30px Arial', fill: 'gold'})
    }
    TowerCost.y += 100
    UpCost.y += 100
    SellCost.y += 100
    SellCost.width = 100000
    SellCost.height = 100000
    BuildSprite.removeChildren()
    BuildSprite.addChild(TowerCost)
    UpgradeSprite.removeChildren()
    UpgradeSprite.addChild(UpCost)
    SellSprite.removeChildren()
    SellSprite.addChild(SellCost)
  }, game.ops.timeInterval)
}

function renderLoop () {
  requestAnimationFrame(renderLoop)
  renderer.render(stage)
}
var SelectedTile = {i: -1, j: -1}
function setStage (board, sprites) {
  for (let a = 0; a < board.length + board[0].length - 1; a++) {
    for (let b = Math.max(0, a - board[0].length + 1); b <= Math.min(a, board.length - 1); b++) {
      var pos = TilePos(board.length, b, a - b)
      if (board[b][a - b] === C.BUILDABLE_CELL) {
        const type = Math.random()
        if (type < 0.90) spriteMat[b][a - b] = new PIXI.Sprite(PIXI.loader.resources['img/grass.png'].texture)
        else {
          spriteMat[b][a - b] = new PIXI.Sprite(PIXI.loader.resources['img/trees_2.png'].texture)
          pos.y -= 21
        }
        spriteMat[b][a - b].interactive = true
        spriteMat[b][a - b].buttonMode = true
        spriteMat[b][a - b].on('mouseover', (e) => {
          spriteMat[b][a - b].tint = 0x00FF00
        })
        spriteMat[b][a - b].on('mouseout', (e) => {
          if (!(SelectedTile.i === b && SelectedTile.j === a - b)) spriteMat[b][a - b].tint = 0xFFFFFF
          else spriteMat[b][a - b].tint = 0xFF0000
        })
        spriteMat[b][a - b].on('click', (e) => {
          if (SelectedTile.i !== -1 && SelectedTile.j !== -1) spriteMat[SelectedTile.i][SelectedTile.j].tint = 0xFFFFFF
          spriteMat[b][a - b].tint = 0xFF0000
          SelectedTile = {i: b, j: a - b}
          console.log(SelectedTile)
        })
      } else if (board[b][a - b] === C.PATH_CELL) {
        spriteMat[b][a - b] = new PIXI.Sprite(PIXI.loader.resources['img/path.png'].texture)
        pos.y += 15
      } else if (board[b][a - b] === C.END_CELL) {
        spriteMat[b][a - b] = new PIXI.Sprite(PIXI.loader.resources['img/chrystal.png'].texture)
        pos.y -= 15
      }
      spriteMat[b][a - b].x = pos.x
      spriteMat[b][a - b].y = pos.y +  40
      stage.addChild(spriteMat[b][a - b])
    }
  }
}

function TilePos (boardi, i, j) {
  let y = 0.66 * (i + j) * tileHeight / 2
  let x = (boardi - i + j) * tileWidth / 2
  return {x: x, y: y}
}
