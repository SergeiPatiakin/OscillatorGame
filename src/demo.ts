import { drawState } from "./game"

export const doDemo = () => {
  drawState({
    canvasId: 'game-canvas',
    canvasWidth: 600,
    canvasHeight: 400,
    centerX: 300,
    centerY: 200,
    particles: [{
      x: 100,
      y: 100,
      r: 5,
      color: '#ff0000',
    }],
  })
}

doDemo()