"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { uploadPrendaImage } from "../../infrastructure/actions";

interface ImageUploaderProps {
  prendaId: string;
  currentUrl: string | null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function ImageUploader({ prendaId, currentUrl }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato no válido. Usa JPG, PNG o WebP.");
      return;
    }

    // Validar tamaño
    if (file.size > MAX_SIZE_BYTES) {
      setError(`El archivo excede el tamaño máximo de ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Preview local
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload
    setIsUploading(true);
    try {
      const url = await uploadPrendaImage(file, prendaId);
      setPreview(url);
    } catch {
      setError("Error al subir la imagen. Intenta de nuevo.");
      setPreview(currentUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePreview = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-40 h-40">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover rounded-md"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemovePreview}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              inputRef.current?.click();
            }
          }}
        >
          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            JPG, PNG o WebP
            <br />
            Máx. {MAX_SIZE_MB}MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {isUploading && (
        <p className="text-xs text-muted-foreground">Subiendo imagen...</p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
