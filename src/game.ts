
interface Rect {
  width: number
  height: number
}

interface PosRect {
  x: number
  y: number
  width: number
  height: number
}

interface MenuState {
  tag: 'menu'
  score?: number
}

interface PlayingState {
  tag: 'playing'
  yOffset: number
  score: number
  ballState: {
    x: number
    v: number
  }
  obstacles: Array<{
    x: number
    y: number
    r: number
  }>
}

type GameplayState = MenuState | PlayingState

interface GameState {
  canvasId: string
  canvasWidth: number
  canvasHeight: number
  gameplayState: GameplayState
  timestamp: number
  gameTime: number
  mouseDown: boolean
}

// If the clock time delta exceeds this value, we cap the game time delta
const MAX_CLOCK_TIME_DELTA_MS = 2.5 / 60 * 1000
// How fast is game time relative to clock time
const GAME_TIME_RATE = 6 / 1000

const BALL_RADIUS = 1.5
const BALL_Y = 75

const OSCILLATOR_S = 1
const OSCILLATOR_T = 1
const OSCILLATOR_G1 = 0.3
const OSCILLATOR_G2 = - 0.2

const SCROLL_V = 10
const SCORE_RATE = 10
const OBSTACLE_PERIOD = 10
const OBSTACLE_X_RANGE = 100

const GAME_RECT: Rect = {
  width: 160,
  height: 90,
}

const GAME_CENTER: Rect = {
  width: 80,
  height: 45,
}

const GAME_SAFE_RECT: Rect = {
  width: 144,
  height: 81,
}

const LEFT_WALL_POSRECT: PosRect = {
  x: 0,
  y: 0,
  width: 20,
  height: 90,
}

const RIGHT_WALL_POSRECT: PosRect = {
  x: 140,
  y: 0,
  width: 20,
  height: 90,
}

export const getInitState = (canvasId: string): GameState => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  canvas.width = canvas.scrollWidth
  canvas.height = canvas.scrollHeight
  return {
    canvasId,
    canvasWidth: canvas.scrollWidth,
    canvasHeight: canvas.scrollHeight,
    gameplayState: {
      tag: 'menu'
    },
    timestamp: 0,
    gameTime: 0,
    mouseDown: false,
  }
}

const getInitPlayingState = (): PlayingState => ({
  tag: 'playing',
  yOffset: 0,
  score: 0,
  ballState: {
    x: 30,
    v: 0,
  },
  obstacles: [],
})

function hasFatalCollision(state: GameState & {gameplayState: PlayingState}): boolean {
  // Detect collision with wall
  if ((state.gameplayState.ballState.x - BALL_RADIUS < LEFT_WALL_POSRECT.x + LEFT_WALL_POSRECT.width) ||
    (state.gameplayState.ballState.x + BALL_RADIUS > RIGHT_WALL_POSRECT.x)) {
    return true
  }
  // Detect collision with obstacles
  for (const ob of state.gameplayState.obstacles) {
    if (Math.hypot((state.gameplayState.ballState.x - ob.x), (BALL_Y - (state.gameplayState.yOffset + ob.y))) < BALL_RADIUS + ob.r) {
      return true
    }
  }
  return false
}

export function updateState(state: GameState, timestamp: number): void {
  let clockTimeDelta = timestamp - state.timestamp
  if (clockTimeDelta > MAX_CLOCK_TIME_DELTA_MS) {
    console.debug('Timing fault: ', clockTimeDelta)
    clockTimeDelta = MAX_CLOCK_TIME_DELTA_MS
  }
  
  const gameTimeDelta = clockTimeDelta * GAME_TIME_RATE
  state.timestamp = timestamp
  state.gameTime += gameTimeDelta
  if (state.gameplayState.tag === 'playing') {
    state.gameplayState.yOffset = SCROLL_V * state.gameTime
    state.gameplayState.score = Math.round(SCORE_RATE * state.gameTime)
    state.gameplayState.ballState = {
      x: state.gameplayState.ballState.x + OSCILLATOR_S * state.gameplayState.ballState.v * gameTimeDelta,
      v: state.gameplayState.ballState.v - OSCILLATOR_T * (state.gameplayState.ballState.x - GAME_CENTER.width) * gameTimeDelta - (state.mouseDown ? OSCILLATOR_G2 : OSCILLATOR_G1) * state.gameplayState.ballState.v * gameTimeDelta,
    }
    
    // Remove old obstacles
    state.gameplayState.obstacles = state.gameplayState.obstacles.filter(ob => {
      return (state.gameplayState as PlayingState).yOffset + ob.y - ob.r <= GAME_RECT.height
    })

    // Add new obstacles
    if (Math.random() * OBSTACLE_PERIOD < gameTimeDelta) {
      state.gameplayState.obstacles.push({
        x: 90 + OBSTACLE_X_RANGE * (Math.random() - 0.5),
        y: - state.gameplayState.yOffset - 50,
        r: 1 + 2 * Math.random(),
      })
    }

    if (hasFatalCollision(state as (GameState & {gameplayState: PlayingState}))) {
      state.gameplayState = {
        tag: 'menu',
        score: state.gameplayState.score
      }
      return
    }
  }
}

const getScaleFactor = (pixelRect: Rect, gameCoordinateRect: Rect, gameSafeCoordinateRect: Rect) => {
  const hs = pixelRect.height / gameCoordinateRect.height
  const hss = pixelRect.height / gameSafeCoordinateRect.height
  const ws = pixelRect.width / gameCoordinateRect.width
  const wss = pixelRect.width / gameSafeCoordinateRect.width
  const gws = Math.max(hs, ws)
  return Math.min(hss, wss, gws)
}

const getBallCoordinates = (state: GameState & {gameplayState: PlayingState}) => {
  return {
    x: state.gameplayState.ballState.x,
    y: BALL_Y,
  }
}

export function drawMenuState(state: GameState & {gameplayState: MenuState}) {
  const {canvasId, canvasWidth, canvasHeight} = state
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  const ctx = canvas.getContext('2d')!
  ctx.resetTransform()
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  ctx.fillStyle = '#5555ff'
  ctx.fill()
  ctx.textAlign = "center"
  ctx.font = "30px Arial"
  ctx.fillStyle = "#ffffff"
  ctx.fillText("OSCILLATOR", canvasWidth/2, canvasHeight/2)
  if (state.gameplayState.score) {
    ctx.textAlign = "center"
    ctx.font = "20px Arial"
    ctx.fillStyle = "#ffff66"
    ctx.fillText(formatScore(state.gameplayState.score), canvasWidth/2, canvasHeight/2 + 40)
  }
}

// For debugging
export function drawGameRect(state: GameState) {
  const {canvasId, canvasWidth, canvasHeight} = state
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  const ctx = canvas.getContext('2d')!
  ctx.resetTransform()
  ctx.translate(canvasWidth / 2, canvasHeight / 2)
  const scale = getScaleFactor(
    {width: canvasWidth, height: canvasHeight},
    GAME_RECT,
    GAME_SAFE_RECT,
  )
  ctx.scale(scale, scale)
  ctx.translate(-GAME_RECT.width / 2, -GAME_RECT.height/2)

  ctx.beginPath()
  ctx.fillStyle = '#ffff00'
  ctx.rect(0, 0, GAME_RECT.width, GAME_RECT.height)
  ctx.fill()

  ctx.beginPath()
  ctx.fillStyle = '#ff0000'
  ctx.rect((GAME_RECT.width - GAME_SAFE_RECT.width) / 2, (GAME_RECT.height - GAME_SAFE_RECT.height) / 2, GAME_SAFE_RECT.width, GAME_SAFE_RECT.height)
  ctx.fill()
}

const formatScore = (score: number): string => {
  const scoreString = score <= 99999 ? score.toFixed(0).toString() : '99999'
  const scoreZeroPadding = new Array(5 - scoreString.length + 1).join('0')
  return scoreZeroPadding + scoreString
}

export function drawPlayingState(state: GameState & {gameplayState: PlayingState}) {
  const {canvasId, canvasWidth, canvasHeight} = state
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  const ctx = canvas.getContext('2d')!
  ctx.resetTransform()
  
  // Black background
  ctx.beginPath()
  ctx.fillStyle = '#000000'
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  ctx.fill()

  // Set game coordinate transform
  ctx.translate(canvasWidth / 2, canvasHeight / 2)
  const scale = getScaleFactor(
    {width: canvasWidth, height: canvasHeight},
    GAME_RECT,
    GAME_SAFE_RECT,
  )
  ctx.scale(scale, scale)
  ctx.translate(-GAME_RECT.width / 2, -GAME_RECT.height/2)

  // Game background
  ctx.beginPath()
  ctx.rect(0, 0, GAME_RECT.width, GAME_RECT.height)
  ctx.fillStyle='#5555ff'
  ctx.fill()
  ctx.clip()

  // horizontal lines
  for (let y = state.gameplayState.yOffset % 20 - 20; y < GAME_RECT.height + 20; y += 20) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineWidth = 0.4
    // ctx.setLineDash([2, 6]);
    ctx.strokeStyle = '#3333ff'
    ctx.lineTo(GAME_RECT.width, y)
    ctx.stroke()
  }

  // Walls
  ctx.beginPath()
  ctx.rect(LEFT_WALL_POSRECT.x, LEFT_WALL_POSRECT.y, LEFT_WALL_POSRECT.width, LEFT_WALL_POSRECT.height)
  ctx.fillStyle='#ffffff'
  ctx.fill()
  
  ctx.beginPath()
  ctx.rect(RIGHT_WALL_POSRECT.x, RIGHT_WALL_POSRECT.y, RIGHT_WALL_POSRECT.width, RIGHT_WALL_POSRECT.height)
  ctx.fillStyle='#ffffff'
  ctx.fill()

  // Ball
  const bc = getBallCoordinates(state)
  ctx.beginPath()
  ctx.fillStyle = '#ff9999'
  ctx.ellipse(bc.x, bc.y, BALL_RADIUS, BALL_RADIUS, 0, 0, 2*Math.PI)
  ctx.fill()

  // Obstacles
  for(const ob of state.gameplayState.obstacles) {
    ctx.beginPath()
    ctx.fillStyle = '#ffffff'
    ctx.ellipse(ob.x, ob.y + state.gameplayState.yOffset, ob.r, ob.r, 0, 0, 2*Math.PI)
    ctx.fill()
  }

  // Score text
  ctx.beginPath()
  ctx.textAlign = "left"
  ctx.fillStyle = '#ffff66'
  ctx.font = "10px Arial"
  const scoreString = formatScore(state.gameplayState.score)
  ctx.fillText(scoreString, 25, 15)
}

const drawState = (state: GameState) => {
  if (state.gameplayState.tag === 'playing'){
    drawPlayingState(state as GameState & {gameplayState: PlayingState})
  } else if (state.gameplayState.tag === 'menu') {
    drawMenuState(state as GameState & {gameplayState: MenuState})
  }
}

const onMouseDown = (state: GameState) => {
  if (state.gameplayState.tag === 'menu') {
    state.gameTime = 0
    state.gameplayState = getInitPlayingState()
  }
  state.mouseDown = true
}

const onMouseUp = (state: GameState) => {
  state.mouseDown = false
}

const onResize = (state: GameState) => {
  const canvas = document.getElementById(state.canvasId) as HTMLCanvasElement
  canvas.width = canvas.scrollWidth
  canvas.height = canvas.scrollHeight
  state.canvasWidth = canvas.scrollWidth
  state.canvasHeight = canvas.scrollHeight
}

const setupListeners = (state: GameState) => {
  const canvas = document.getElementById(state.canvasId) as HTMLCanvasElement
  canvas.addEventListener('mousedown', () => onMouseDown(state))
  canvas.addEventListener('mouseup', () => onMouseUp(state))
  window.addEventListener('resize', () => onResize(state))
}

export const setupGame = (canvasId: string) => {
  const state: GameState = getInitState(canvasId)
  setupListeners(state)
  function refresh(timestamp: number){
    updateState(state, timestamp)
    drawState(state)
    window.requestAnimationFrame(refresh)
  }
  window.requestAnimationFrame(refresh);
}
