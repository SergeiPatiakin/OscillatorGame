const MAX_TIME_DELTA = 0.1 // seconds
const BALL_RADIUS = 5
const BALL_Y = 200

const OSCILLATOR_S = 1
const OSCILLATOR_T = 1
const OSCILLATOR_G1 = 0.3
const OSCILLATOR_G2 = - 0.2

interface GameState {
  canvasId: string
  canvasWidth: number
  canvasHeight: number
  centerX: number
  centerY: number
  ballState: {
    x: number
    v: number
  }
  //particles: Array<{x: number, y: number, r: number, color: string}>
  timestamp: number
  gameTime: number
  mouseDown: boolean
}

export const getInitState = (canvasId: string): GameState => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  canvas.width = canvas.scrollWidth
  canvas.height = canvas.scrollHeight
  return {
    canvasId,
    canvasWidth: canvas.scrollWidth,
    canvasHeight: canvas.scrollHeight,
    centerX: canvas.scrollWidth / 2,
    centerY: canvas.scrollHeight / 2,
    ballState: {
      x: 0.1,
      v: 0,
    },
    timestamp: 0,
    gameTime: 0,
    mouseDown: false,
  }
}

export function updateState(state: GameState, timestamp: number): void {
  const gameTimeDelta = Math.min(MAX_TIME_DELTA, timestamp - state.timestamp)
  state.timestamp = timestamp
  state.gameTime += gameTimeDelta
  state.ballState = {
    x: state.ballState.x + OSCILLATOR_S * state.ballState.v * gameTimeDelta,
    v: state.ballState.v - OSCILLATOR_T * state.ballState.x * gameTimeDelta - (state.mouseDown ? OSCILLATOR_G2 : OSCILLATOR_G1) * state.ballState.v * gameTimeDelta,
  }
  // state.particles = [{
  //   x: state.centerX + 100 * Math.cos(state.gameTime),
  //   y: state.centerY + 100 * Math.sin(state.gameTime),
  //   r: RADIUS,
  //   color: '#ff0000',
  // }]
}

const getBallCoordinates = (state: GameState) => {
  return {
    x: state.centerX + state.canvasWidth / 2 * state.ballState.x,
    y: state.canvasHeight * 0.75,
  }
}

export function drawState(state: GameState) {
  const {canvasId, canvasWidth, canvasHeight, centerX, centerY} = state
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // draw stage
  ctx.beginPath()
  ctx.ellipse(centerX, centerY, 100, 100, 0, 0, 2*Math.PI)
  ctx.lineWidth = 1
  ctx.strokeStyle = '#eeeeee'
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(centerX, centerY, 60, 60, 0, 0, 2*Math.PI)
  ctx.lineWidth = 1
  ctx.strokeStyle = '#eeeeee'
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(centerX, centerY, 30, 30, 0, 0, 2*Math.PI)
  ctx.lineWidth = 1
  ctx.strokeStyle = state.mouseDown ? '#0000ff' : '#00ff00'
  ctx.stroke()

  const bc = getBallCoordinates(state)
  ctx.beginPath()
  ctx.fillStyle = '#ff0000'
  ctx.ellipse(bc.x, bc.y, BALL_RADIUS, BALL_RADIUS, 0, 0, 2*Math.PI)
  ctx.fill()


  // particles.forEach(p => {
  //     ctx.beginPath()
  //     ctx.fillStyle = p.color
  //     ctx.ellipse(p.x, p.y, p.r, p.r, 0, 0, 2*Math.PI)
  //     ctx.fill()
  // });
}

const onMouseDown = (state: GameState) => {
  state.mouseDown = true
}

const onMouseUp = (state: GameState) => {
  state.mouseDown = false
}

const onResize = (state: GameState) => {
  console.log('onResize')
  const canvas = document.getElementById(state.canvasId) as HTMLCanvasElement
  canvas.width = canvas.scrollWidth
  canvas.height = canvas.scrollHeight
  state.canvasWidth = canvas.scrollWidth
  state.canvasHeight = canvas.scrollHeight
  state.centerX = canvas.scrollWidth / 2
  state.centerY = canvas.scrollHeight / 2
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