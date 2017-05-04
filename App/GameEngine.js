const cloneDeep = require('lodash.clonedeep'),
  inRange = require('lodash.inRange'),
  computeNextState = (state, config, move1, move2) => {
    let nextState = cloneDeep(state)
    nextState.roundNumber++
    moveMissiles(nextState, config)
    resolveExplosions(nextState)
    tickBombs(nextState)
    resolveExplosions(nextState)
    if (!isThereAWinner(nextState)) {
      movePlayers(nextState, move1, move2)
    }
    return nextState
  },
  moveMissiles = (state, config) => {
    state.missiles = state.missiles.filter(missile => {
      ['x', 'y'].forEach(cord => missile[cord] += directionToVector(missile.direction)[cord])
      return !isMissileCollidingObstacle(missile, state) && !isMissileOutOfBounds(missile, state, config)
    })
  },
  tickBombs = state => {
    state.bombs = state.bombs.filter(bomb => {
      if (bomb.timeToExplode-- <= 0) {
        explode(bomb.x, bomb.y, bomb.explosionRadius, state)
        return false
      } else return true
    })
  },
  directionToVector = direction => {
    switch (direction) {
      case 0: return {x: 0, y: -1}
      case 1: return {x: -1, y: 0}
      case 2: return {x: 0, y: 1}
      case 3: return {x: 1, y: 0}
    }
  },
  explode = (x, y, radius, state) => {
    state.explosions = state.explosions || []
    for (let r = -radius; r <= radius; r++) {
      state.explosions.push({x: x + r, y})
      if (r != 0) state.explosions.push({x, y: y + r})
    }
  },
  isMissileCollidingObstacle = (missile, state) => {
    return !state.obstacles.every(obstacle => {
      if (missile.x == obstacle.x && missile.y == obstacle.y) {
        explode(missile.x, missile.y, missile.explosionRadius, state)
        return false
      } else return true
    })
  },
  isMissileOutOfBounds = (missile, state, config) => {
    if ((inRange(missile.x, 0, config.width) && inRange(missile.y, 0, config.height))) return false
    else {
      explode(missile.x, missile.y, missile.radius, state)
      return true
    }
  },
  resolveExplosions = state => {
    state.explosions = state.explosions || []
    state.explosions.forEach(explosion => {
      state.obstacles = state.obstacles.filter(obstacle => obstacle.x != explosion.x || obstacle.y != explosion.y)
      state.players = state.players.filter(players => players.x != explosion.x || players.y != explosion.y)
      // state.bombs = state.bombs.filter(bomb => {
      //   if (bomb.x != explosion.x || bomb.y != explosion.y) {
      //     explode(bomb.x, bomb.y, bomb.explosionRadius, state)
      //     return true
      //   } else return false
      // })
      // state.missiles = state.missiles.filter(missile => {
      //   if (missile.x != explosion.x || missile.y != explosion.y) {
      //     explode(missile.x, missile.y, missile.explosionRadius, state)
      //     return true
      //   } else return false
      // })
    })
    // state.explosions = []
  },
  movePlayers = (state, move1, move2) => {
    movePlayer(state, move1, 0)
    movePlayer(state, move2, 1)
  },
  movePlayer = (state, move, player) => {
    const newPosition = ['x', 'y'].reduce((positionObject, cord) => {
      positionObject[cord] = state.players[player][cord] + directionToVector(move.direction)[cord]
      return positionObject
    }, {})

    if (
      state.obstacles.every(obstacle => obstacle.x != newPosition.x || obstacle.y != newPosition.y)
    ) {
      ['x', 'y'].forEach(cord => state.players[player][cord] = newPosition[cord])
    }
  }
isThereAWinner = state => {
  return state.players.length < 2
}

module.exports = {
  computeNextState: computeNextState
}
