const WHITE_THRESHOLD = 248;
const ALPHA_THRESHOLD = 16;
const EDGE_PADDING = 2;

function isContentPixel(r: number, g: number, b: number, a: number): boolean {
  if (a < ALPHA_THRESHOLD) return false;
  return r < WHITE_THRESHOLD || g < WHITE_THRESHOLD || b < WHITE_THRESHOLD;
}

function rowHasContent(
  data: Uint8ClampedArray,
  width: number,
  y: number,
): boolean {
  const rowStart = y * width * 4;
  for (let x = 0; x < width; x += 1) {
    const index = rowStart + x * 4;
    if (isContentPixel(data[index], data[index + 1], data[index + 2], data[index + 3])) {
      return true;
    }
  }
  return false;
}

export function cropCanvasWhitespace(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d');
  if (!context) return;

  const { width, height } = canvas;
  if (width === 0 || height === 0) return;

  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  let top = height;
  let bottom = 0;

  for (let y = 0; y < height; y += 1) {
    if (!rowHasContent(data, width, y)) continue;
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }

  if (top >= bottom) return;

  const cropTop = Math.max(0, top - EDGE_PADDING);
  const cropBottom = Math.min(height - 1, bottom + EDGE_PADDING);
  const cropHeight = cropBottom - cropTop + 1;

  const cropped = context.getImageData(0, cropTop, width, cropHeight);
  canvas.width = width;
  canvas.height = cropHeight;
  context.putImageData(cropped, 0, 0);
}
