import { ImageResponse } from "next/og";

import { SocialCard } from "@/app/social-card";

export const alt =
  "Bolo voice-first communication app — speak to type, paste to listen, and copy in one tap";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<SocialCard />, size);
}

