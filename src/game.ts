interface GameState {
  canvasId: string
  canvasWidth: number
  canvasHeight: number
  centerX: number
  centerY: number
  particles: Array<{x: number, y: number, r: number, color: string}>
}

export function drawState(state: GameState) {
  const {canvasId, canvasWidth, canvasHeight, centerX, centerY, particles} = state
  var canvas = document.getElementById(canvasId) as HTMLCanvasElement
  var ctx = canvas.getContext('2d')!
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
  ctx.strokeStyle = '#eeeeee'
  ctx.stroke()

  particles.forEach(p => {
      ctx.beginPath()
      ctx.fillStyle = p.color
      ctx.ellipse(p.x, p.y, p.r, p.r, 0, 0, 2*Math.PI)
      ctx.fill()
  });
}