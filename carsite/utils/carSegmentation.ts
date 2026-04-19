export interface SegmentationResult {
  cutoutSrc: string;
  maskSrc: string;
}

interface MaskStats {
  coverage: number;
  solidCoverage: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load uploaded image."));
    img.src = src;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to decode segmented image."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
}

async function buildMaskFromCutout(cutoutSrc: string): Promise<{ maskSrc: string; stats: MaskStats }> {
  const img = await loadImage(cutoutSrc);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Mask context unavailable.");
  }

  ctx.drawImage(img, 0, 0);
  const frame = ctx.getImageData(0, 0, img.width, img.height);
  const pixels = img.width * img.height;
  let alphaPx = 0;
  let solidPx = 0;

  const maskData = ctx.createImageData(img.width, img.height);
  for (let i = 0; i < pixels; i += 1) {
    const di = i * 4;
    const a = frame.data[di + 3];
    if (a > 14) {
      alphaPx += 1;
    }
    if (a > 180) {
      solidPx += 1;
    }

    maskData.data[di] = 255;
    maskData.data[di + 1] = 255;
    maskData.data[di + 2] = 255;
    maskData.data[di + 3] = a;
  }

  ctx.clearRect(0, 0, img.width, img.height);
  ctx.putImageData(maskData, 0, 0);

  return {
    maskSrc: canvas.toDataURL("image/png"),
    stats: {
      coverage: alphaPx / pixels,
      solidCoverage: solidPx / pixels,
    },
  };
}

function isMaskHealthy(stats: MaskStats): boolean {
  return stats.coverage > 0.18 && stats.coverage < 0.94 && stats.solidCoverage > 0.06;
}

function dilate(mask: Uint8Array, width: number, height: number): Uint8Array {
  const out = new Uint8Array(mask.length);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let hit = 0;
      for (let ky = -1; ky <= 1 && !hit; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          if (mask[(y + ky) * width + (x + kx)] === 1) {
            hit = 1;
            break;
          }
        }
      }
      out[y * width + x] = hit;
    }
  }
  return out;
}

function erode(mask: Uint8Array, width: number, height: number): Uint8Array {
  const out = new Uint8Array(mask.length);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let keep = 1;
      for (let ky = -1; ky <= 1 && keep; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          if (mask[(y + ky) * width + (x + kx)] === 0) {
            keep = 0;
            break;
          }
        }
      }
      out[y * width + x] = keep;
    }
  }
  return out;
}

function blurAlpha(alpha: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray {
  const tmp = new Uint8ClampedArray(alpha.length);
  const out = new Uint8ClampedArray(alpha.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let count = 0;
      for (let k = -radius; k <= radius; k += 1) {
        const nx = x + k;
        if (nx >= 0 && nx < width) {
          sum += alpha[y * width + nx];
          count += 1;
        }
      }
      tmp[y * width + x] = Math.round(sum / count);
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let count = 0;
      for (let k = -radius; k <= radius; k += 1) {
        const ny = y + k;
        if (ny >= 0 && ny < height) {
          sum += tmp[ny * width + x];
          count += 1;
        }
      }
      out[y * width + x] = Math.round(sum / count);
    }
  }

  return out;
}

function keepLargestCentralComponent(mask: Uint8Array, width: number, height: number): Uint8Array {
  const visited = new Uint8Array(mask.length);
  const keep = new Uint8Array(mask.length);

  const qx = new Int32Array(mask.length);
  const qy = new Int32Array(mask.length);

  let bestScore = -1;
  let bestPixels: number[] = [];

  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      if (mask[idx] === 0 || visited[idx] === 1) {
        continue;
      }

      let head = 0;
      let tail = 0;
      qx[tail] = x;
      qy[tail] = y;
      tail += 1;
      visited[idx] = 1;

      let area = 0;
      let sx = 0;
      let sy = 0;
      const pixels: number[] = [];

      while (head < tail) {
        const px = qx[head];
        const py = qy[head];
        head += 1;

        const pIdx = py * width + px;
        pixels.push(pIdx);
        area += 1;
        sx += px;
        sy += py;

        const neighbors = [
          [px + 1, py],
          [px - 1, py],
          [px, py + 1],
          [px, py - 1],
        ];

        for (let i = 0; i < neighbors.length; i += 1) {
          const nx = neighbors[i][0];
          const ny = neighbors[i][1];
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
            continue;
          }
          const nIdx = ny * width + nx;
          if (mask[nIdx] === 1 && visited[nIdx] === 0) {
            visited[nIdx] = 1;
            qx[tail] = nx;
            qy[tail] = ny;
            tail += 1;
          }
        }
      }

      const mcx = sx / area;
      const mcy = sy / area;
      const centerDist = Math.hypot((mcx - cx) / width, (mcy - cy) / height);
      const score = area * (1 - Math.min(0.8, centerDist));

      if (score > bestScore) {
        bestScore = score;
        bestPixels = pixels;
      }
    }
  }

  for (let i = 0; i < bestPixels.length; i += 1) {
    keep[bestPixels[i]] = 1;
  }
  return keep;
}

async function heuristicIsolateCarFromPhoto(imageSrc: string): Promise<SegmentationResult> {
  const img = await loadImage(imageSrc);

  const maxDimension = 1200;
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const width = Math.max(1, Math.floor(img.width * scale));
  const height = Math.max(1, Math.floor(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("2D context unavailable.");
  }

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const pixelCount = width * height;

  let borderR = 0;
  let borderG = 0;
  let borderB = 0;
  let borderCount = 0;

  // Improved background sampling: use corners which are most likely to be true background
  const corners = [
    (0 * width + 0) * 4,
    (0 * width + (width - 1)) * 4,
    ((height - 1) * width + 0) * 4,
    ((height - 1) * width + (width - 1)) * 4
  ];
  let bgR = 0, bgG = 0, bgB = 0;
  corners.forEach(idx => {
    bgR += data[idx]; bgG += data[idx+1]; bgB += data[idx+2];
  });
  bgR /= 4; bgG /= 4; bgB /= 4;

  const score = new Float32Array(pixelCount);
  const histogram = new Uint32Array(256);

  const cx = width / 2;
  const cy = height * 0.54; // Focus slightly higher to avoid ground
  const rx = width * 0.42;
  const ry = height * 0.38;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      const di = idx * 4;

      const r = data[di];
      const g = data[di + 1];
      const b = data[di + 2];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

      const dr = r - bgR;
      const dg = g - bgG;
      const db = b - bgB;
      const bgDist = Math.min(1, Math.sqrt(dr * dr + dg * dg + db * db) / (Math.sqrt(3) * 255));

      // Calculate vertical gradient for ground penalty
      const yn = y / height;
      const groundPenalty = yn > 0.72 ? Math.pow(1 - (yn - 0.72) / 0.28, 2) : 1;

      const x0 = Math.max(0, x - 1);
      const x1 = Math.min(width - 1, x + 1);
      const y0 = Math.max(0, y - 1);
      const y1 = Math.min(height - 1, y + 1);
      const lumL = (0.2126 * data[(y * width + x0) * 4] + 0.7152 * data[(y * width + x0) * 4 + 1] + 0.0722 * data[(y * width + x0) * 4 + 2]);
      const lumR = (0.2126 * data[(y * width + x1) * 4] + 0.7152 * data[(y * width + x1) * 4 + 1] + 0.0722 * data[(y * width + x1) * 4 + 2]);
      const lumU = (0.2126 * data[(y0 * width + x) * 4] + 0.7152 * data[(y0 * width + x) * 4 + 1] + 0.0722 * data[(y0 * width + x) * 4 + 2]);
      const lumD = (0.2126 * data[(y1 * width + x) * 4] + 0.7152 * data[(y1 * width + x) * 4 + 1] + 0.0722 * data[(y1 * width + x) * 4 + 2]);
      const edge = Math.min(1, (Math.abs(lumR - lumL) + Math.abs(lumD - lumU)) / 255);

      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const centerBias = Math.max(0, 1 - Math.sqrt(nx * nx + ny * ny));

      // Heuristic score: prioritizes center, color difference from background, and moderate saturation
      let s = bgDist * 0.5 + centerBias * 0.3 + edge * 0.1 + sat * 0.1;
      s *= groundPenalty;

      if (luma > 0.98 || luma < 0.02) s *= 0.5;

      score[idx] = s;
      histogram[Math.max(0, Math.min(255, Math.floor(s * 255)))] += 1;
    }
  }

  // Refined thresholding logic
  const targetBgRatio = 0.74; // Assume 74% background/noise
  const targetIndex = Math.floor(pixelCount * targetBgRatio);
  let cumulative = 0;
  let thresholdBin = 128;
  for (let i = 0; i < 256; i += 1) {
    cumulative += histogram[i];
    if (cumulative >= targetIndex) {
      thresholdBin = i;
      break;
    }
  }
  const threshold = Math.max(0.32, Math.min(0.68, thresholdBin / 255));

  const baseMask = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i += 1) {
    baseMask[i] = score[i] > threshold ? 1 : 0;
  }

  // More aggressive noise cleanup with erosion/dilation
  const erodedMaskA = erode(baseMask, width, height);
  const dilatedMaskA = dilate(erodedMaskA, width, height);
  const dilatedMaskB = dilate(dilatedMaskA, width, height);
  const erodedMaskB = erode(dilatedMaskB, width, height);
  const centralMask = keepLargestCentralComponent(erodedMaskB, width, height);
  const finalMask = dilate(centralMask, width, height);

  const alpha = new Uint8ClampedArray(pixelCount);
  for (let i = 0; i < pixelCount; i += 1) {
    alpha[i] = finalMask[i] === 1 ? 255 : 0;
  }

  const softAlpha = blurAlpha(alpha, width, height, 3); // Slightly more blur for smoother edges

  const cutoutCanvas = document.createElement("canvas");
  cutoutCanvas.width = width;
  cutoutCanvas.height = height;
  const cutoutCtx = cutoutCanvas.getContext("2d", { willReadFrequently: true });
  if (!cutoutCtx) {
    throw new Error("Cutout context unavailable.");
  }
  const cutoutData = cutoutCtx.createImageData(width, height);
  for (let i = 0; i < pixelCount; i += 1) {
    const di = i * 4;
    cutoutData.data[di] = data[di];
    cutoutData.data[di + 1] = data[di + 1];
    cutoutData.data[di + 2] = data[di + 2];
    cutoutData.data[di + 3] = softAlpha[i];
  }
  cutoutCtx.putImageData(cutoutData, 0, 0);

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
  if (!maskCtx) {
    throw new Error("Mask context unavailable.");
  }
  const maskData = maskCtx.createImageData(width, height);
  for (let i = 0; i < pixelCount; i += 1) {
    const di = i * 4;
    maskData.data[di] = 255;
    maskData.data[di + 1] = 255;
    maskData.data[di + 2] = 255;
    maskData.data[di + 3] = softAlpha[i];
  }
  maskCtx.putImageData(maskData, 0, 0);

  return {
    cutoutSrc: cutoutCanvas.toDataURL("image/png"),
    maskSrc: maskCanvas.toDataURL("image/png"),
  };
}

export async function isolateCarFromPhoto(imageSrc: string): Promise<SegmentationResult> {
  const heuristicResult = await heuristicIsolateCarFromPhoto(imageSrc);
  const { stats } = await buildMaskFromCutout(heuristicResult.cutoutSrc);
  if (isMaskHealthy(stats)) {
    return heuristicResult;
  }

  // Safe fallback keeps image visible if extraction quality is poor.
  const img = await loadImage(imageSrc);
  const fallbackCanvas = document.createElement("canvas");
  fallbackCanvas.width = img.width;
  fallbackCanvas.height = img.height;
  const fallbackCtx = fallbackCanvas.getContext("2d");
  if (!fallbackCtx) {
    return { cutoutSrc: imageSrc, maskSrc: imageSrc };
  }

  const cx = img.width * 0.5;
  const cy = img.height * 0.57;
  const rx = img.width * 0.36;
  const ry = img.height * 0.28;
  fallbackCtx.fillStyle = "rgba(0,0,0,0)";
  fallbackCtx.fillRect(0, 0, img.width, img.height);
  fallbackCtx.fillStyle = "rgba(255,255,255,0.86)";
  fallbackCtx.beginPath();
  fallbackCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  fallbackCtx.fill();

  return {
    cutoutSrc: imageSrc,
    maskSrc: fallbackCanvas.toDataURL("image/png"),
  };
}