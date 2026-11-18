import { useState, useRef, useEffect, useCallback } from 'react'
import { useFest } from '../context/festcontext'

export default function PhotoStudioPage() {
  const { frames, settings } = useFest()
  const canvasRef = useRef(null)

  const [userImage, setUserImage] = useState(null)
  const [frameImage, setFrameImage] = useState(null)
  const [selectedFrameId, setSelectedFrameId] = useState('builtin-gold')

  // Transform controls
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Load selected admin PNG frame (if not using built-in frame)
  useEffect(() => {
    if (selectedFrameId.startsWith('builtin-')) {
      setFrameImage(null)
      return
    }
    const chosen = frames.find((f) => f.id === selectedFrameId)
    if (!chosen) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setFrameImage(img)
    img.onerror = () => setFrameImage(null)
    img.src = chosen.frame_url
  }, [selectedFrameId, frames])

  // Handle local student photo selection (runs 100% in browser memory)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setUserImage(img)
        setScale(1)
        setOffsetX(0)
        setOffsetY(0)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  // Draw composite onto 1080x1080 Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = 1080

    ctx.clearRect(0, 0, size, size)

    // 1. Background
    ctx.fillStyle = '#171027'
    ctx.fillRect(0, 0, size, size)

    // 2. Student Uploaded Photo
    if (userImage) {
      const aspect = userImage.width / userImage.height
      let drawW = size * scale
      let drawH = size * scale
      if (aspect > 1) {
        drawW = drawH * aspect
      } else {
        drawH = drawW / aspect
      }
      const x = (size - drawW) / 2 + offsetX
      const y = (size - drawH) / 2 + offsetY
      ctx.drawImage(userImage, x, y, drawW, drawH)
    } else {
      ctx.fillStyle = '#aaa5ba'
      ctx.font = '600 34px "DM Sans", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Upload your photo to preview', size / 2, size / 2)
    }

    // 3. Overlay Frame (Admin PNG or Built-In Festival Frame)
    if (frameImage) {
      ctx.drawImage(frameImage, 0, 0, size, size)
    } else {
      // Built-in fallback frame so Photo Studio works immediately even before admins upload PNGs
      const grad = ctx.createLinearGradient(0, 0, size, size)
      if (selectedFrameId === 'builtin-pink') {
        grad.addColorStop(0, '#ff6b8a')
        grad.addColorStop(1, '#8658ef')
      } else {
        grad.addColorStop(0, '#ffb84d')
        grad.addColorStop(1, '#ff6b8a')
      }

      ctx.strokeStyle = grad
      ctx.lineWidth = 44
      ctx.strokeRect(22, 22, size - 44, size - 44)

      // Bottom festival badge bar
      ctx.fillStyle = 'rgba(16, 13, 28, 0.88)'
      ctx.fillRect(44, size - 175, size - 88, 131)

      ctx.fillStyle = '#ffb84d'
      ctx.font = '700 44px "Space Grotesk", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText((settings?.festival_name || 'COLLEGE ARTS FEST').toUpperCase(), size / 2, size - 108)

      ctx.fillStyle = '#f8f7ff'
      ctx.font = '500 24px "DM Sans", sans-serif'
      ctx.fillText(settings?.tagline || 'I AM PARTICIPATING!', size / 2, size - 65)
    }
  }, [userImage, frameImage, scale, offsetX, offsetY, selectedFrameId, settings])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Mouse / Touch dragging on canvas
  const handlePointerDown = (e) => {
    if (!userImage) return
    setIsDragging(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX - offsetX, y: clientY - offsetY })
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setOffsetX(clientX - dragStart.x)
    setOffsetY(clientY - dragStart.y)
  }

  const handlePointerUp = () => setIsDragging(false)

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${(settings?.festival_name || 'arts-fest').toLowerCase().replace(/\s+/g, '-')}-frame.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="section-kicker">OFFICIAL FRAME GENERATOR</div>
        <h1>Festival <span>Photo Studio.</span></h1>
        <p>Upload your photo, choose an official festival frame, adjust position & zoom, and download instantly. Your photo stays private on your device.</p>
      </div>

      <div className="studio-layout">
        {/* Canvas Preview */}
        <div className="studio-canvas-box">
          <canvas
            ref={canvasRef}
            width={1080}
            height={1080}
            className="studio-canvas"
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />
          <span className="studio-tip">💡 Tip: Drag directly on the image to reposition your photo</span>
        </div>

        {/* Controls Panel */}
        <div className="studio-controls">
          <div className="control-block">
            <label className="control-label">1. Upload Your Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="file-input" />
          </div>

          <div className="control-block">
            <label className="control-label">2. Select Festival Frame</label>
            <div className="frame-selector-grid">
              <button
                type="button"
                className={`frame-option ${selectedFrameId === 'builtin-gold' ? 'active' : ''}`}
                onClick={() => setSelectedFrameId('builtin-gold')}
              >
                ✦ Gold Fest Frame
              </button>
              <button
                type="button"
                className={`frame-option ${selectedFrameId === 'builtin-pink' ? 'active' : ''}`}
                onClick={() => setSelectedFrameId('builtin-pink')}
              >
                ✦ Neon Fest Frame
              </button>
              {frames.map((frame) => (
                <button
                  type="button"
                  key={frame.id}
                  className={`frame-option ${selectedFrameId === frame.id ? 'active' : ''}`}
                  onClick={() => setSelectedFrameId(frame.id)}
                >
                  <img src={frame.frame_url} alt={frame.title} className="frame-thumb" />
                  <span>{frame.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="control-block">
            <label className="control-label">3. Zoom & Position</label>
            <div className="slider-row">
              <span>Zoom</span>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
              />
            </div>
            <div className="slider-row">
              <span>Horizontal</span>
              <input
                type="range"
                min="-400"
                max="400"
                step="5"
                value={offsetX}
                onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
              />
            </div>
            <div className="slider-row">
              <span>Vertical</span>
              <input
                type="range"
                min="-400"
                max="400"
                step="5"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
              />
            </div>
            <button
              type="button"
              className="secondary-button"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={() => { setScale(1); setOffsetX(0); setOffsetY(0) }}
            >
              Reset Position
            </button>
          </div>

          <button
            type="button"
            className="primary-button"
            style={{ width: '100%', fontSize: '14px', padding: '18px' }}
            onClick={handleDownload}
          >
            ⬇ Download Final Image (PNG)
          </button>
        </div>
      </div>
    </div>
  )
}