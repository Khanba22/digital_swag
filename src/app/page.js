"use client";
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import html2canvas from "html2canvas";

export default function DigitalSwag() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [participantName, setParticipantName] = useState("Your Name");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1920 });
  const imgRef = useRef(null);

  useEffect(() => {
    const updateCanvasSize = () => {
      const screenHeight = window.innerHeight * 0.8;
      const aspectRatio = 1080 / 1920;
      const newWidth = screenHeight * aspectRatio;
      setCanvasSize({ width: newWidth, height: screenHeight });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
      width: canvasSize.width,
      height: canvasSize.height,
    });
    setCanvas(fabricCanvas);
    return () => fabricCanvas.dispose();
  }, [canvasSize]);

  useEffect(() => {
    if (!canvas) return;
    const image = new Image();
    image.src = "data/sardard3.png";
    image.onload = () => {
      const fabricImage = new fabric.FabricImage(image);
      fabricImage.scaleToWidth(canvasSize.width);
      fabricImage.scaleToHeight(canvasSize.height);
      fabricImage.set({
        selectable: false,
        evented: false,
      });
      fabricImage.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        bl: false,
        br: false,
        tl: false,
        tr: false,
      });
      canvas.add(fabricImage);
      setImageLoaded(true);
      canvas.renderAll();
    };
  }, [canvas]);

  useEffect(() => {
    if(!canvas) return
    if(!imageLoaded) return
    const leftPercent = 14.5;
    const topPercent = 63;
    const fontPercentage = 65 / 1000;
    const canvasLeft = canvasSize.width * (leftPercent / 100);
    const canvasTop = canvasSize.height * (topPercent / 100);

    // Add neon-glow name text
    const text = new fabric.Text(participantName, {
      left: canvasLeft,
      top: canvasTop,
      fontSize: canvasSize.width * fontPercentage,
      fill: "#FFFFFF",
      fontFamily: "Segoe UI",
      textAlign: "center",
      fontWeight: "bold",
    });
    canvas.add(text);
    canvas.bringObjectToFront(text);
    canvas.renderAll();
  },[canvas,imageLoaded]);

  useEffect(() => {
    if (canvas) {
      const textObj = canvas.getObjects().find((obj) => obj.type === "text");
      if (textObj) {
        textObj.set({ text: participantName });
        canvas.bringObjectToFront(textObj);
        canvas.renderAll();
      }
    }
  }, [canvas, participantName]);

  // Handle Image Upload - Modified for centered square image
  const handleImageUpload = (e) => {
    if (e.target.files && canvas) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result;

        img.onload = () => {
          // Remove existing image if any
          if (imgRef.current) {
            canvas.remove(imgRef.current);
          }

          const fabricImg = new fabric.FabricImage(img);

          const imagePercentage = 700 / 1000;
          const canvasLeft = canvasSize.width * (50 / 100);
          const canvasTop = canvasSize.height * (45 / 100);

          // Calculate image dimensions

          const scale = (canvasSize.width * imagePercentage) / img.width;
          const centerX = canvasLeft;
          const centerY = canvasTop;

          // Set image properties
          fabricImg.set({
            left: centerX,
            top: centerY,
            originX: "center",
            originY: "center",
            scaleX: scale,
            scaleY: scale,
          });
          // Store reference and add to canvas
          imgRef.current = fabricImg;
          canvas.backgroundImage = fabricImg;
          canvas.renderAll();
        };
      };

      reader.readAsDataURL(file);
    }
  };

  // Download as PNG
  const downloadImage = () => {
    html2canvas(canvasRef.current).then((canvasImg) => {
      const link = document.createElement("a");
      link.download = "digital_swag.png";
      link.href = canvasImg.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-center justify-center min-h-screen overflow-hidden relative">
      {/* Canvas Container */}
      <div
        className="relative border-[3px] border-blue-400 shadow-2xl rounded-lg overflow-hidden backdrop-blur-lg bg-opacity-30"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>

      {/* Control Panel */}
      <div className="mt-6 w-full max-w-md p-6 rounded-xl shadow-xl bg-black/50 backdrop-blur-lg text-white border border-blue-500">
        <h2 className="text-center text-2xl font-orbitron tracking-wide text-blue-400">
          Customize Your Swag 🚀
        </h2>

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
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          📸 Upload Your Image
        </label>

        {/* Download Button */}
        <button
          onClick={downloadImage}
          className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md shadow-lg hover:scale-105 transition-transform duration-200"
        >
          Download Your Swag
        </button>
      </div>
    </div>
  );
}
