"use client";

/* Owner-provided image URLs cannot use a fixed Next Image allow-list. */
/* eslint-disable @next/next/no-img-element */

import { Maximize2, X } from "lucide-react";
import { useRef, useState } from "react";
import { MattedImage } from "@/components/ui/matted-image";
import type { CatalogueImage } from "@/modules/catalogue/domain/catalogue-read-models";

interface CatalogueItemGalleryProps {
  images: CatalogueImage[];
  title: string;
}

/* Cropped, matted images with a way to see each photo whole. */
export function CatalogueItemGallery({ images, title }: CatalogueItemGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const active = images[activeIndex] ?? null;
  const altFor = (image: CatalogueImage) => image.altText ?? title;

  function openViewer() {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  if (!active) {
    return <MattedImage alt="" fallbackTitle={title} ratio="4/5" src={null} />;
  }

  return (
    <div className="grid gap-3">
      <div className="relative">
        <MattedImage alt={altFor(active)} key={active.id} priority ratio="4/5" src={active.url} />
        <button
          className="absolute bottom-4 right-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-paper/90 px-4 text-sm font-semibold text-brand backdrop-blur-sm transition-colors hover:bg-paper"
          onClick={openViewer}
          type="button"
        >
          <Maximize2 aria-hidden="true" size={15} strokeWidth={1.5} />
          Xem ảnh đầy đủ
        </button>
      </div>

      {images.length > 1 ? (
        <ul aria-label="Các ảnh khác" className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                aria-label={`Xem ảnh ${index + 1}: ${altFor(image)}`}
                aria-pressed={index === activeIndex}
                className={`block w-16 rounded-[var(--radius-object)] p-0.5 transition-shadow ${
                  index === activeIndex ? "outline outline-2 outline-rose" : "opacity-80 hover:opacity-100"
                }`}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <MattedImage alt="" bare ratio="1/1" src={image.url} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <dialog
        aria-label={`Ảnh đầy đủ: ${altFor(active)}`}
        className="m-0 h-full max-h-none w-full max-w-none bg-night/95 p-4 backdrop:bg-transparent open:grid open:place-items-center sm:p-10"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        ref={dialogRef}
      >
        <img alt={altFor(active)} className="max-h-[calc(100dvh-7rem)] max-w-full object-contain" src={active.url} />
        <button
          className="fixed right-4 top-4 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[rgb(245_241_234/35%)] px-4 text-sm font-semibold text-[#f5f1ea]"
          onClick={() => dialogRef.current?.close()}
          type="button"
        >
          <X aria-hidden="true" size={16} strokeWidth={1.5} />
          Đóng
        </button>
      </dialog>
    </div>
  );
}
