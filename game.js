kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  debug: true,
  clearColor: [0, 0, 0, 1],
})

//Speed identifiers
const MOVE_SPEED = 120
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
const ENEMY_SPEED = 20
const FALL_DEATH = 400

// Game Logic
let isJumping = true

loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')

loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-evil-shroom', 'SvV4ueD.png')
loadSprite('blue-surprise', 'RMqCc1G.png')

scene("game", ({ level, score }) => {
  layers(['bg', 'obj', 'ui'], 'obj')

  const maps = [
    [
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '     %   =*=%=                        ',
      '                                      ',
      '                            -+        ',
      '                    ^   ^   ()        ',
      '==============================   =====',
    ],
    [
      '£                                       £',
      '£                                       £',
      '£                                       £',
      '£                                       £',
      '£                                       £',
      '£        @@@@@@              x x        £',
      '£                          x x x        £',
      '£                        x x x x  x   -+£',
      '£               z   z  x x x x x  x   ()£',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ],
    [
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '            @   @   @                 ',
      '                                      ',
      '                                 -+   ',
      '                      ^  z       ()   ',
      '======================================',
    ],
    [
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£      @@@@                            £',
      '£                                      £',
      '£                    -+                £',
      '£        z z         ()                £',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ],
    [
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '   %%%                                ',
      '                                      ',
      '                          -+          ',
      '               ^ ^ ^ ^    ()          ',
      '======================================',
    ],
    [
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£             @@@@@@@@@                £',
      '£                                      £',
      '£        -+                            £',
      '£        ()       z z z z z z          £',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ],
    [
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '        * * * * *                     ',
      '                                      ',
      '                    -+                ',
      '         ^ ^ ^ ^ ^  ()                ',
      '===    ===============================',
    ],
    [
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£   @@@@@@@@@@@@@@@@@@@                £',
      '£                                      £',
      '£               -+                     £',
      '£               ()  z z z z z z z      £',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ],
    [
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '   % % % % % % % % %                  ',
      '                                      ',
      '                         -+           ',
      '              ^ ^ ^ ^ ^  ()           ',
      '======================================',
    ],
    [
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£                                      £',
      '£  @@@@@@@@@@@@@@@@@@@@@@@@@@@         £',
      '£                                      £',
      '£          -+                          £',
      '£          ()   z z z z z z z z z      £',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ]
  ]

  const levelCfg = {
    width: 20,
    height: 20,
    '=': [sprite('block'), solid()],
    '$': [sprite('coin'), 'coin'],
    '%': [sprite('surprise'), solid(), 'coin-surprise'],
    '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
    ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
    '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
    '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
    '^': [sprite('evil-shroom'), solid(), 'dangerous'],
    '#': [sprite('mushroom'), solid(), 'mushroom', body()],
    '!': [sprite('blue-block'), solid(), scale(0.5)],
    '£': [sprite('blue-brick'), solid(), scale(0.5)],
    'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
    '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
    'x': [sprite('blue-steel'), solid(), scale(0.5)],
  }

  const gameLevel = addLevel(maps[level], levelCfg)

  const scoreLabel = add([
    text(score),
    pos(30, 6),
    layer('ui'),
    {
      value: score
    }
  ])

  add([text('level ' + parseInt(level + 1)), pos(40, 6)])

  function big() {
    let timer = 0
    let isBig = false
    return {
      update() {
        if (isBig) {
          CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
          timer -= dt()
          if (timer <= 0) {
            this.smallify()
          }
        }
      },
      isBig() {
        return isBig
      },
      smallify() {
        this.scale = vec2(1)
        CURRENT_JUMP_FORCE = JUMP_FORCE
        timer = 0
        isBig = false
      },
      biggify(time) {
        this.scale = vec2(2)
        timer = time
        isBig = true
      }
    }
  }

  const player = add([
    sprite('mario'), solid(),
    pos(30, 0),
    body(),
    big(),
    origin('bot')
  ])

  action('mushroom', (m) => {
    m.move(25, 0)
  })

  player.on("headbump", (obj) => {
    if (obj.is('coin-surprise')) {
      // Auto-collect coin
      scoreLabel.value++
      scoreLabel.text = scoreLabel.value
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0, 0))
      
      // Create invisible hole
      add([
        pos(obj.pos.add(0, 20)),
        area({ width: 20, height: 40 }),
        'hole'
      ])
    }
    if (obj.is('mushroom-surprise')) {
      gameLevel.spawn('#', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0, 0))
      
      // Create invisible hole
      add([
        pos(obj.pos.add(0, 20)),
        area({ width: 20, height: 40 }),
        'hole'
      ])
    }
  })

  player.collides('mushroom', (m) => {
    destroy(m)
    player.biggify(6)
  })

  action('dangerous', (d) => {
    d.move(-ENEMY_SPEED, 0)
    
    // Check if enemy is touching any hole
    get('hole').forEach(hole => {
      if (d.pos.dist(hole.pos) < 30) {
        destroy(d)
      }
    })
  })

  player.collides('dangerous', (d) => {
    if (isJumping) {
      destroy(d)
    } else {
      go('lose', { score: scoreLabel.value })
    }
  })

  player.action(() => {
    camPos(player.pos)
    if (player.pos.y >= FALL_DEATH) {
      go('lose', { score: scoreLabel.value })
    }
  })

  player.collides('pipe', () => {
    keyPress('down', () => {
      if (level < maps.length - 1) {
        go('game', {
          level: level + 1,
          score: scoreLabel.value
        })
      } else {
        go('gameEnd', { score: scoreLabel.value })
      }
    })
  })

  keyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  keyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  player.action(() => {
    if (player.grounded()) {
      isJumping = false
    }
  })

  keyPress('space', () => {
    if (player.grounded()) {
      isJumping = true
      player.jump(CURRENT_JUMP_FORCE)
    }
  })
})

scene('lose', ({ score }) => {
  add([
    text('Game Over\nScore: ' + score, 32), 
    origin('center'), 
    pos(width() / 2, height() / 2)
  ])
  
  add([
    text('Press space to restart', 16),
    origin('center'),
    pos(width() / 2, height() / 2 + 50)
  ])
  
  keyPress('space', () => {
    go('game', { level: 0, score: 0 })
  })
})

scene('gameEnd', ({ score }) => {
  add([
    text('Congratulations!\nYou completed all levels!\nFinal Score: ' + score, 32),
    origin('center'),
    pos(width() / 2, height() / 2 - 50)
  ])
  
  add([
    text('Press space to play again', 16),
    origin('center'),
    pos(width() / 2, height() / 2 + 50)
  ])
  
  keyPress('space', () => {
    go('game', { level: 0, score: 0 })
  })
})

start("game", { level: 0, score: 0 })