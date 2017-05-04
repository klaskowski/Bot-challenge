const t = require('tape'),
  GameEngine = require('./GameEngine')

t.test('computeNextState', t => {
  const initialState = _ => ({
      roundNumber: 0,
      players: [{
        name: 'player1',
        x: 2,
        y: 1
      }, {
        name: 'player2',
        x: 19,
        y: 19
      }],
      obstacles: [{
        x: 1,
        y: 2
      }, {
        x: 2,
        y: 3
      }, {
        x: 2,
        y: 4
      }, {
        x: 2,
        y: 5
      }, {
        x: 2,
        y: 6
      }, {
        x: 3,
        y: 7
      }, {
        x: 3,
        y: 8
      }, {
        x: 3,
        y: 9
      }, {
        x: 3,
        y: 10
      }],
      missiles: [{
        x: 5,
        y: 5,
        direction: 0,
        explosionRadius: 3
      }, {
        x: 2,
        y: 7,
        direction: 0,
        explosionRadius: 3
      }],
      bombs: [{
        x: 8,
        y: 8,
        timeToExplode: 2,
        explosionRadius: 3
      }]
    }),
    config = {
      width: 20,
      height: 20,
      missileExplosionRadius: 3,
      bombExplosionRadius: 3,
      bombClockTime: 5,
      missileCooldown: 5,
      roundsToIncreaseExplosion: 70,
      fastMissiles: false
    },
    moveDownDropBomb = {
      direction: 2,
      action: 1
    },
    moveUpShootUp = {
      direction: 0,
      action: 2,
      fireDirection: 2
    },
    moveRight = {
      direction: 1,
      action: 0
    }
  addMissile = (state, x, y, direction, explosionRadius) => {
    state.missiles.push({
      x,
      y,
      direction,
      explosionRadius
    })
    return state
  }

  t.test('missile', t => {
    t.equals(
      GameEngine.computeNextState(
        initialState(),
        config,
        moveDownDropBomb,
        moveUpShootUp
      ).missiles[0].y,
      initialState().missiles[0].y - 1,
      'moves in a proper direction')

    t.equals(
      GameEngine.computeNextState(initialState(), config, moveDownDropBomb, moveUpShootUp).missiles.length,
      initialState().missiles.length - 1,
      'explodes after collision with an obstacle')

    // TODO
    // t.equals(
    //   false,
    //   true,
    //   'explodes after collision with a bomb')
    // t.equals(
    //   false,
    //   true,
    //   'explodes after collision with a player')

    let initialTestState = initialState()
    initialTestState.missiles = [{
      x: 0,
      y: 0,
      direction: 0,
      radius: 3
    }]
    t.equals(
      GameEngine.computeNextState(initialTestState, config, moveDownDropBomb, moveDownDropBomb).missiles.length,
      initialTestState.missiles.length - 1,
      'explodes when out of bounds')
    t.end()
  })
  t.test('bomb', t => {
    t.equals(
      GameEngine.computeNextState(initialState(), config, moveDownDropBomb, moveUpShootUp).bombs[0].timeToExplode,
      initialState().bombs[0].timeToExplode - 1,
      'ticks each round')

    let initialTestState = initialState()
    stateWrapper = (state1, move) => {
      let state = state1,
        wrapped = {
          next: _ => {
            state = GameEngine.computeNextState(state, config, move, move)
            return wrapped
          },
          get: _ => state
        }
      return wrapped
    }
    t.equals(
      stateWrapper(initialState(), moveRight).next().next().next().get().bombs.length,
      initialState().bombs.length - 1,
      'explodes after countdown ends')
    t.end()
  })
  t.test('explosions', t => {
    let initialTestState = initialState(),
      nextState = GameEngine.computeNextState(
        initialTestState,
        config,
        moveDownDropBomb,
        moveUpShootUp
      )
    t.deepEqual(
      nextState.explosions,
      [ { x: -1, y: 6 },
     { x: 2, y: 3 },
     { x: 0, y: 6 },
     { x: 2, y: 4 },
     { x: 1, y: 6 },
     { x: 2, y: 5 },
     { x: 2, y: 6 },
     { x: 3, y: 6 },
     { x: 2, y: 7 },
     { x: 4, y: 6 },
     { x: 2, y: 8 },
     { x: 5, y: 6 },
     { x: 2, y: 9 } ],
      'puts explosions in range on both axis')
    t.deepEqual(
      nextState.obstacles,
      [ { x: 1, y: 2 },
     { x: 3, y: 7 },
     { x: 3, y: 8 },
     { x: 3, y: 9 },
     { x: 3, y: 10 } ],
      'destroys obstacles')

    initialTestState.players[0] = {
      name: 'player1', x: 2, y: 9
    }
    nextState = GameEngine.computeNextState(
        initialTestState,
        config,
        moveUpShootUp,
        moveUpShootUp
      )
    t.equals(
      nextState.players.length,
      initialTestState.players.length - 1,
      'kills players')
    // TODO
    // t.equals(
    //   false,
    //   true,
    //   'impales bombs')
    // t.equals(
    //   false,
    //   true,
    //   'impales missiles')
    t.end()
  })
  t.test('players', t => {
    let initialTestState = initialState(),
      nextState = GameEngine.computeNextState(
        initialTestState,
        config,
        moveDownDropBomb,
        moveUpShootUp
      )
    t.equals(
      nextState.players[0].y,
      initialTestState.players[0].y + 1,
      'moves in a proper direction')

    initialTestState = initialState()
    initialTestState.players[0].x = 1
    nextState = GameEngine.computeNextState(
        initialTestState,
        config,
        moveDownDropBomb,
        moveUpShootUp
      )
    t.equals(
      nextState.players[0].y,
      initialTestState.players[0].y,
      'collides with obstacles')

    initialTestState.players[1].x = 8
    initialTestState.players[1].y = 7
    nextState = GameEngine.computeNextState(
        initialTestState,
        config,
        moveUpShootUp,
        moveDownDropBomb
      )
    t.equals(
      nextState.players[1].y,
      initialTestState.players[1].y + 1,
      'ignores collision with (steps over) bombs')
    t.end()
  })
  t.end()
})
