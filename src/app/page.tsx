"use client";

import React, { useState, useEffect } from "react";
import PixelArtCanvas from "@/components/PixelArtCanvas";
import NewArtworkDialog from "@/components/NewArtworkDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";

interface Artwork {
  id: string;
  name: string;
  width: number;
  height: number;
  pixels: string[][];
}

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    const savedArtworks = localStorage.getItem("pixelArtworks");
    if (savedArtworks) {
      try {
        const parsedArtworks: Artwork[] = JSON.parse(savedArtworks);
        const validatedArtworks: Artwork[] = parsedArtworks.map((artwork) => ({
          ...artwork,
          pixels: Array.isArray(artwork.pixels)
            ? artwork.pixels
            : createEmptyPixels(artwork.width, artwork.height),
        }));
        setArtworks(validatedArtworks);
      } catch (error) {
        console.error("Error parsing saved artworks:", error);
        setArtworks([]);
      }
    }
  }, []);

  const createEmptyPixels = (width: number, height: number): string[][] => {
    return Array(height)
      .fill(null)
      .map(() => Array(width).fill("transparent"));
  };

  const handleCreateNewArtwork = (
    name: string,
    width: number,
    height: number,
  ) => {
    const newArtwork: Artwork = {
      id: Date.now().toString(),
      name,
      width,
      height,
      pixels: createEmptyPixels(width, height),
    };
    const updatedArtworks = [...artworks, newArtwork];
    setArtworks(updatedArtworks);
    localStorage.setItem("pixelArtworks", JSON.stringify(updatedArtworks));
    setSelectedArtwork(newArtwork);
  };

  const handleSaveArtwork = (pixels: string[][]) => {
    if (selectedArtwork) {
      const updatedArtwork: Artwork = { ...selectedArtwork, pixels };
      const updatedArtworks = artworks.map((art) =>
        art.id === updatedArtwork.id ? updatedArtwork : art,
      );
      setArtworks(updatedArtworks);
      localStorage.setItem("pixelArtworks", JSON.stringify(updatedArtworks));
      setSelectedArtwork(updatedArtwork);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Pixel Art Gallery</h1>
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="h-5 w-5" />
            Create New Artwork
          </Button>
        </div>

        {selectedArtwork ? (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {selectedArtwork.name}
              </h2>
              <Button
                variant="outline"
                onClick={() => setSelectedArtwork(null)}
              >
                <X className="mr-2 h-5 w-5" />
                Close
              </Button>
            </div>
            <PixelArtCanvas
              width={selectedArtwork.width}
              height={selectedArtwork.height}
              pixels={selectedArtwork.pixels}
              onSave={handleSaveArtwork}
            />
          </div>
        ) : artworks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="cursor-pointer rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700"
                onClick={() => setSelectedArtwork(artwork)}
              >
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {artwork.name}
                </h3>
                <p className="text-gray-400">
                  {artwork.width}x{artwork.height}
                </p>
                <div
                  className="mt-2 grid aspect-square w-full"
                  style={{
                    gridTemplateColumns: `repeat(${artwork.width}, 1fr)`,
                  }}
                >
                  {artwork.pixels.map((row, i) =>
                    row.map((color, j) => (
                      <div
                        key={`${i}-${j}`}
                        className="h-full w-full"
                        style={{ backgroundColor: color }}
                      />
                    )),
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-gray-800">
            <p className="text-gray-400">
              {`No artworks yet. Click "Create New Artwork" to get started!`}
            </p>
          </div>
        )}
      </div>

      <NewArtworkDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleCreateNewArtwork}
      />
    </main>
  );
}
