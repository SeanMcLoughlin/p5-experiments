let alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
var fxhash =
  'oo' +
  Array(49)
    .fill(0)
    .map((_) => alphabet[(Math.random() * alphabet.length) | 0])
    .join('')
let b58dec = (str) =>
  [...str].reduce((p, c) => (p * alphabet.length + alphabet.indexOf(c)) | 0, 0)
let fxhashTrunc = fxhash.slice(2)
let regex = new RegExp('.{' + ((fxhashTrunc.length / 4) | 0) + '}', 'g')
let hashes = fxhashTrunc.match(regex).map((h) => b58dec(h))
let sfc32 = (a, b, c, d) => {
  return () => {
    a |= 0
    b |= 0
    c |= 0
    d |= 0
    var t = (((a + b) | 0) + d) | 0
    d = (d + 1) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}
let fxrand = sfc32(...hashes)

// Pattern types from the historical plates
const PATTERN_TYPES = {
  GREEK_KEY: 0,
  CUBE_HEXAGON: 1,
  CHEVRON: 2,
  TETRAHEDRON: 3,
}

// Configuration
let patternType
let colorScheme
let borderComplexity
let scale
let rotation
let hasTexture

function setup() {
  createCanvas(windowWidth, windowHeight)
  noLoop()

  // Determine pattern configuration from hash
  patternType = Math.floor(fxrand() * 4)
  colorScheme = Math.floor(fxrand() * 5)
  borderComplexity = Math.floor(fxrand() * 3) + 1
  scale = fxrand() * 0.5 + 0.5
  rotation = fxrand() < 0.3 ? fxrand() * TWO_PI : 0
  hasTexture = fxrand() < 0.4

  // Set features for fxhash
  window.$fxhashFeatures = {
    Pattern: Object.keys(PATTERN_TYPES)[patternType],
    'Color Scheme': [
      'Sepia',
      'Black & White',
      'Blue Delft',
      'Red Clay',
      'Verdigris',
    ][colorScheme],
    'Border Complexity': borderComplexity,
    Scale: scale.toFixed(2),
    Rotation: rotation > 0 ? 'Yes' : 'No',
    Texture: hasTexture ? 'Yes' : 'No',
  }
}

function draw() {
  // Color schemes inspired by historical prints
  const schemes = [
    { bg: '#f4f1e8', fg: '#3e3830', accent: '#8b7355' }, // Sepia
    { bg: '#ffffff', fg: '#000000', accent: '#666666' }, // B&W
    { bg: '#e8f0f4', fg: '#1e3a5f', accent: '#4682b4' }, // Blue Delft
    { bg: '#f9f5f0', fg: '#8b4513', accent: '#cd853f' }, // Red Clay
    { bg: '#f0f4ec', fg: '#2f4f4f', accent: '#8fbc8f' }, // Verdigris
  ]

  const colors = schemes[colorScheme]
  background(colors.bg)

  push()
  translate(width / 2, height / 2)
  rotate(rotation)
  translate(-width / 2, -height / 2)

  // Draw main pattern area
  const margin = 80
  const innerWidth = width - margin * 2
  const innerHeight = height - margin * 2

  // Draw border
  drawBorder(margin, colors, borderComplexity)

  // Draw central pattern
  push()
  translate(margin, margin)
  clip(() => {
    rect(0, 0, innerWidth, innerHeight)
  })

  if (hasTexture) {
    addTexture(0, 0, innerWidth, innerHeight, colors.fg, 0.05)
  }

  switch (patternType) {
    case PATTERN_TYPES.GREEK_KEY:
      drawGreekKeyPattern(innerWidth, innerHeight, colors)
      break
    case PATTERN_TYPES.CUBE_HEXAGON:
      drawCubePattern(innerWidth, innerHeight, colors)
      break
    case PATTERN_TYPES.CHEVRON:
      drawChevronPattern(innerWidth, innerHeight, colors)
      break
    case PATTERN_TYPES.TETRAHEDRON:
      drawTetrahedronPattern(innerWidth, innerHeight, colors)
      break
  }
  pop()

  // Add corner ornaments
  drawCornerOrnaments(margin, colors)

  pop()
}

function drawBorder(margin, colors, complexity) {
  strokeWeight(2)
  stroke(colors.fg)
  noFill()

  // Outer border
  rect(margin / 2, margin / 2, width - margin, height - margin)

  // Greek key border
  if (complexity >= 1) {
    drawGreekKeyBorder(margin, colors)
  }

  // Additional decorative lines
  if (complexity >= 2) {
    strokeWeight(1)
    rect(
      margin * 0.7,
      margin * 0.7,
      width - margin * 1.4,
      height - margin * 1.4
    )
    rect(
      margin * 1.3,
      margin * 1.3,
      width - margin * 2.6,
      height - margin * 2.6
    )
  }
}

function drawGreekKeyBorder(margin, colors) {
  const keySize = 20 * scale
  const offset = margin * 0.75

  stroke(colors.fg)
  strokeWeight(2)
  noFill()

  // Top border
  for (let x = offset; x < width - offset; x += keySize * 2) {
    drawGreekKeyUnit(x, offset, keySize, 0)
  }

  // Bottom border
  for (let x = offset; x < width - offset; x += keySize * 2) {
    drawGreekKeyUnit(x, height - offset, keySize, PI)
  }

  // Left border
  for (
    let y = offset + keySize * 2;
    y < height - offset - keySize * 2;
    y += keySize * 2
  ) {
    drawGreekKeyUnit(offset, y, keySize, -PI / 2)
  }

  // Right border
  for (
    let y = offset + keySize * 2;
    y < height - offset - keySize * 2;
    y += keySize * 2
  ) {
    drawGreekKeyUnit(width - offset, y, keySize, PI / 2)
  }
}

function drawGreekKeyUnit(x, y, size, rotation) {
  push()
  translate(x, y)
  rotate(rotation)

  beginShape()
  vertex(0, 0)
  vertex(size, 0)
  vertex(size, -size / 2)
  vertex(size / 2, -size / 2)
  vertex(size / 2, size / 2)
  vertex(size * 1.5, size / 2)
  vertex(size * 1.5, -size)
  vertex(0, -size)
  endShape()

  pop()
}

function drawGreekKeyPattern(w, h, colors) {
  const unitSize = 40 * scale
  stroke(colors.fg)
  strokeWeight(3)
  noFill()

  for (let y = 0; y < h; y += unitSize * 2) {
    for (let x = 0; x < w; x += unitSize * 4) {
      // Interlocking spiral pattern
      beginShape()
      vertex(x, y)
      vertex(x + unitSize * 2, y)
      vertex(x + unitSize * 2, y + unitSize)
      vertex(x + unitSize, y + unitSize)
      vertex(x + unitSize, y + unitSize / 2)
      vertex(x + unitSize * 1.5, y + unitSize / 2)
      vertex(x + unitSize * 1.5, y + unitSize * 1.5)
      vertex(x, y + unitSize * 1.5)
      endShape()

      // Mirror pattern
      push()
      translate(x + unitSize * 4, y + unitSize * 2)
      rotate(PI)
      beginShape()
      vertex(0, 0)
      vertex(unitSize * 2, 0)
      vertex(unitSize * 2, unitSize)
      vertex(unitSize, unitSize)
      vertex(unitSize, unitSize / 2)
      vertex(unitSize * 1.5, unitSize / 2)
      vertex(unitSize * 1.5, unitSize * 1.5)
      vertex(0, unitSize * 1.5)
      endShape()
      pop()
    }
  }
}

function drawCubePattern(w, h, colors) {
  const cubeSize = 35 * scale
  noStroke()

  for (let y = -cubeSize; y < h + cubeSize; y += cubeSize * 1.5) {
    for (let x = -cubeSize; x < w + cubeSize; x += cubeSize * Math.sqrt(3)) {
      const offset =
        ((y / (cubeSize * 1.5)) % 2) * ((cubeSize * Math.sqrt(3)) / 2)
      drawIsometricCube(x + offset, y, cubeSize, colors)
    }
  }
}

function drawIsometricCube(x, y, size, colors) {
  // Top face
  fill(colors.bg)
  beginShape()
  vertex(x, y)
  vertex(x + size * Math.cos(PI / 6), y + size * Math.sin(PI / 6))
  vertex(x, y + size)
  vertex(x - size * Math.cos(PI / 6), y + size * Math.sin(PI / 6))
  endShape(CLOSE)

  // Left face
  fill(colors.accent)
  beginShape()
  vertex(x - size * Math.cos(PI / 6), y + size * Math.sin(PI / 6))
  vertex(x, y + size)
  vertex(x, y + size * 1.5)
  vertex(x - size * Math.cos(PI / 6), y + size)
  endShape(CLOSE)

  // Right face
  fill(colors.fg)
  beginShape()
  vertex(x, y + size)
  vertex(x + size * Math.cos(PI / 6), y + size * Math.sin(PI / 6))
  vertex(x + size * Math.cos(PI / 6), y + size)
  vertex(x, y + size * 1.5)
  endShape(CLOSE)

  // Add stippling effect
  if (hasTexture) {
    stroke(colors.fg)
    strokeWeight(1)
    for (let i = 0; i < 20; i++) {
      if (fxrand() < 0.3) {
        const px = x + (fxrand() - 0.5) * size
        const py = y + fxrand() * size * 1.5
        point(px, py)
      }
    }
    noStroke()
  }
}

function drawChevronPattern(w, h, colors) {
  const chevronWidth = 30 * scale
  const chevronHeight = 40 * scale

  strokeWeight(4)
  noFill()

  for (let y = 0; y < h; y += chevronHeight) {
    for (let x = 0; x < w; x += chevronWidth) {
      // Alternating colors
      stroke(
        (x / chevronWidth + y / chevronHeight) % 2 === 0
          ? colors.fg
          : colors.accent
      )

      beginShape()
      vertex(x, y + chevronHeight / 2)
      vertex(x + chevronWidth / 2, y)
      vertex(x + chevronWidth, y + chevronHeight / 2)
      endShape()

      beginShape()
      vertex(x, y + chevronHeight)
      vertex(x + chevronWidth / 2, y + chevronHeight / 2)
      vertex(x + chevronWidth, y + chevronHeight)
      endShape()
    }
  }
}

function drawTetrahedronPattern(w, h, colors) {
  const triangleSize = 45 * scale

  for (let y = 0; y < h; y += triangleSize * 0.866) {
    for (let x = 0; x < w; x += triangleSize) {
      const offset = ((y / (triangleSize * 0.866)) % 2) * (triangleSize / 2)
      draw3DTriangle(x + offset, y, triangleSize, colors)
    }
  }
}

function draw3DTriangle(x, y, size, colors) {
  const h = size * 0.866

  // Draw three faces of a pyramid
  noStroke()

  // Face 1
  fill(colors.fg)
  triangle(x + size / 2, y, x, y + h, x + size / 3, y + h / 2)

  // Face 2
  fill(colors.accent)
  triangle(
    x + size / 2,
    y,
    x + size / 3,
    y + h / 2,
    x + (size * 2) / 3,
    y + h / 2
  )

  // Face 3
  fill(colors.bg)
  stroke(colors.fg)
  strokeWeight(1)
  triangle(x + size / 2, y, x + (size * 2) / 3, y + h / 2, x + size, y + h)

  noStroke()
}

function drawCornerOrnaments(margin, colors) {
  const ornamentSize = 30 * scale
  fill(colors.fg)
  noStroke()

  // Top-left
  drawRosette(margin, margin, ornamentSize)

  // Top-right
  drawRosette(width - margin, margin, ornamentSize)

  // Bottom-left
  drawRosette(margin, height - margin, ornamentSize)

  // Bottom-right
  drawRosette(width - margin, height - margin, ornamentSize)
}

function drawRosette(x, y, size) {
  push()
  translate(x, y)

  // Simple flower rosette
  for (let i = 0; i < 8; i++) {
    rotate(TWO_PI / 8)
    ellipse(size / 3, 0, size / 3, size / 6)
  }

  fill(255)
  circle(0, 0, size / 4)
  pop()
}

function addTexture(x, y, w, h, color, density) {
  stroke(color)
  strokeWeight(0.5)

  for (let i = 0; i < w * h * density; i++) {
    const px = x + fxrand() * w
    const py = y + fxrand() * h
    point(px, py)
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  redraw()
}
