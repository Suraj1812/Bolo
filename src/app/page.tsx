import { VoiceStudio } from "@/components/voice-studio";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SUPPORTED_LOCALES,
} from "@/lib/site";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: "Bolo Voice to Text",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "AccessibilityApplication",
  applicationSubCategory: "AssistiveTechnology",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  inLanguage: SUPPORTED_LOCALES,
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  featureList: [
    "Real-time speech to text",
    "Paste text and listen aloud",
    "Automatic playback language detection",
    "One-tap copy and clear",
    "Multilingual interface",
    "Local text and language persistence",
  ],
  accessibilityFeature: [
    "highContrastDisplay",
    "largePrint",
    "readingOrder",
    "structuralNavigation",
    "textToSpeech",
  ],
  accessibilityHazard: "none",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <VoiceStudio />
    </>
  );
}
