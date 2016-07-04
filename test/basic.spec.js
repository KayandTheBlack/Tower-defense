const test = require('tape')
const { BasicAI } = require('../src/npc.js')
// const C = require('../src/constants.js')
const clone = require('clone')

test('NPC :: Basics', (t) => {
  const board = [
    [0, 0, 0],
    [-1, 0, -1],
    [-1, -1, -1]
  ]
  var enemy = new BasicAI('Orc', 0, { i: 1, j: 0 }, 3, 2, 1, 1, 'lol')
  var ally = new BasicAI('Guard', 1, { i: 1, j: 2 }, 4, 2, 1, 1, 'lol')
  board[1][0] = [enemy]
  board[1][2] = [ally]

  var testboard = clone(board)
  console.log(enemy)
  var enemy2 = clone(enemy)
  console.log(enemy)
  console.log(enemy2)
  console.log(enemy2.attack)
  enemy.tickTurn(board)
  enemy2.position.i = 2
  testboard[2][0] = [enemy]

  t.deepEqual(enemy, enemy2, 'Inputs should be equal')
  t.deepEqual(board, testboard, 'boards should be equal')
 /*
  const nextTurn = turn.evolve()
  t.deepEqual(turn.board, boardCopy, 'evolve shouldnt modify the board')
  t.deepEqual(turn.bikes, bikesCopy, 'evolve shouldnt modify the bikes')
  t.deepEqual(turn.inputs, [C.UP, null], 'evolve shouldnt modify the inputs')
  turn.setInput(1, C.UP) // shouldnt affect the already evolved turn
  t.ok(nextTurn instanceof Turn, 'evolve should return an instance of Turn')
  t.notEqual(turn, nextTurn, 'evolve should return a new instance of Turn')
  t.notEqual(turn.board, nextTurn.board, 'turns shouldnt share boards')
  t.notEqual(turn.bikes, nextTurn.bikes, 'turns shouldnt share bikes')
  t.notEqual(turn.inputs, nextTurn.inputs, 'turns shouldnt share inputs')
  t.deepEqual(nextTurn.board, [
    [1, 0, 0],
    [1, 0, 0],
    [0, 2, 2]
  ], 'bikes should move on the board')
  t.deepEqual(nextTurn.bikes, [
    { i: 0, j: 0, dir: C.UP, alive: true },
    { i: 2, j: 1, dir: C.LEFT, alive: true }
  ], 'bike position and direction should update')
  t.deepEqual(nextTurn.inputs, [null, null], 'a new turns inputs should be null') */
  t.end()
})
