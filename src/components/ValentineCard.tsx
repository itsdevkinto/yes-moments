import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";
import {
  ThemeConfig,
  getThemeById,
  getDecorationById,
  DecorationType,
} from "@/lib/themes";

const NO_DODGE_EMOJIS = [
  "😭",
  "🥺",
  "💔",
  "😢",
  "❤️",
  "💕",
  "😿",
  "🙏",
  "✨",
  "💔",
];
const BEGGING_COOLDOWN_MS = 600;

/**
 * Celebration music after YES chime.
 * Use the video ID from a YouTube URL: youtube.com/watch?v=VIDEO_ID
 * If you see "Video unavailable": the uploader must allow embedding (YouTube Studio → Video → Show more → Allow embedding).
 */
const CELEBRATION_YOUTUBE_VIDEO_ID = "GOXGbr10i8s";

let sharedAudioContext: AudioContext | null = null;
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioContext) {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      sharedAudioContext = new Ctx();
    } catch {
      return null;
    }
  }
  return sharedAudioContext;
}

function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx?.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

function playChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio not supported or blocked
  }
}

function playPop(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(200 + Math.random() * 300, ctx.currentTime);
    osc.type = "sine";
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio not supported or blocked
  }
}

interface ValentineCardProps {
  pageId: string;
  question: string;
  beggingMessages: string[];
  finalMessage: string;
  socialLabel: string | null;
  socialLink: string | null;
  senderName: string | null;
  receiverName: string | null;
  alreadyAccepted?: boolean;
  existingScreenshotUrl?: string | null;
  theme?: string;
  decorationType?: DecorationType;
}

const ValentineCard = ({
  pageId,
  question,
  beggingMessages,
  finalMessage,
  socialLabel,
  socialLink,
  senderName,
  receiverName,
  alreadyAccepted = false,
  existingScreenshotUrl = null,
  theme = "romantic",
  decorationType = "hearts",
}: ValentineCardProps) => {
  const blockYesRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [noDodging, setNoDodging] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noAttempts, setNoAttempts] = useState(0);
  const [yesClicked, setYesClicked] = useState(alreadyAccepted);
  const [isProcessing, setIsProcessing] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(
    existingScreenshotUrl,
  );
  const [floatingEmojis, setFloatingEmojis] = useState<
    { id: number; emoji: string; x: number; y: number }[]
  >([]);
  const [showCelebrationMusic, setShowCelebrationMusic] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastDodgeTimeRef = useRef(0);
  const emojiIdRef = useRef(0);

  const themeConfig = getThemeById(theme);
  const decoration = getDecorationById(decorationType);
  const mainEmoji = decoration.symbols[0] || "💕";

  const pleaseSayYesGif = "/yes-moments/please-say-yes.gif";
  const youSaidYesVideo = "/yes-moments/you-said-yes.mp4";

  const currentBeggingMessage =
    noAttempts > 0
      ? beggingMessages[Math.min(noAttempts - 1, beggingMessages.length - 1)]
      : null;

  const hideNoButton = noAttempts > 10;

  const yesButtonSize = Math.min(1 + noAttempts * 0.5, 3.8);

  const BASE_PEEK = 120; // 👈 much more visible
  const cursorRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const dodgeNoMobile = useCallback(() => {
    setNoDodging(true);
    setTimeout(() => setNoDodging(false), 200);
    const maxX = 150;
    const maxY = 100;
    const newX = (Math.random() - 0.5) * maxX * 2;
    const newY = (Math.random() - 0.5) * maxY * 2;
    setNoPosition({ x: newX, y: newY });
    setNoAttempts((prev) => prev + 1);

    playPop();
    const count = 2 + Math.floor(Math.random() * 2);
    const newEmojis: { id: number; emoji: string; x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      emojiIdRef.current += 1;
      newEmojis.push({
        id: emojiIdRef.current,
        emoji:
          NO_DODGE_EMOJIS[Math.floor(Math.random() * NO_DODGE_EMOJIS.length)],
        x: 15 + Math.random() * 70,
        y: 10 + Math.random() * 50,
      });
    }
    setFloatingEmojis((prev) => [...prev, ...newEmojis]);
    newEmojis.forEach((e) => {
      setTimeout(() => {
        setFloatingEmojis((list) => list.filter((x) => x.id !== e.id));
      }, 1600);
    });
  }, []);

  const dodgeNoDesktop = useCallback(() => {
    const now = Date.now();
    if (now - lastDodgeTimeRef.current < BEGGING_COOLDOWN_MS) return;
    lastDodgeTimeRef.current = now;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Get cursor distance from center (for tease boost)
    const dx = cursorRef.current.x - vw / 2;
    const dy = cursorRef.current.y - vh / 2;
    const distance = Math.hypot(dx, dy);
    const teaseBoost = Math.max(0, 180 - distance); // closer = more aggressive
    const peek = BASE_PEEK + teaseBoost * 0.4;

    // Decide which edge to go towards
    const edge = Math.random();
    let targetX: number;
    let targetY: number;

    if (edge < 0.25) {
      // left edge
      targetX = -vw / 2 + peek;
      targetY = (Math.random() - 0.5) * vh * 0.7;
    } else if (edge < 0.5) {
      // right edge
      targetX = vw / 2 - peek;
      targetY = (Math.random() - 0.5) * vh * 0.7;
    } else if (edge < 0.75) {
      // top edge
      targetX = (Math.random() - 0.5) * vw * 0.7;
      targetY = -vh / 2 + peek;
    } else {
      // bottom edge
      targetX = (Math.random() - 0.5) * vw * 0.7;
      targetY = vh / 2 - peek;
    }

    // === IMPORTANT: CLAMP so button stays visible ===
    // Assuming your button is ~100–140px wide/tall
    const buttonSize = 140; // adjust to your actual button width/height
    const margin = 90; // minimum visible pixels on each side

    const minX = -vw / 2 + buttonSize / 2 + margin;
    const maxX = vw / 2 - buttonSize / 2 - margin;
    const minY = -vh / 2 + buttonSize / 2 + margin;
    const maxY = vh / 2 - buttonSize / 2 - margin;

    targetX = Math.max(minX, Math.min(maxX, targetX));
    targetY = Math.max(minY, Math.min(maxY, targetY));

    // Optional: even more visible if cursor is very close
    if (distance < 120) {
      targetX = Math.max(minX + 40, Math.min(maxX - 40, targetX));
      targetY = Math.max(minY + 40, Math.min(maxY - 40, targetY));
    }

    // Apply fake-out hop
    setNoPosition((pos) => ({
      x: pos.x * 0.5,
      y: pos.y * 0.5,
    }));

    setTimeout(() => {
      setNoPosition({ x: targetX, y: targetY });
    }, 70);

    // speed variation
    const speed = 0.35 + Math.random() * 0.5;
    document.documentElement.style.setProperty("--fly-speed", `${speed}s`);

    setNoAttempts((p) => p + 1);

    playPop();
    const count = 2 + Math.floor(Math.random() * 2);
    const newEmojis: { id: number; emoji: string; x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      emojiIdRef.current += 1;
      newEmojis.push({
        id: emojiIdRef.current,
        emoji:
          NO_DODGE_EMOJIS[Math.floor(Math.random() * NO_DODGE_EMOJIS.length)],
        x: 15 + Math.random() * 70,
        y: 10 + Math.random() * 50,
      });
    }
    setFloatingEmojis((prev) => [...prev, ...newEmojis]);
    newEmojis.forEach((e) => {
      setTimeout(() => {
        setFloatingEmojis((list) => list.filter((x) => x.id !== e.id));
      }, 1600);
    });
  }, []);

  const dodgeNo = useCallback(() => {
    if (isMobile) {
      dodgeNoMobile();
    } else {
      dodgeNoDesktop();
    }
  }, [isMobile, dodgeNoMobile, dodgeNoDesktop]);

  const handleNoTouch = (e: React.TouchEvent) => {
    blockYesRef.current = true;
  
    e.preventDefault();
    e.stopPropagation();
  
    dodgeNo();
  
    // Re-enable YES on next frame (after click synthesis window)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        blockYesRef.current = false;
      });
    });
  };
  

  const triggerConfetti = useCallback(() => {
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const colors = [
      `hsl(${themeConfig.colors.primary})`,
      `hsl(${themeConfig.colors.secondary})`,
      `hsl(${themeConfig.colors.accent})`,
    ];

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors,
        shapes: ["circle"],
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000,
      });
      confetti({
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors,
        shapes: ["circle"],
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000,
      });
    }, 250);

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors,
    });
  }, [themeConfig]);

  const screenshotRef = useRef<HTMLDivElement>(null);
  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    if (!screenshotRef.current) return null;

    try {
      // Wait for React to paint the celebration view, then for animations to settle
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });
      await new Promise((resolve) => setTimeout(resolve, 2600));

      const canvas = await html2canvas(screenshotRef.current, {
        backgroundColor: `hsl(${themeConfig.colors.background})`,
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: false,
        onclone: (clonedDoc, element) => {
          // Ensure styles are properly applied in the clone
          element.style.transform = "none";
          element.style.opacity = "1";
        },
      });

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Screenshot failed:", error);
      return null;
    }
  }, [themeConfig]);

  const uploadScreenshot = useCallback(
    async (base64Image: string): Promise<string | null> => {
      try {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/png" });

        const fileName = `${pageId}-${Date.now()}.png`;
        const { data, error } = await supabase.storage
          .from("screenshots")
          .upload(fileName, blob, {
            contentType: "image/png",
          });

        if (error) {
          console.error("Upload error:", error);
          return null;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("screenshots").getPublicUrl(data.path);

        return publicUrl;
      } catch (error) {
        console.error("Upload failed:", error);
        return null;
      }
    },
    [pageId],
  );

  const notifyCreator = useCallback(
    async (uploadedUrl: string | null) => {
      try {
        const { error } = await supabase.functions.invoke("notify-yes", {
          body: { pageId, screenshotUrl: uploadedUrl, receiverName },
        });
        if (error) {
          console.error("Notification error:", error);
        }
      } catch (error) {
        console.error("Failed to notify creator:", error);
      }
    },
    [pageId, receiverName],
  );

  const handleYesClick = useCallback(async () => {
    if (blockYesRef.current) return;
    if (yesClicked || isProcessing) return;

    setIsProcessing(true);
    setYesClicked(true);
    triggerConfetti();
    playChime();

    if (CELEBRATION_YOUTUBE_VIDEO_ID) {
      setTimeout(() => setShowCelebrationMusic(true), 400);
    }

    try {
      // Wait for celebration view to render before capturing (confetti + UI transition)
      await new Promise((resolve) => setTimeout(resolve, 2400));
      const base64Image = await captureScreenshot();
      let uploadedUrl: string | null = null;

      if (base64Image) {
        uploadedUrl = await uploadScreenshot(base64Image);
        setScreenshotUrl(uploadedUrl);
      }

      // Record the YES event
      const { error } = await supabase.from("yes_events").insert({
        page_id: pageId,
        screenshot_url: uploadedUrl,
      });

      if (error && !error.message.includes("duplicate")) {
        console.error("Error recording yes:", error);
      }

      // Send notification to creator
      await notifyCreator(uploadedUrl);
    } catch (error) {
      console.error("Error processing yes:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    yesClicked,
    isProcessing,
    triggerConfetti,
    captureScreenshot,
    uploadScreenshot,
    pageId,
    notifyCreator,
  ]);

  const downloadScreenshot = useCallback(async () => {
    if (screenshotUrl) {
      const link = document.createElement("a");
      link.href = screenshotUrl;
      link.download = `valentine-${pageId}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const base64Image = await captureScreenshot();
      if (base64Image) {
        const link = document.createElement("a");
        link.href = base64Image;
        link.download = `valentine-${pageId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }, [screenshotUrl, pageId, captureScreenshot]);

  // Theme-specific styles
  const cardStyle = {
    background: themeConfig.gradient,
    "--theme-primary": themeConfig.colors.primary,
    "--theme-foreground": themeConfig.colors.foreground,
  } as React.CSSProperties;

  return (
    <div
      className="w-full max-w-lg mx-auto px-4"
      onClick={unlockAudio}
      role="presentation"
    >
      <div ref={screenshotRef} className="relative overflow-visible">
        {floatingEmojis.map(({ id, emoji, x, y }) => (
          <motion.span
            key={id}
            className="pointer-events-none absolute text-2xl sm:text-3xl drop-shadow-lg z-10"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.4, 1.2], opacity: [1, 1, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {emoji}
          </motion.span>
        ))}
        <motion.div
          ref={cardRef}
          className="rounded-2xl p-8 relative overflow-visible text-center"
          style={cardStyle}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <AnimatePresence mode="wait">
            {!yesClicked ? (
              <motion.div
                key="question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="space-y-6"
              >
                {/* Sender & Receiver */}
                {(senderName || receiverName) && (
                  <p className="text-white/80 text-sm">
                    {senderName && (
                      <>
                        From{" "}
                        <span className="font-semibold text-white">
                          {senderName}
                        </span>
                      </>
                    )}
                    {senderName && receiverName && " · "}
                    {receiverName && (
                      <>
                        To{" "}
                        <span className="font-semibold text-white">
                          {receiverName}
                        </span>
                      </>
                    )}
                  </p>
                )}

                {/* Please say yes – main visual for every theme */}
                <motion.div
                  className="flex justify-center"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <img
                    src={pleaseSayYesGif}
                    alt="Please say yes"
                    className="w-24 h-24 object-contain"
                  />
                </motion.div>

                {/* Question */}
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white drop-shadow-lg">
                  {question}
                </h1>

                {/* Begging message */}
                <AnimatePresence mode="wait">
                  {currentBeggingMessage && (
                    <motion.p
                      key={noAttempts}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-lg text-white font-medium animate-wiggle"
                    >
                      {currentBeggingMessage}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className="flex justify-center items-center gap-6 pt-4 relative min-h-[80px]">
                  {/* YES Button */}
                  <motion.div
                    className="relative z-10"
                    animate={{ scale: yesButtonSize }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Button
                      onClick={handleYesClick}
                      disabled={isProcessing || (isMobile && blockYesRef.current)}
                      className="text-lg px-8 py-4 bg-white text-pink-600 hover:bg-white/90 shadow-xl pulse-glow"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Yes!
                    </Button>
                  </motion.div>

                  {/* NO Button */}
                  <motion.div
                    animate={{ x: noPosition.x, y: noPosition.y }}
                    style={{ pointerEvents: noDodging ? "none" : "auto" }}
                    className="relative z-20"
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Button
                      onMouseEnter={!isMobile ? dodgeNo : undefined}
                      onTouchStart={isMobile ? handleNoTouch : undefined}
                      onClick={(e) => {
                        if (isMobile) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      variant="outline"
                      className={`text-lg px-8 py-4 bg-gray-500/40 border-white/40 text-white hover:bg-white/30 ${hideNoButton ? "" : ""} no-button ${noAttempts > 4 ? "shake" : ""}`}
                    >
                      No
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="space-y-6"
              >
                {/* You said yes – celebration video */}
                <motion.div
                  className="flex justify-center"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <video
                    src={youSaidYesVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-32 h-32 object-contain"
                    aria-label="You said yes"
                  />
                </motion.div>

                {/* Sender name */}
                {senderName && (
                  <motion.h2
                    className="text-4xl font-serif font-bold text-white drop-shadow-lg"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {senderName} {mainEmoji}
                  </motion.h2>
                )}

                {/* Final message */}
                <motion.p
                  className="text-xl text-white font-medium"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {finalMessage}
                </motion.p>

                {/* Social link */}
                {socialLink && socialLabel && (
                  <motion.a
                    href={socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="inline-flex items-center gap-2 bg-white text-pink-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {socialLabel} 💌
                  </motion.a>
                )}

                {/* Download button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={downloadScreenshot}
                    variant="outline"
                    className="bg-white/20 border-white/40 text-white hover:bg-white/30 mt-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Save this moment 💾
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {showCelebrationMusic && CELEBRATION_YOUTUBE_VIDEO_ID && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg overflow-hidden shadow-xl border-2 border-white/30">
          <iframe
            title="YouTube video player"
            width="280"
            height="158"
            src={`https://www.youtube.com/embed/${CELEBRATION_YOUTUBE_VIDEO_ID}?autoplay=1&si=CP0RLpMBpUfD8N0A`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="block"
          />
        </div>
      )}
    </div>
  );
};

export default ValentineCard;
