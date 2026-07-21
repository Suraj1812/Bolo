"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AudioLines,
  Check,
  ChevronDown,
  ClipboardPaste,
  Copy,
  Globe2,
  Mic,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BoloSpeechRecognitionAlternative {
  transcript: string;
}

interface BoloSpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: BoloSpeechRecognitionAlternative;
}

interface BoloSpeechRecognitionResultList {
  readonly length: number;
  readonly [index: number]: BoloSpeechRecognitionResult;
}

interface BoloSpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: BoloSpeechRecognitionResultList;
}

interface BoloSpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface BoloSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: BoloSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BoloSpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type BoloSpeechRecognitionConstructor = new () => BoloSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BoloSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BoloSpeechRecognitionConstructor;
  }
}

const LANGUAGES = [
  { value: "auto", label: "Auto", locale: "" },
  { value: "hi-IN", label: "हिन्दी", locale: "hi-IN" },
  { value: "en-IN", label: "English", locale: "en-IN" },
  { value: "bn-IN", label: "বাংলা", locale: "bn-IN" },
  { value: "ta-IN", label: "தமிழ்", locale: "ta-IN" },
  { value: "te-IN", label: "తెలుగు", locale: "te-IN" },
  { value: "mr-IN", label: "मराठी", locale: "mr-IN" },
] as const;

interface UiStrings {
  auto: string;
  ready: string;
  listening: string;
  playing: string;
  tryAgain: string;
  voiceUnavailable: string;
  speechLanguage: string;
  voiceToText: string;
  voiceInput: string;
  textActions: string;
  startListening: string;
  stopListening: string;
  readAloud: string;
  stopReading: string;
  buttonListen: string;
  buttonPaste: string;
  buttonCopy: string;
  buttonClear: string;
  pasteText: string;
  copyText: string;
  clearText: string;
  microphonePermission: string;
  listenUnavailable: string;
  copyFailed: string;
  copied: string;
  pasted: string;
  pasteFailed: string;
  emptyClipboard: string;
  cleared: string;
  noText: string;
  unavailable: string;
}

const UI_STRINGS: Record<string, UiStrings> = {
  en: {
    auto: "Auto",
    ready: "Ready",
    listening: "Listening…",
    playing: "Playing…",
    tryAgain: "Try again",
    voiceUnavailable: "Voice unavailable",
    speechLanguage: "Speech language",
    voiceToText: "Voice to text",
    voiceInput: "Voice input",
    textActions: "Text actions",
    startListening: "Start listening",
    stopListening: "Stop listening",
    readAloud: "Read text aloud",
    stopReading: "Stop reading text aloud",
    buttonListen: "LISTEN",
    buttonPaste: "PASTE",
    buttonCopy: "COPY",
    buttonClear: "CLEAR",
    pasteText: "Paste copied text",
    copyText: "Copy recognized text",
    clearText: "Clear all recognized text",
    microphonePermission: "Microphone permission is needed",
    listenUnavailable: "Listen back is unavailable",
    copyFailed: "Copy failed",
    copied: "Copied",
    pasted: "Pasted",
    pasteFailed: "Paste failed",
    emptyClipboard: "Clipboard is empty",
    cleared: "Cleared",
    noText: "Speak or paste first",
    unavailable: "Voice input is unavailable",
  },
  hi: {
    auto: "ऑटो",
    ready: "तैयार",
    listening: "सुन रहा है…",
    playing: "सुना रहा है…",
    tryAgain: "फिर कोशिश करें",
    voiceUnavailable: "आवाज़ उपलब्ध नहीं",
    speechLanguage: "बोलने की भाषा",
    voiceToText: "आवाज़ से लिखाई",
    voiceInput: "आवाज़ बोलें",
    textActions: "लिखाई के विकल्प",
    startListening: "सुनना शुरू करें",
    stopListening: "सुनना बंद करें",
    readAloud: "लिखा हुआ सुनें",
    stopReading: "सुनाना बंद करें",
    buttonListen: "सुनें",
    buttonPaste: "पेस्ट",
    buttonCopy: "कॉपी",
    buttonClear: "साफ़",
    pasteText: "कॉपी किया हुआ पेस्ट करें",
    copyText: "लिखा हुआ कॉपी करें",
    clearText: "सब मिटाएँ",
    microphonePermission: "माइक्रोफ़ोन की अनुमति चाहिए",
    listenUnavailable: "सुनाने की सुविधा उपलब्ध नहीं है",
    copyFailed: "कॉपी नहीं हुआ",
    copied: "कॉपी हो गया",
    pasted: "पेस्ट हो गया",
    pasteFailed: "पेस्ट नहीं हुआ",
    emptyClipboard: "क्लिपबोर्ड खाली है",
    cleared: "साफ़ हो गया",
    noText: "पहले बोलिए या पेस्ट करें",
    unavailable: "आवाज़ की सुविधा उपलब्ध नहीं है",
  },
  bn: {
    auto: "স্বয়ংক্রিয়",
    ready: "প্রস্তুত",
    listening: "শুনছি…",
    playing: "শোনানো হচ্ছে…",
    tryAgain: "আবার চেষ্টা করুন",
    voiceUnavailable: "ভয়েস পাওয়া যাচ্ছে না",
    speechLanguage: "কথার ভাষা",
    voiceToText: "কথা থেকে লেখা",
    voiceInput: "কথা বলুন",
    textActions: "লেখার কাজ",
    startListening: "শোনা শুরু করুন",
    stopListening: "শোনা বন্ধ করুন",
    readAloud: "লেখা শুনুন",
    stopReading: "পড়া বন্ধ করুন",
    buttonListen: "শুনুন",
    buttonPaste: "পেস্ট",
    buttonCopy: "কপি",
    buttonClear: "মুছুন",
    pasteText: "কপি করা লেখা পেস্ট করুন",
    copyText: "লেখা কপি করুন",
    clearText: "সব মুছুন",
    microphonePermission: "মাইক্রোফোনের অনুমতি প্রয়োজন",
    listenUnavailable: "শোনানোর সুবিধা পাওয়া যাচ্ছে না",
    copyFailed: "কপি করা যায়নি",
    copied: "কপি হয়েছে",
    pasted: "পেস্ট হয়েছে",
    pasteFailed: "পেস্ট করা যায়নি",
    emptyClipboard: "ক্লিপবোর্ড খালি",
    cleared: "মুছে ফেলা হয়েছে",
    noText: "আগে বলুন বা পেস্ট করুন",
    unavailable: "ভয়েস ইনপুট পাওয়া যাচ্ছে না",
  },
  ta: {
    auto: "தானியங்கி",
    ready: "தயார்",
    listening: "கேட்கிறது…",
    playing: "ஒலிக்கிறது…",
    tryAgain: "மீண்டும் முயலவும்",
    voiceUnavailable: "குரல் வசதி இல்லை",
    speechLanguage: "பேச்சு மொழி",
    voiceToText: "குரலில் இருந்து எழுத்து",
    voiceInput: "குரல் உள்ளீடு",
    textActions: "எழுத்துச் செயல்கள்",
    startListening: "கேட்கத் தொடங்கு",
    stopListening: "கேட்பதை நிறுத்து",
    readAloud: "எழுத்தை வாசி",
    stopReading: "வாசிப்பதை நிறுத்து",
    buttonListen: "கேளுங்கள்",
    buttonPaste: "ஒட்டு",
    buttonCopy: "நகலெடு",
    buttonClear: "அழி",
    pasteText: "நகலெடுத்த எழுத்தை ஒட்டவும்",
    copyText: "எழுத்தை நகலெடு",
    clearText: "அனைத்தையும் அழி",
    microphonePermission: "மைக்ரோஃபோன் அனுமதி தேவை",
    listenUnavailable: "வாசிக்கும் வசதி இல்லை",
    copyFailed: "நகலெடுக்க முடியவில்லை",
    copied: "நகலெடுக்கப்பட்டது",
    pasted: "ஒட்டப்பட்டது",
    pasteFailed: "ஒட்ட முடியவில்லை",
    emptyClipboard: "கிளிப்போர்டு காலியாக உள்ளது",
    cleared: "அழிக்கப்பட்டது",
    noText: "முதலில் பேசுங்கள் அல்லது ஒட்டுங்கள்",
    unavailable: "குரல் உள்ளீடு கிடைக்கவில்லை",
  },
  te: {
    auto: "ఆటో",
    ready: "సిద్ధం",
    listening: "వింటోంది…",
    playing: "వినిపిస్తోంది…",
    tryAgain: "మళ్లీ ప్రయత్నించండి",
    voiceUnavailable: "వాయిస్ అందుబాటులో లేదు",
    speechLanguage: "మాట్లాడే భాష",
    voiceToText: "మాట నుంచి వచనం",
    voiceInput: "వాయిస్ ఇన్‌పుట్",
    textActions: "వచన ఎంపికలు",
    startListening: "వినడం ప్రారంభించండి",
    stopListening: "వినడం ఆపండి",
    readAloud: "వచనాన్ని వినండి",
    stopReading: "చదవడం ఆపండి",
    buttonListen: "వినండి",
    buttonPaste: "అతికించు",
    buttonCopy: "కాపీ",
    buttonClear: "తొలగించు",
    pasteText: "కాపీ చేసిన వచనాన్ని అతికించండి",
    copyText: "వచనాన్ని కాపీ చేయండి",
    clearText: "అన్నీ తొలగించండి",
    microphonePermission: "మైక్రోఫోన్ అనుమతి అవసరం",
    listenUnavailable: "వినిపించే సౌకర్యం అందుబాటులో లేదు",
    copyFailed: "కాపీ కాలేదు",
    copied: "కాపీ అయింది",
    pasted: "అతికించబడింది",
    pasteFailed: "అతికించలేకపోయాం",
    emptyClipboard: "క్లిప్‌బోర్డ్ ఖాళీగా ఉంది",
    cleared: "తొలగించబడింది",
    noText: "ముందు మాట్లాడండి లేదా అతికించండి",
    unavailable: "వాయిస్ ఇన్‌పుట్ అందుబాటులో లేదు",
  },
  mr: {
    auto: "ऑटो",
    ready: "तयार",
    listening: "ऐकत आहे…",
    playing: "वाचत आहे…",
    tryAgain: "पुन्हा प्रयत्न करा",
    voiceUnavailable: "आवाज उपलब्ध नाही",
    speechLanguage: "बोलण्याची भाषा",
    voiceToText: "आवाजातून मजकूर",
    voiceInput: "आवाज द्या",
    textActions: "मजकूर पर्याय",
    startListening: "ऐकणे सुरू करा",
    stopListening: "ऐकणे थांबवा",
    readAloud: "मजकूर ऐका",
    stopReading: "वाचणे थांबवा",
    buttonListen: "ऐका",
    buttonPaste: "पेस्ट",
    buttonCopy: "कॉपी",
    buttonClear: "पुसा",
    pasteText: "कॉपी केलेला मजकूर पेस्ट करा",
    copyText: "मजकूर कॉपी करा",
    clearText: "सगळे पुसा",
    microphonePermission: "मायक्रोफोनची परवानगी आवश्यक आहे",
    listenUnavailable: "ऐकवण्याची सुविधा उपलब्ध नाही",
    copyFailed: "कॉपी झाले नाही",
    copied: "कॉपी झाले",
    pasted: "पेस्ट झाले",
    pasteFailed: "पेस्ट झाले नाही",
    emptyClipboard: "क्लिपबोर्ड रिकामा आहे",
    cleared: "साफ झाले",
    noText: "आधी बोला किंवा पेस्ट करा",
    unavailable: "व्हॉइस इनपुट उपलब्ध नाही",
  },
};

type VoiceStatus = "idle" | "listening" | "speaking" | "error";

const SCRIPT_LOCALES = [
  { pattern: /[\u3040-\u30ff]/u, locale: "ja-JP" },
  { pattern: /[\uac00-\ud7af]/u, locale: "ko-KR" },
  { pattern: /[\u0980-\u09ff]/u, locale: "bn-IN" },
  { pattern: /[\u0b80-\u0bff]/u, locale: "ta-IN" },
  { pattern: /[\u0c00-\u0c7f]/u, locale: "te-IN" },
  { pattern: /[\u0900-\u097f]/u, locale: "hi-IN" },
  { pattern: /[\u0a80-\u0aff]/u, locale: "gu-IN" },
  { pattern: /[\u0a00-\u0a7f]/u, locale: "pa-IN" },
  { pattern: /[\u0c80-\u0cff]/u, locale: "kn-IN" },
  { pattern: /[\u0d00-\u0d7f]/u, locale: "ml-IN" },
  { pattern: /[\u0d80-\u0dff]/u, locale: "si-LK" },
  { pattern: /[\u0e00-\u0e7f]/u, locale: "th-TH" },
  { pattern: /[\u0590-\u05ff]/u, locale: "he-IL" },
  { pattern: /[\u0370-\u03ff]/u, locale: "el-GR" },
  { pattern: /[\u0400-\u04ff]/u, locale: "ru-RU" },
  { pattern: /[\u4e00-\u9fff]/u, locale: "zh-CN" },
] as const;

function detectTextLocale(text: string, fallbackLocale = "en-IN") {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return fallbackLocale;
  }

  const scriptMatch = SCRIPT_LOCALES.find(({ pattern }) =>
    pattern.test(normalizedText),
  );
  if (scriptMatch) {
    return scriptMatch.locale;
  }

  if (/[\u0600-\u06ff]/u.test(normalizedText)) {
    return /[\u0679\u0688\u0691\u06ba\u06be\u06c1\u06d2]/u.test(normalizedText)
      ? "ur-PK"
      : "ar-SA";
  }

  const latinText = normalizedText.toLowerCase();
  if (/[¿¡ñ]/u.test(latinText) || /\b(hola|gracias|que|una|los|las)\b/u.test(latinText)) {
    return "es-ES";
  }
  if (/[àâçéèêëîïôùûüÿœ]/u.test(latinText) || /\b(bonjour|merci|avec|pour|une|les)\b/u.test(latinText)) {
    return "fr-FR";
  }
  if (/[äöüß]/u.test(latinText) || /\b(hallo|danke|und|der|die|das)\b/u.test(latinText)) {
    return "de-DE";
  }
  if (/[ãõ]/u.test(latinText) || /\b(obrigado|obrigada|você|uma)\b/u.test(latinText)) {
    return "pt-BR";
  }
  if (/\b(ciao|grazie|buongiorno|della|sono)\b/u.test(latinText)) {
    return "it-IT";
  }

  return "en-IN";
}

function findMatchingVoice(voices: SpeechSynthesisVoice[], locale: string) {
  const normalizedLocale = locale.toLowerCase();
  const languageCode = normalizedLocale.split("-")[0];

  return (
    voices.find((voice) => voice.lang.toLowerCase() === normalizedLocale) ??
    voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(`${languageCode}-`),
    )
  );
}

const STORAGE_KEY = "bolo:voice-state:v1";

interface StoredVoiceState {
  transcript: string;
  languageChoice: string;
}

function getStoredVoiceState(): StoredVoiceState {
  const fallback = { transcript: "", languageChoice: "auto" };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return fallback;
    }

    const parsed = JSON.parse(storedValue) as Partial<StoredVoiceState>;
    const languageChoice = LANGUAGES.some(
      (language) => language.value === parsed.languageChoice,
    )
      ? parsed.languageChoice!
      : "auto";

    return {
      transcript: typeof parsed.transcript === "string" ? parsed.transcript : "",
      languageChoice,
    };
  } catch {
    return fallback;
  }
}

function vibrate(pattern: number | number[] = 12) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function subscribeToHydration() {
  return () => undefined;
}

function ActionButton({
  icon: Icon,
  activeIcon,
  label,
  ariaLabel,
  disabled,
  onClick,
  tone,
  reduceMotion,
}: {
  icon: LucideIcon;
  activeIcon?: ReactNode;
  label: string;
  ariaLabel: string;
  disabled?: boolean;
  onClick: () => void;
  tone: "violet" | "emerald" | "blue" | "rose";
  reduceMotion: boolean | null;
}) {
  const toneClasses = {
    violet:
      "hover:border-violet-400 hover:bg-violet-50 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10",
    emerald:
      "hover:border-emerald-400 hover:bg-emerald-50 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10",
    blue: "hover:border-sky-400 hover:bg-sky-50 dark:hover:border-sky-500/40 dark:hover:bg-sky-500/10",
    rose: "hover:border-rose-400 hover:bg-rose-50 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10",
  }[tone];

  return (
    <motion.div
      whileHover={reduceMotion || disabled ? undefined : { y: -3 }}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.96 }}
    >
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
        className={cn(
          "h-[78px] w-full flex-col gap-1.5 rounded-[1.4rem] border-slate-300/90 bg-white/92 px-2 text-slate-800 shadow-[0_14px_38px_-19px_rgba(38,42,90,0.42)] backdrop-blur-xl transition-[color,background-color,border-color,box-shadow] disabled:border-slate-300/75 disabled:bg-white/80 disabled:opacity-75 dark:border-white/8 dark:bg-white/[0.045] sm:h-[84px] sm:rounded-[1.55rem]",
          toneClasses,
        )}
      >
        <span className="grid size-8 place-items-center" aria-hidden="true">
          {activeIcon ?? <Icon className="size-6 sm:size-7" strokeWidth={1.9} />}
        </span>
        <span className="max-w-full truncate text-[0.72rem] font-bold tracking-wide text-slate-600 sm:text-xs">
          {label}
        </span>
      </Button>
    </motion.div>
  );
}

export function VoiceStudio() {
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [storedVoiceState] = useState(getStoredVoiceState);
  const [transcript, setTranscript] = useState(storedVoiceState.transcript);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [languageChoice, setLanguageChoice] = useState(
    storedVoiceState.languageChoice,
  );
  const [deviceLanguage] = useState(() =>
    typeof navigator === "undefined" ? "en-IN" : navigator.language || "en-IN",
  );
  const [copyComplete, setCopyComplete] = useState(false);
  const [pasteComplete, setPasteComplete] = useState(false);
  const [clearComplete, setClearComplete] = useState(false);

  const recognitionRef = useRef<BoloSpeechRecognition | null>(null);
  const keepListeningRef = useRef(false);
  const committedTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSupported = mounted
    ? Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  const effectiveLanguageChoice = mounted ? languageChoice : "auto";
  const effectiveDeviceLanguage = mounted ? deviceLanguage : "en-IN";
  const displayedTranscript = mounted ? transcript : "";

  const resolvedLocale = useMemo(() => {
    const selected = LANGUAGES.find(
      (language) => language.value === effectiveLanguageChoice,
    );
    return selected?.locale || effectiveDeviceLanguage;
  }, [effectiveDeviceLanguage, effectiveLanguageChoice]);

  const ui = useMemo(() => {
    const languageCode = resolvedLocale.toLowerCase().split("-")[0];
    return UI_STRINGS[languageCode] ?? UI_STRINGS.en;
  }, [resolvedLocale]);

  const selectedLanguage = LANGUAGES.find(
    (language) => language.value === effectiveLanguageChoice,
  );
  const selectedLanguageLabel =
    selectedLanguage?.value === "auto" ? ui.auto : selectedLanguage?.label;

  const statusLabel = {
    idle: "",
    listening: ui.listening,
    speaking: ui.playing,
    error: ui.tryAgain,
  }[status];

  const visibleStatusLabel =
    isSupported === false ? ui.voiceUnavailable : statusLabel;

  const hasText = Boolean((displayedTranscript + interimTranscript).trim());
  const textLocale = useMemo(
    () =>
      detectTextLocale(
        [displayedTranscript, interimTranscript].filter(Boolean).join(" "),
        effectiveDeviceLanguage,
      ),
    [displayedTranscript, effectiveDeviceLanguage, interimTranscript],
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setStatus((current) => (current === "speaking" ? "idle" : current));
  }, []);

  const speakShortFeedback = useCallback(
    (message: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setStatus((current) => (current === "speaking" ? "idle" : current));
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = resolvedLocale;
      utterance.rate = 0.95;
      utterance.volume = 0.82;
      window.speechSynthesis.speak(utterance);
    },
    [resolvedLocale],
  );

  const showMomentaryState = useCallback(
    (setter: (value: boolean) => void) => {
      setter(true);
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = setTimeout(() => setter(false), 1500);
    },
    [],
  );

  const stopListening = useCallback((commitInterim = true) => {
    keepListeningRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    const currentInterim = interimTranscriptRef.current.trim();
    if (commitInterim && currentInterim) {
      const combined = [committedTranscriptRef.current, currentInterim]
        .filter(Boolean)
        .join(" ");
      committedTranscriptRef.current = combined;
      setTranscript(combined);
    }

    interimTranscriptRef.current = "";
    setInterimTranscript("");
    setIsListening(false);
    setStatus("idle");

    try {
      recognitionRef.current?.stop();
    } catch {
      recognitionRef.current?.abort();
    }
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setStatus("error");
      toast.error(ui.unavailable);
      speakShortFeedback(ui.unavailable);
      return;
    }

    stopSpeaking();
    committedTranscriptRef.current = transcript.trim();
    interimTranscriptRef.current = "";
    setInterimTranscript("");
    keepListeningRef.current = true;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = resolvedLocale;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("listening");
      vibrate(14);
    };

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const words = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalChunk += words;
        } else {
          interimChunk += words;
        }
      }

      const finalText = finalChunk.trim();
      const interimText = interimChunk.trim();

      if (finalText) {
        const combined = [committedTranscriptRef.current, finalText]
          .filter(Boolean)
          .join(" ");
        committedTranscriptRef.current = combined;
        setTranscript(combined);
      }

      interimTranscriptRef.current = interimText;
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }

      keepListeningRef.current = false;
      setIsListening(false);
      setStatus("error");
      vibrate([30, 35, 30]);

      const permissionMessage =
        event.error === "not-allowed"
          ? ui.microphonePermission
          : ui.tryAgain;
      toast.error(permissionMessage);
    };

    recognition.onend = () => {
      if (keepListeningRef.current) {
        restartTimerRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch {
            keepListeningRef.current = false;
            setIsListening(false);
            setStatus("error");
          }
        }, 250);
        return;
      }

      setIsListening(false);
      setStatus((current) => (current === "listening" ? "idle" : current));
    };

    try {
      recognition.start();
      setStatus("listening");
    } catch {
      keepListeningRef.current = false;
      setIsListening(false);
      setStatus("error");
      toast.error(ui.tryAgain);
    }
  }, [resolvedLocale, speakShortFeedback, stopSpeaking, transcript, ui]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      vibrate(10);
      return;
    }

    startListening();
  }, [isListening, startListening, stopListening]);

  const listenBack = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error(ui.listenUnavailable);
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      vibrate(10);
      return;
    }

    const text = [transcript, interimTranscript].filter(Boolean).join(" ").trim();
    if (!text) {
      toast(ui.noText, { icon: <Mic className="size-4" /> });
      speakShortFeedback(ui.noText);
      vibrate([18, 25, 18]);
      return;
    }

    if (isListening) {
      stopListening();
    }

    const speechLocale = detectTextLocale(text, effectiveDeviceLanguage);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLocale;
    utterance.rate = 0.92;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = findMatchingVoice(voices, speechLocale);
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatus("speaking");
      vibrate(12);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setStatus("idle");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatus("error");
      toast.error(ui.tryAgain);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [
    interimTranscript,
    effectiveDeviceLanguage,
    isListening,
    isSpeaking,
    speakShortFeedback,
    stopListening,
    stopSpeaking,
    transcript,
    ui,
  ]);

  const pasteText = useCallback(async () => {
    try {
      if (!navigator.clipboard?.readText) {
        throw new Error("Clipboard reading is unavailable");
      }

      const clipboardText = (await navigator.clipboard.readText()).trim();
      if (!clipboardText) {
        toast(ui.emptyClipboard, { icon: <ClipboardPaste className="size-4" /> });
        speakShortFeedback(ui.emptyClipboard);
        vibrate([18, 25, 18]);
        return;
      }

      if (isListening) {
        stopListening(false);
      }
      stopSpeaking();
      committedTranscriptRef.current = clipboardText;
      interimTranscriptRef.current = "";
      setTranscript(clipboardText);
      setInterimTranscript("");
      setStatus("idle");
      showMomentaryState(setPasteComplete);
      toast.success(ui.pasted, { icon: <Check className="size-4" /> });
      speakShortFeedback(ui.pasted);
      vibrate([12, 30, 18]);
    } catch {
      toast.error(ui.pasteFailed);
      speakShortFeedback(ui.pasteFailed);
      vibrate([30, 35, 30]);
    }
  }, [
    isListening,
    showMomentaryState,
    speakShortFeedback,
    stopListening,
    stopSpeaking,
    ui.emptyClipboard,
    ui.pasteFailed,
    ui.pasted,
  ]);

  const copyText = useCallback(async () => {
    const text = [transcript, interimTranscript].filter(Boolean).join(" ").trim();
    if (!text) {
      toast(ui.noText, { icon: <Mic className="size-4" /> });
      speakShortFeedback(ui.noText);
      vibrate([18, 25, 18]);
      return;
    }

    if (isListening) {
      stopListening();
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }

      showMomentaryState(setCopyComplete);
      toast.success(ui.copied, { icon: <Check className="size-4" /> });
      speakShortFeedback(ui.copied);
      vibrate([12, 30, 18]);
    } catch {
      toast.error(ui.copyFailed);
      vibrate([30, 35, 30]);
    }
  }, [
    interimTranscript,
    isListening,
    showMomentaryState,
    speakShortFeedback,
    stopListening,
    transcript,
    ui,
  ]);

  const clearText = useCallback(() => {
    if (!hasText) {
      return;
    }

    stopListening(false);
    stopSpeaking();
    committedTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setStatus("idle");
    showMomentaryState(setClearComplete);
    toast.success(ui.cleared, { icon: <Sparkles className="size-4" /> });
    speakShortFeedback(ui.cleared);
    vibrate([12, 28, 12]);
  }, [
    hasText,
    showMomentaryState,
    speakShortFeedback,
    stopListening,
    stopSpeaking,
    ui.cleared,
  ]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ transcript, languageChoice }),
      );
    } catch {
      // Private browsing modes can disable storage; the app still works in memory.
    }
  }, [languageChoice, mounted, transcript]);

  useEffect(() => {
    return () => {
      keepListeningRef.current = false;
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  return (
    <div
      className="bolo-shell relative min-h-dvh overflow-hidden text-foreground"
      lang={resolvedLocale}
    >
      <div className="bolo-grid pointer-events-none absolute inset-0 opacity-45 dark:opacity-25" />

      <header className="relative z-20 mx-auto flex h-[68px] w-full max-w-5xl items-center justify-end px-4 sm:h-[80px] sm:px-8">
        <label className="group relative flex h-11 items-center gap-2 rounded-2xl border border-indigo-200/90 bg-white/92 px-3 text-slate-800 shadow-[0_12px_34px_-17px_rgba(35,39,88,0.45)] backdrop-blur-xl transition-colors hover:border-indigo-300 hover:bg-white focus-within:ring-4 focus-within:ring-violet-500/20 sm:h-12 sm:px-3.5">
          <Globe2 className="size-[18px] text-slate-600" aria-hidden="true" />
          <span className="max-w-[5rem] truncate text-xs font-semibold sm:text-sm">
            {selectedLanguageLabel}
          </span>
          <ChevronDown className="size-3.5 text-slate-600" aria-hidden="true" />
          <select
            aria-label={ui.speechLanguage}
            value={effectiveLanguageChoice}
            disabled={isListening}
            onChange={(event) => setLanguageChoice(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          >
            {LANGUAGES.map((language) => (
              <option key={language.value} value={language.value}>
                {language.value === "auto" ? ui.auto : language.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-10">
        <h1 className="sr-only">{ui.voiceToText}</h1>

        {visibleStatusLabel ? (
          <div
            className={cn(
              "mb-3 flex h-8 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold shadow-sm backdrop-blur-lg transition-colors sm:mb-4 sm:h-9 sm:text-sm",
              isListening
                ? "border-violet-300/70 bg-violet-50/85 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200"
                : isSpeaking
                  ? "border-sky-300/70 bg-sky-50/85 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200"
                  : "border-black/6 bg-white/58 text-muted-foreground dark:border-white/8 dark:bg-white/[0.045]",
            )}
            role="status"
            aria-live="polite"
          >
            {isListening ? (
              <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
                {[0, 1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className="listening-bar w-[2px] rounded-full bg-current"
                    style={{ animationDelay: `${bar * 90}ms` }}
                  />
                ))}
              </span>
            ) : isSpeaking ? (
              <Volume2 className="size-3.5" aria-hidden="true" />
            ) : (
              <span className="size-2 rounded-full bg-rose-500" aria-hidden="true" />
            )}
            {visibleStatusLabel}
          </div>
        ) : null}

        <Card className="transcript-card relative min-h-[218px] w-full overflow-hidden border-indigo-200/80 bg-white/92 shadow-[0_30px_75px_-34px_rgba(38,42,105,0.5)] backdrop-blur-2xl dark:border-white/8 dark:bg-white/[0.048] sm:min-h-[250px] lg:min-h-[270px]">
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-[3px] origin-left bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-400 transition-opacity",
              isListening ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />
          <CardContent className="flex min-h-[218px] items-center justify-center sm:min-h-[250px] lg:min-h-[270px]">
            <AnimatePresence mode="wait" initial={false}>
              {hasText ? (
                <motion.div
                  key="transcript"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.24 }}
                  className="max-h-[190px] w-full overflow-y-auto overscroll-contain px-1 py-1 sm:max-h-[220px]"
                  aria-live="polite"
                  aria-atomic="false"
                  lang={textLocale}
                  dir="auto"
                >
                  <p className="text-center text-[1.55rem] font-medium leading-[1.48] tracking-[-0.025em] text-balance sm:text-[1.85rem] lg:text-[2.05rem]">
                    <span>{displayedTranscript}</span>
                    {displayedTranscript && interimTranscript ? " " : null}
                    <span className="text-muted-foreground/75">{interimTranscript}</span>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  className="flex flex-col items-center gap-5"
                  aria-hidden="true"
                >
                  <div className="relative grid size-[76px] place-items-center rounded-[1.65rem] border border-violet-300 bg-gradient-to-br from-violet-100 to-indigo-50 text-violet-700 shadow-[0_16px_38px_-18px_rgba(87,69,230,0.55)] dark:border-violet-400/15 dark:from-violet-500/14 dark:to-indigo-500/5 dark:text-violet-300">
                    <AudioLines className="size-8" strokeWidth={1.75} />
                  </div>
                  <div className="flex h-7 items-center gap-1.5 text-violet-500/90 dark:text-violet-300/45">
                    {[8, 15, 22, 12, 18, 9, 14].map((height, index) => (
                      <motion.span
                        key={`${height}-${index}`}
                        className="w-1 rounded-full bg-current"
                        animate={
                          reduceMotion
                            ? { height }
                            : { height: [height, Math.max(7, height - 6), height] }
                        }
                        transition={{
                          duration: 1.6,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: index * 0.08,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <AnimatePresence>
            {clearComplete ? (
              <motion.div
                className="pointer-events-none absolute inset-0 grid place-items-center bg-white/86 backdrop-blur-sm dark:bg-[#151722]/90"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                aria-hidden="true"
              >
                <motion.div
                  initial={reduceMotion ? false : { scale: 0.7, rotate: -14 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="grid size-20 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_16px_45px_-14px_rgba(16,185,129,0.65)]"
                >
                  <Check className="size-9" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Card>

        <section
          className="relative flex w-full flex-col items-center py-4 sm:py-5"
          aria-label={ui.voiceInput}
        >
          <div className="relative grid size-[164px] place-items-center sm:size-[180px]">
            {[0, 1, 2].map((ring) => (
              <motion.span
                key={ring}
                className="absolute size-[132px] rounded-full border border-violet-400/30 bg-violet-400/8 dark:border-violet-300/18 dark:bg-violet-300/5 sm:size-[146px]"
                initial={false}
                animate={
                  isListening && !reduceMotion
                    ? { scale: [1, 1.42], opacity: [0.55, 0] }
                    : { scale: 1, opacity: 0 }
                }
                transition={{
                  duration: 2,
                  delay: ring * 0.48,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeOut",
                }}
                aria-hidden="true"
              />
            ))}

            <motion.div
              whileHover={reduceMotion ? undefined : { scale: 1.025 }}
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              animate={
                isListening && !reduceMotion
                  ? { y: [0, -2, 0], scale: [1, 1.015, 1] }
                  : { y: 0, scale: 1 }
              }
              transition={
                isListening
                  ? { duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
                  : { type: "spring", stiffness: 400, damping: 24 }
              }
              className="relative z-10"
            >
              <Button
                type="button"
                aria-label={isListening ? ui.stopListening : ui.startListening}
                aria-pressed={isListening}
                disabled={isSupported === false}
                onClick={toggleListening}
                className={cn(
                  "mic-button relative size-[132px] overflow-hidden rounded-full border-[7px] border-white/85 text-white shadow-[0_25px_55px_-16px_rgba(93,78,230,0.72),inset_0_1px_0_rgba(255,255,255,0.36)] focus-visible:ring-4 focus-visible:ring-violet-500/35 dark:border-[#272936] sm:size-[146px]",
                  isListening
                    ? "bg-gradient-to-br from-rose-500 to-orange-500 hover:from-rose-500 hover:to-orange-500"
                    : "bg-gradient-to-br from-[#7467ff] via-[#6258ee] to-[#4d46d8] hover:brightness-105",
                )}
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_32%_18%,rgba(255,255,255,0.30),transparent_42%)]" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={isListening ? "stop" : "mic"}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.65, rotate: -8 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, scale: 0.65, rotate: 8 }}
                    transition={{ duration: 0.18 }}
                    className="relative grid place-items-center"
                  >
                    {isListening ? (
                      <Square className="size-11 fill-current sm:size-12" strokeWidth={1.5} />
                    ) : (
                      <Mic className="size-14 sm:size-[3.75rem]" strokeWidth={1.8} />
                    )}
                  </motion.span>
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </section>

        <section
          className="grid w-full max-w-[760px] grid-cols-4 gap-2 sm:gap-4"
          aria-label={ui.textActions}
        >
          <ActionButton
            icon={isSpeaking ? VolumeX : Volume2}
            label={ui.buttonListen}
            ariaLabel={isSpeaking ? ui.stopReading : ui.readAloud}
            disabled={!hasText}
            onClick={listenBack}
            tone="violet"
            reduceMotion={reduceMotion}
          />
          <ActionButton
            icon={ClipboardPaste}
            label={ui.buttonPaste}
            activeIcon={
              pasteComplete ? (
                <motion.span
                  initial={reduceMotion ? false : { scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="grid size-8 place-items-center rounded-full bg-emerald-500 text-white"
                >
                  <Check className="size-5" strokeWidth={2.5} />
                </motion.span>
              ) : undefined
            }
            ariaLabel={ui.pasteText}
            onClick={pasteText}
            tone="emerald"
            reduceMotion={reduceMotion}
          />
          <ActionButton
            icon={Copy}
            label={ui.buttonCopy}
            activeIcon={
              copyComplete ? (
                <motion.span
                  initial={reduceMotion ? false : { scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="grid size-8 place-items-center rounded-full bg-emerald-500 text-white"
                >
                  <Check className="size-5" strokeWidth={2.5} />
                </motion.span>
              ) : undefined
            }
            ariaLabel={ui.copyText}
            disabled={!hasText}
            onClick={copyText}
            tone="blue"
            reduceMotion={reduceMotion}
          />
          <ActionButton
            icon={Trash2}
            label={ui.buttonClear}
            ariaLabel={ui.clearText}
            disabled={!hasText}
            onClick={clearText}
            tone="rose"
            reduceMotion={reduceMotion}
          />
        </section>

      </main>
    </div>
  );
}
