'use strict'
module.exports = {
  BUILDABLE_CELL: -1,
  BUILT_CELL: -2,
  END_CELL: -3,
  PATH_CELL: 0,
  MAX_PLAYERS: 4,
  MAXLVL: 100,
  // BUILDINGS
  COST: {
    ARCHER: 25,
    CANON: 100,
    MAGE: 200
  },
  ARCHER: {
    BASEDMG: 3,
    MAX_COOLDOWN: 5,
    UPDMG: 3, // + last damage??
    UPCOOL: 1,
    UPCOST: 30 // times lvl to upgrade?
  },
  CANON: {
    BASEDMG: 5,
    MAX_COOLDOWN: 5,
    UPDMG: 2, // + last damage??
    UPCOOL: 0,
    UPCOST: 50 // times lvl to upgrade?
  },
  SELL_MODIFIER: 0.25,
  // ENEMIES
  BASIC: {
    MOVSPEED: 3,
    BASELIFE: 4
  },
  QUICK: {
    MOVSPEED: 1,
    BASELIFE: 2
  },
  TANK: {
    MOVSPEED: 6,
    BASELIFE: 20
  }
}
