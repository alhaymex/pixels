"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PixelArtCanvasProps {
  width: number;
  height: number;
  pixels: string[][];
  onSave: (pixels: string[][]) => void;
}

const PixelArtCanvas: React.FC<PixelArtCanvasProps> = ({
  width,
  height,
  pixels: initialPixels,
  onSave,
}) => {
  const [pixels, setPixels] = useState<string[][]>(initialPixels);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  const handlePixelClick = useCallback(
    (row: number, col: number) => {
      setPixels((prevPixels) => {
        const newPixels = prevPixels.map((r) => [...r]);
        newPixels[row][col] = currentColor;
        return newPixels;
      });
    },
    [currentColor],
  );

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true);
    handlePixelClick(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing) {
      handlePixelClick(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentColor(e.target.value);
  };

  const handleClearCanvas = () => {
    setPixels(
      Array(height)
        .fill(null)
        .map(() => Array(width).fill("transparent")),
    );
  };

  const handleSave = () => {
    onSave(pixels);
  };

  const handleDownloadImage = () => {
    const hiddenCanvas = hiddenCanvasRef.current;
    if (hiddenCanvas) {
      const ctx = hiddenCanvas.getContext("2d");
      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);

        // Draw each pixel on the hidden canvas
        for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
            ctx.fillStyle =
              pixels[row][col] !== "transparent"
                ? pixels[row][col]
                : "rgba(0,0,0,0)";
            ctx.fillRect(col, row, 1, 1);
          }
        }

        // Generate the image and trigger the download
        const link = document.createElement("a");
        link.href = hiddenCanvas.toDataURL("image/png");
        link.download = "pixel-art.png";
        link.click();
      }
    }
  };

  useEffect(() => {
    setPixels(initialPixels);
  }, [initialPixels]);

  return (
    <div className="flex flex-col items-center space-y-4 rounded-lg bg-gray-800 p-6">
      <div
        id="pixel-art-canvas"
        className="grid border border-gray-600 shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${width}, 1fr)`,
          width: `${width * 20}px`,
          height: `${height * 20}px`,
        }}
        onMouseLeave={handleMouseUp}
      >
        {pixels.map((row, i) =>
          row.map((color, j) => (
            <div
              key={`${i}-${j}`}
              className={`h-5 w-5 ${showGrid ? "border border-gray-700" : ""} cursor-crosshair`}
              style={{ backgroundColor: color }}
              onMouseDown={() => handleMouseDown(i, j)}
              onMouseEnter={() => handleMouseEnter(i, j)}
              onMouseUp={handleMouseUp}
            />
          )),
        )}
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="colorPicker" className="text-white">
            Color:
          </Label>
          <Input
            type="color"
            id="colorPicker"
            value={currentColor}
            onChange={handleColorChange}
            className="h-10 w-10 border-0 p-0"
          />
        </div>
        <Button onClick={handleClearCanvas} variant="destructive">
          Clear Canvas
        </Button>
        <Button onClick={handleSave} variant="default">
          Save
        </Button>
        <Button onClick={handleDownloadImage} variant="default">
          Download Image
        </Button>
        <div className="flex items-center space-x-2">
          <Switch
            id="grid-mode"
            checked={showGrid}
            onCheckedChange={setShowGrid}
          />
          <Label htmlFor="grid-mode" className="text-white">
            Show Grid
          </Label>
        </div>
      </div>
      <canvas
        ref={hiddenCanvasRef}
        width={width}
        height={height}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default PixelArtCanvas;
