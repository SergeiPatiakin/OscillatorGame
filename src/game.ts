const MAX_TIME_DELTA = 0.1 // seconds
const RADIUS = 5

interface GameState {
  canvasId: string
  canvasWidth: number
  canvasHeight: number
  centerX: number
  centerY: number
  particles: Array<{x: number, y: number, r: number, color: string}>
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
    particles: [{
      x: canvas.scrollWidth / 2 + 100,
      y: canvas.scrollHeight / 2,
      r: RADIUS,
      color: '#ff0000',
    }],
    timestamp: 0,
    gameTime: 0,
    mouseDown: false,
  }
}

export function updateState(state: GameState, timestamp: number): void {
  const gameTimeDelta = Math.min(MAX_TIME_DELTA, timestamp - state.timestamp)
  state.timestamp = timestamp
  state.gameTime += gameTimeDelta
  state.particles = [{
    x: state.centerX + 100 * Math.cos(state.gameTime),
    y: state.centerY + 100 * Math.sin(state.gameTime),
    r: RADIUS,
    color: '#ff0000',
  }]
}

export function drawState(state: GameState) {
  const {canvasId, canvasWidth, canvasHeight, centerX, centerY, particles} = state
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
  ctx.strokeStyle = state.mouseDown ? '#eeeeee' : '#00ff00'
  ctx.stroke()

  particles.forEach(p => {
      ctx.beginPath()
      ctx.fillStyle = p.color
      ctx.ellipse(p.x, p.y, p.r, p.r, 0, 0, 2*Math.PI)
      ctx.fill()
  });
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