"use client";

import Image from "next/image";
import { useState } from "react";

const PLACEHOLDER = "/images/product-placeholder.svg";

type Props = {
  src: string | null | undefined;
  alt: string;
  size?: number;
  className?: string;
};

export function ProductImageThumb({ src, alt, size = 44, className = "" }: Props) {
  const [broken, setBroken] = useState(false);
  const effective = !src || broken ? PLACEHOLDER : src;
  const isLocal = effective.startsWith("/");

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={effective}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
        onError={() => setBroken(true)}
        unoptimized={isLocal}
      />
    </div>
  );
}
