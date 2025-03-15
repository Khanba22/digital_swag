"use client"
import { useEffect, useRef, useState } from "react"
import * as fabric from "fabric"
import html2canvas from "html2canvas"

export default function DigitalSwag() {
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState(null)
  const [participantName, setParticipantName] = useState("Your Name")
  const [imageLoaded, setImageLoaded] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1920 })
  const imgRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [panning, setPanning] = useState(false)
  const [lastPosX, setLastPosX] = useState(0)
  const [lastPosY, setLastPosY] = useState(0)
  const [imagePosition, setImagePosition] = useState({
    leftPercent: 50, // center by default (percentage of canvas width)
    topPercent: 41.3, // percentage of canvas height
    scaleX: 1,
    scaleY: 1,
  })
  const [hasUploadedImage, setHasUploadedImage] = useState(false)

  useEffect(() => {
    const updateCanvasSize = () => {
      const screenHeight = window.innerHeight * 0.8
      const aspectRatio = 1080 / 1920
      const newWidth = screenHeight * aspectRatio
      setCanvasSize({ width: newWidth, height: screenHeight })
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
      width: canvasSize.width,
      height: canvasSize.height,
    })

    // Add event listeners for panning and zooming
    fabricCanvas.on("mouse:wheel", (opt) => {
      handleMouseWheel(opt.e)
    })

    fabricCanvas.on("mouse:down", (opt) => {
      handleMouseDown(opt.e)
    })

    fabricCanvas.on("mouse:move", (opt) => {
      handleMouseMove(opt.e)
    })

    fabricCanvas.on("mouse:up", () => {
      handleMouseUp()
    })

    setCanvas(fabricCanvas)

    return () => {
      fabricCanvas.off("mouse:wheel")
      fabricCanvas.off("mouse:down")
      fabricCanvas.off("mouse:move")
      fabricCanvas.off("mouse:up")
      fabricCanvas.dispose()
    }
  }, [canvasSize])

  useEffect(() => {
    if (!canvas) return
    const image = new Image()
    image.src = "data/sardard3.png"
    image.onload = () => {
      const fabricImage = new fabric.FabricImage(image)
      fabricImage.scaleToWidth(canvasSize.width)
      fabricImage.scaleToHeight(canvasSize.height)
      fabricImage.set({
        selectable: false,
        evented: false,
        opacity: 1,
      })
      fabricImage.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        bl: false,
        br: false,
        tl: false,
        tr: false,
      })
      canvas.add(fabricImage)
      setImageLoaded(true)
      canvas.renderAll()
    }
  }, [canvas])

  useEffect(() => {
    if (!canvas) return
    if (!imageLoaded) return
    const leftPercent = 14.5
    const topPercent = 63
    const fontPercentage = 65 / 1000
    const canvasLeft = canvasSize.width * (leftPercent / 100)
    const canvasTop = canvasSize.height * (topPercent / 100)

    // Add neon-glow name text
    const text = new fabric.Text(participantName, {
      left: canvasLeft,
      top: canvasTop,
      fontSize: canvasSize.width * fontPercentage,
      fill: "#FFFFFF",
      fontFamily: "Segoe UI",
      textAlign: "center",
      fontWeight: "bold",
    })
    canvas.add(text)
    canvas.bringObjectToFront(text)
    canvas.renderAll()
  }, [canvas, imageLoaded])

  useEffect(() => {
    if (canvas) {
      const textObj = canvas.getObjects().find((obj) => obj.type === "text")
      if (textObj) {
        textObj.set({ text: participantName })
        canvas.bringObjectToFront(textObj)
        canvas.renderAll()
      }
    }
  }, [canvas, participantName])

  // Handle Image Upload - Modified for centered square image
  const handleImageUpload = (e) => {
    if (e.target.files && canvas) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result

        img.onload = () => {
          // Remove existing image if any
          if (imgRef.current) {
            canvas.remove(imgRef.current)
          }

          if(img.naturalHeight > img.naturalWidth){
            img.height = img.naturalWidth
            img.width = img.naturalWidth
          } else {
            img.height = img.naturalHeight
            img.width = img.naturalHeight
          }

          const fabricImg = new fabric.FabricImage(img)

          // Calculate image dimensions based on percentages
          const imageWidthPercent = 68 // 70% of canvas width
          const scale = (canvasSize.width * (imageWidthPercent / 100)) / img.width

          // Position at center by default (50% of width, 45% of height)
          const leftPercent = 50
          const topPercent = 41.3

          // Convert percentages to actual pixel values for fabric.js
          const centerX = canvasSize.width * (leftPercent / 100)
          const centerY = canvasSize.height * (topPercent / 100)

          // Set image properties
          fabricImg.set({
            left: centerX,
            top: centerY,
            originX: "center",
            originY: "center",
            scaleX: scale,
            scaleY: scale,
          })

          // Store reference and add to canvas
          imgRef.current = fabricImg
          canvas.backgroundImage = fabricImg
          canvas.renderAll()

          // Update image position state with percentages
          setImagePosition({
            leftPercent: leftPercent,
            topPercent: topPercent,
            scaleX: scale,
            scaleY: scale,
          })

          setHasUploadedImage(true)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  // Update image position and scale
  const updateImagePosition = () => {
    if (!canvas || !canvas.backgroundImage) return

    const img = canvas.backgroundImage
    if (img) {
      // Convert percentage values to actual pixel positions
      const leftPixels = canvasSize.width * (imagePosition.leftPercent / 100)
      const topPixels = canvasSize.height * (imagePosition.topPercent / 100)

      img.set({
        left: leftPixels,
        top: topPixels,
        scaleX: imagePosition.scaleX,
        scaleY: imagePosition.scaleY,
      })
      canvas.renderAll()
    }
  }

  // Handle input changes for percentages
  const handlePositionChange = (e, property) => {
    const value = Number.parseFloat(e.target.value)
    setImagePosition((prev) => ({
      ...prev,
      [property]: value,
    }))
  }

  // Apply position changes when inputs change or canvas size changes
  useEffect(() => {
    updateImagePosition()
  }, [imagePosition, canvasSize])

  // Download as PNG
  const downloadImage = () => {
    html2canvas(canvasRef.current).then((canvasImg) => {
      const link = document.createElement("a")
      link.download = "digital_swag.png"
      link.href = canvasImg.toDataURL("image/png")
      link.click()
    })
  }

  // Handle mouse wheel for zooming
  const handleMouseWheel = (e) => {
    if (!canvas) return

    const delta = e.deltaY
    let newZoom = zoom

    if (delta > 0) {
      newZoom = Math.max(0.5, zoom - 0.1) // Zoom out (min 0.5)
    } else {
      newZoom = Math.min(3, zoom + 0.1) // Zoom in (max 3)
    }

    if (newZoom !== zoom) {
      canvas.setZoom(newZoom)
      setZoom(newZoom)
      canvas.renderAll()
    }

    e.preventDefault()
    e.stopPropagation()
  }

  // Handle mouse down for panning
  const handleMouseDown = (e) => {
    if (!canvas) return
    setPanning(true)
    setLastPosX(e.clientX)
    setLastPosY(e.clientY)
  }

  // Handle mouse move for panning
  const handleMouseMove = (e) => {
    if (!panning || !canvas) return

    const vpt = canvas.viewportTransform
    vpt[4] += e.clientX - lastPosX
    vpt[5] += e.clientY - lastPosY

    canvas.setViewportTransform(vpt)
    canvas.renderAll()

    setLastPosX(e.clientX)
    setLastPosY(e.clientY)
  }

  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    setPanning(false)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-center justify-center min-h-screen overflow-hidden relative">
      {/* Canvas Container */}
      <div
        className={`relative border-[3px] border-blue-400 shadow-2xl rounded-lg overflow-hidden backdrop-blur-lg bg-opacity-30 ${panning ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>

      {/* Control Panel */}
      <div className="mt-6 w-full max-w-md p-6 rounded-xl shadow-xl bg-black/50 backdrop-blur-lg text-white border border-blue-500">
        <h2 className="text-center text-2xl font-orbitron tracking-wide text-blue-400">Customize Your Swag 🚀</h2>

        {/* Name Input */}
        <input
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 mt-4 border border-blue-400 rounded-md bg-black/60 text-blue-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Image Upload */}
        <label className="mt-4 block text-center text-blue-300 cursor-pointer hover:text-blue-500">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />📸 Upload Your Image
        </label>

        {/* Image Position Controls */}
        {hasUploadedImage && false && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-blue-300">Left Position (%)</label>
              <input
                type="number"
                value={imagePosition.leftPercent}
                onChange={(e) => handlePositionChange(e, "leftPercent")}
                min="0"
                max="100"
                step="1"
                className="w-full p-2 border border-blue-400 rounded-md bg-black/60 text-blue-300 placeholder-gray-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-blue-300">Top Position (%)</label>
              <input
                type="number"
                value={imagePosition.topPercent}
                onChange={(e) => handlePositionChange(e, "topPercent")}
                min="0"
                max="100"
                step="1"
                className="w-full p-2 border border-blue-400 rounded-md bg-black/60 text-blue-300 placeholder-gray-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-blue-300">Scale X</label>
              <input
                type="number"
                value={imagePosition.scaleX}
                onChange={(e) => handlePositionChange(e, "scaleX")}
                step="0.1"
                min="0.1"
                className="w-full p-2 border border-blue-400 rounded-md bg-black/60 text-blue-300 placeholder-gray-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-blue-300">Scale Y</label>
              <input
                type="number"
                value={imagePosition.scaleY}
                onChange={(e) => handlePositionChange(e, "scaleY")}
                step="0.1"
                min="0.1"
                className="w-full p-2 border border-blue-400 rounded-md bg-black/60 text-blue-300 placeholder-gray-400 outline-none"
              />
            </div>
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={downloadImage}
          className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md shadow-lg hover:scale-105 transition-transform duration-200"
        >
          Download Your Swag
        </button>
      </div>
    </div>
  )
}

