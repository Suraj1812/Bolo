import { ImageResponse } from "next/og";

import { BrandIcon } from "@/app/brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<BrandIcon iconSize={size.width} />, size);
}

