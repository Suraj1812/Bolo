import { ImageResponse } from "next/og";

import { BrandIcon } from "@/app/brand-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<BrandIcon iconSize={size.width} />, size);
}

