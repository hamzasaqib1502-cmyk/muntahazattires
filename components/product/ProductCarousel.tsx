"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductCarouselProps = {
  images: string[];
  name: string;
};

const SWIPE_THRESHOLD = 40;

export function ProductCarousel({ images, name }: ProductCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;
  if (count === 0) return null;

  const goPrev = () => setIndex((current) => (current - 1 + count) % count);
  const goNext = () => setIndex((current) => (current + 1) % count);
  const goTo = (target: number) => setIndex(target);

  return (
    <div>
      <div
        className="relative aspect-[3/4] overflow-hidden bg-gray-100"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const delta = event.changedTouches[0].clientX - touchStartX.current;
          if (delta > SWIPE_THRESHOLD) goPrev();
          else if (delta < -SWIPE_THRESHOLD) goNext();
          touchStartX.current = null;
        }}
      >
        <Image
          key={images[index]}
          src={images[index]}
          alt={name}
          fill
          priority={index === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        {count > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 text-black transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 text-black transition-colors hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => goTo(i)}
              aria-label={`View image ${i + 1} of ${count}`}
              aria-current={i === index}
              className={`h-16 w-16 overflow-hidden border transition-colors ${
                i === index
                  ? "border-black"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Image
                src={src}
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
