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

function validPos (position, lengthi, lengthj) {
  return position.i >= 0 && position.j >= 0 && position.i < lengthi && position.j < lengthj
}

function equalPos (pos1, pos2) {
  return pos1.i === pos2.i && pos1.j === pos2.j
}

function getSurroundingPathTiles (position, board) {
  var tilePos = []
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (!(i === 0 && j === 0)) {
        if (validPos({i: position.i + i, j: position.j + j}, board.length, board[0].length)) {
          if (board[position.i + i][position.j + j] === C.PATH_CELL) tilePos.push({i: position.i + i, j: position.j + j})
        }
      }
    }
  }
  return tilePos
}
function getAdjacentPathTiles (position, board) {
  var tilePos = []
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (!(i === 0 && j === 0)) {
        if (validPos({i: position.i + i, j: position.j + j}, board.length, board[0].length)) {
          if (i === 0 || j === 0) {
            if (board[position.i + i][position.j + j] === C.PATH_CELL || board[position.i + i][position.j + j] === C.END_CELL) tilePos.push({i: position.i + i, j: position.j + j})
          }
        }
      }
    }
  }
  return tilePos
}
function getPosInBoard (board, pos) {
  if (validPos(pos, board.length, board[0].length)) return board[pos.i][pos.j]
  else console.log('Error: attempt to access: ' + JSON.stringify(pos))
}

class Turn {
  constructor (board, inputs, buildings, gold, enemies, lifes) {
    this.board = board
    this.inputs = inputs
    this.gold = gold
    this.buildings = buildings
    this.enemies = enemies
    this.lifes = lifes
  }
  evolve () {
    var nwboard = clone(this.board)
    var nwgold = this.gold
    var nwbuildings = clone(this.buildings)
    var nwenemies = clone(this.enemies)
    var nwlifes = this.lifes
    // work inputs
    var workedTiles = []
    for (let i = 0; i < C.MAX_PLAYERS; i++) {
      if (this.inputs[i] !== null) {
        let x = true
        workedTiles.forEach(tile => {
          if (equalPos(this.inputs[i].tile, tile)) x = false
        })
        if (!x) console.log('Tile already worked on this turn!')
        else {
          workedTiles.push(this.inputs[i].tile) // move to every case where it works ?
          if (this.inputs[i].action === 'BUILD') {
            if (getPosInBoard(nwboard, this.inputs[i].tile) !== C.BUILDABLE_CELL) console.log('cant build there')
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
              nwboard[this.inputs[i].tile.i][this.inputs[i].tile.j] = C.BUILDABLE_CELL
              nwgold += cost
            }
          }
        }
      }
    }
    // SPAWN ENEMIES (or do on game?)
    // Towers work (targetting, shooting)
    nwbuildings.forEach(tower => {
      if (tower.cooldown > 0) tower.cooldown--
      else {
        if (tower.target === null) {
          let possibleTiles = getSurroundingPathTiles(tower.position, nwboard)
          // CAMBIAR A METODO MAS CERCA FINAL
          for (let i = possibleTiles.length - 1; i >= 0; i--) {
            let it = searchPosInVector(possibleTiles[i], nwenemies)
            if (it !== nwenemies.length) {
              tower.target = nwenemies[it].id
              console.log('A tower picks a target with ID: ' + tower.target)
            }
          }
        }
        if (tower.target !== null) {
          let i = 0
          var found = false
          while (!found && i < nwenemies.length) {
            if (nwenemies[i].id !== tower.target) i++
            else found = true
          }
          if (i === nwenemies.length) tower.target = null
          else {
            console.log(nwenemies[i].life)
            nwenemies[i].life -= tower.dmg
            tower.cooldown = tower.maxCD
            console.log('A tower attacks!')
            console.log(nwenemies[i].life)
          }
        }
      }
    })
    // kill enemies or move them or loose lifes
    for (let i = 0, j = nwenemies.length; i < j; i++) {
      if (getPosInBoard(nwboard, nwenemies[i].position) === C.END_CELL) {
        nwenemies.splice(i, 1)
        j--
        i--
        nwlifes--
        console.log('An enemy escapes!')
      } else if (nwenemies[i].life <= 0) {
        nwgold += nwenemies[i].killVal()
        console.log('An enemy dies, leaving ' + nwenemies[i].killVal() + 'G !!')
        nwenemies.splice(i, 1)
        j--
        i--
      } else {
        if (nwenemies[i].cd > 0) nwenemies[i].cd--
        else {
          let possibleTiles = getAdjacentPathTiles(nwenemies[i].position, nwboard)
          let foo = 0
          let found = false
          while (!found && foo < possibleTiles.length) {
            if (!equalPos(possibleTiles[foo], nwenemies[i].lastposition)) found = true
            else foo++
          }
          if (foo === possibleTiles.lenght) console.log('ERROR: enemy in ' + nwenemies[i].position + ' reached a deadend')
          nwenemies[i].lastposition = nwenemies[i].position
          nwenemies[i].position = possibleTiles[foo]
          console.log('An enemy moves from ' + JSON.stringify(nwenemies[i].lastposition) + 'to' + JSON.stringify(nwenemies[i].position))
          nwenemies[i].cd = nwenemies[i].maxCD
        }
      }
    }
    return new Turn(nwboard, [null, null, null, null], nwbuildings, nwgold, nwenemies, nwlifes)
  }
}

exports.Turn = Turn
