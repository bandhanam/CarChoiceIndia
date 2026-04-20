"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Car } from "@/types";

const PLACEHOLDER = "/images/cars/placeholder-car.svg";

type CarPhotoProps = {
  car: Car;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export default function CarPhoto({
  car,
  alt,
  width,
  height,
  className,
  priority,
  sizes,
}: CarPhotoProps) {
  const [src, setSrc] = useState(car.imageUrl || PLACEHOLDER);

  useEffect(() => {
    setSrc(car.imageUrl || PLACEHOLDER);
  }, [car.id, car.imageUrl]);

  const onError = useCallback(() => {
    setSrc(PLACEHOLDER);
  }, []);

  if (src.endsWith(".svg") || src.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      unoptimized
      referrerPolicy="no-referrer"
      onError={onError}
    />
  );
}
