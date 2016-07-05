const test = require('tape')
const { Turn } = require('../src/Turn.js')
const { Building } = require('../src/Building.js')
// const C = require('../src/constants.js')
const clone = require('clone')

test('TOWER :: Basics', (t) => {
  var turn = new Turn([
    [-1, -1],
    [-1, -1]
  ], [{
    tile: { i: 0, j: 0 },
    action: 'BUILD',
    type: 'ARCHER'
  }, null, null, null], [], 1000)
  var building = new Building('ARCHER', { i: 0, j: 0 })
  // console.log(building)
  turn = turn.evolve()
  t.deepEqual(turn.buildings[0], building, 'Buildings should be built')
  t.deepEqual(turn.gold, 975, 'Buildings should cost money')
  turn.inputs = [
    {
      tile: { i: 0, j: 0 },
      action: 'UPGRADE'
    }, null, null, null
  ]
  turn = turn.evolve()
  building.upgrade()
  t.deepEqual(turn.buildings[0], building, 'Buildings should be upgraded')
  t.deepEqual(turn.gold, 915, 'Buildings should cost money')
  turn.inputs = [
    {
      tile: { i: 1, j: 0 },
      action: 'UPGRADE'
    }, null, null, null
  ]
  var turn2 = turn.evolve()
  t.deepEqual(turn2.buildings[0], building, 'not this building')
  t.deepEqual(turn2.buildings[0], turn.buildings[0], 'Buildings should not be upgraded')
  turn = turn.evolve()
  turn.inputs = [
    {
      tile: { i: 0, j: 0 },
      action: 'UPGRADE'
    }, {
      tile: { i: 0, j: 0 },
      action: 'UPGRADE'
    }, null, {
      tile: { i: 1, j: 0 },
      action: 'BUILD',
      type: 'ARCHER'
    }
  ]
  building.upgrade()
  turn = turn.evolve()
  t.deepEqual(turn.buildings[0], building, 'Should upgrade')
  var building2 = clone(building)
  building2.upgrade()
  t.notDeepEqual(turn.buildings[0], building2, 'Should upgrade ONLY ONCE')
  t.deepEqual(turn.buildings[1], new Building('ARCHER', { i: 1, j: 0 }), 'should perform the 3 actions')
  turn.inputs = [
    null, {
      tile: { i: 0, j: 0 },
      action: 'SELL'
    }, null, null
  ]
  const oldgold = turn.gold
  turn = turn.evolve()
  t.notDeepEqual(turn.buildings[0], building, 'Should DELETE a building')
  t.notEqual(turn.gold, oldgold, 'should get more gold')
  t.end()
})
