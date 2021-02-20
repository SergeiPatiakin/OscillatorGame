export type ImageResources = {
  rrh: HTMLImageElement
  shroom: HTMLImageElement
}

const loadImage = async (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image()
  img.src = url
  img.onload = () => {
    resolve(img)
  }
  img.onerror = e => console.error(e)
})

export const loadImageResources = async () => {
  const rrh = await loadImage('./images/rrh.png')
  const shroom = await loadImage('./images/shroom.png')
  return {rrh, shroom}
}
