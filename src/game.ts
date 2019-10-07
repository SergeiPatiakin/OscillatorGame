
interface Rect {
  width: number
  height: number
}

interface MenuState {
  tag: 'menu'
  score?: number
}

interface PlayingState {
  tag: 'playing',
  ballState: {
    x: number
    v: number
  }
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

const MAX_TIME_DELTA = 0.1 // seconds
const BALL_RADIUS = 1.5

const OSCILLATOR_S = 1
const OSCILLATOR_T = 1
const OSCILLATOR_G1 = 0.3
const OSCILLATOR_G2 = - 0.2

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
  ballState: {
    x: 0.1,
    v: 0,
  }
})

export function updateState(state: GameState, timestamp: number): void {
  const gameTimeDelta = Math.min(MAX_TIME_DELTA, timestamp - state.timestamp)
  state.timestamp = timestamp
  state.gameTime += gameTimeDelta
  if (state.gameplayState.tag === 'menu' && state.mouseDown) {
    state.gameplayState = getInitPlayingState()
  }
  if (state.gameplayState.tag === 'playing') {
    state.gameplayState.ballState = {
      x: state.gameplayState.ballState.x + OSCILLATOR_S * state.gameplayState.ballState.v * gameTimeDelta,
      v: state.gameplayState.ballState.v - OSCILLATOR_T * state.gameplayState.ballState.x * gameTimeDelta - (state.mouseDown ? OSCILLATOR_G2 : OSCILLATOR_G1) * state.gameplayState.ballState.v * gameTimeDelta,
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
    x: GAME_CENTER.width * (1 + state.gameplayState.ballState.x),
    y: 75,
  }
}

export function drawMenuState(state: GameState & {gameplayState: MenuState}) {
  const {canvasId, canvasWidth, canvasHeight} = state
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  const ctx = canvas.getContext('2d')!
  ctx.resetTransform()
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  ctx.fillStyle = '#9999ff'
  ctx.fill()
  ctx.textAlign = "center"
  ctx.font = "30px Arial"
  ctx.fillStyle = "#ffffff"
  ctx.fillText("OSCILLATOR", canvasWidth/2, canvasHeight/2)
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
  ctx.fillStyle='#ffffff'
  ctx.fill()
  ctx.clip()


  // draw stage
  ctx.beginPath()
  ctx.ellipse(GAME_CENTER.width, GAME_CENTER.height, 100, 100, 0, 0, 2*Math.PI)
  ctx.lineWidth = 1
  ctx.strokeStyle = '#eeeeee'
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(GAME_CENTER.width, GAME_CENTER.height, 60, 60, 0, 0, 2*Math.PI)
  ctx.lineWidth = 1
  ctx.strokeStyle = '#eeeeee'
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(GAME_CENTER.width, GAME_CENTER.height, 30, 30, 0, 0, 2*Math.PI)
  ctx.lineWidth = 1
  ctx.strokeStyle = state.mouseDown ? '#0000ff' : '#00ff00'
  ctx.stroke()

  const bc = getBallCoordinates(state)
  ctx.beginPath()
  ctx.fillStyle = '#ff0000'
  ctx.ellipse(bc.x, bc.y, BALL_RADIUS, BALL_RADIUS, 0, 0, 2*Math.PI)
  ctx.fill()
}

const drawState = (state: GameState) => {
  if (state.gameplayState.tag === 'playing'){
    drawPlayingState(state as GameState & {gameplayState: PlayingState})
  } else if (state.gameplayState.tag === 'menu') {
    drawMenuState(state as GameState & {gameplayState: MenuState})
  }
}

const onMouseDown = (state: GameState) => {
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