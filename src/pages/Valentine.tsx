import AkoNalangSana from "../assets/Ako-nalang-sana.mp4";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import ValentineCard from "@/components/ValentineCard";
import FloatingDecorations from "@/components/FloatingDecorations";
import { supabase } from "@/integrations/supabase/client";
import { ThemeConfig, getThemeById, DecorationType } from "@/lib/themes";
import { Button } from "@/components/ui/button";

interface PageData {
  id: string;
  question: string;
  begging_messages: string[];
  final_message: string;
  social_label: string | null;
  social_link: string | null;
  sender_name: string | null;
  receiver_name: string | null;
  theme: string;
  decoration_type: string;
  custom_decoration_url: string | null;
}

interface YesEvent {
  clicked_at: string;
  screenshot_url: string | null;
}

const Valentine = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [yesEvent, setYesEvent] = useState<YesEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showIntro, setShowIntro] = useState(true); // New state for intro screen

  useEffect(() => {
    const fetchPage = async () => {
      if (!pageId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch page data
        const { data: page, error: pageError } = await supabase
          .from("valentine_pages")
          .select("*")
          .eq("id", pageId)
          .maybeSingle();

        if (pageError || !page) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setPageData(page);

        // Check if already accepted
        const { data: existingYes } = await supabase
          .from("yes_events")
          .select("clicked_at, screenshot_url")
          .eq("page_id", pageId)
          .maybeSingle();

        if (existingYes) {
          setYesEvent(existingYes);
        }
      } catch (error) {
        console.error("Error fetching page:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId]);

  // Apply theme colors to page
  useEffect(() => {
    if (pageData) {
      const theme = getThemeById(pageData.theme);
      document.documentElement.style.setProperty(
        "--primary",
        theme.colors.primary,
      );
      document.documentElement.style.setProperty(
        "--secondary",
        theme.colors.secondary,
      );
      document.documentElement.style.setProperty(
        "--accent",
        theme.colors.accent,
      );
      document.documentElement.style.setProperty(
        "--background",
        theme.colors.lightBackground,
      );
      document.documentElement.style.setProperty(
        "--foreground",
        theme.colors.foreground,
      );
      document.documentElement.style.setProperty("--muted", theme.colors.muted);
      document.documentElement.style.setProperty("--card", theme.colors.card);
    }
    return () => {
      // Reset to default on unmount
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--secondary");
      document.documentElement.style.removeProperty("--accent");
      document.documentElement.style.removeProperty("--background");
      document.documentElement.style.removeProperty("--foreground");
      document.documentElement.style.removeProperty("--muted");
      document.documentElement.style.removeProperty("--card");
    };
  }, [pageData]);
  const handleIntroClick = () => {
    // Open the envelope immediately
    setIsOpen(true);

    // After 600ms (or whatever duration you want), hide the intro
    setTimeout(() => {
      setShowIntro(false);
    }, 2500); // delay in milliseconds
  };

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes slideUp {
        0% { top: 0; }
        100% { top: -600px; }
      }
      @keyframes sideSway {
        0% { margin-left: 0px; }
        100% { margin-left: 50px; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const musicVideoRef = useRef(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    // Only add listener if we need to start playback
    if (!hasUserInteracted) {
      const handleUserInteraction = () => {
        if (musicVideoRef.current) {
          musicVideoRef.current.play().catch((e) => {
            console.log("Autoplay with sound blocked:", e);
          });
        }
        setHasUserInteracted(true);
        window.removeEventListener("click", handleUserInteraction);
      };

      window.addEventListener("click", handleUserInteraction, { once: true });
    }
  }, [hasUserInteracted]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading your surprise...</p>
        </motion.div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <FloatingDecorations decorationType="hearts" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8"
        >
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Valentine Not Found
          </h1>
          <p className="text-muted-foreground">
            This love letter doesn't exist or has been removed 💔
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
          {/* Background layer with gradient + floating decorations */}
          <div className="fixed inset-0 pointer-events-none z-[-1] bg-background">
        <FloatingDecorations
          decorationType={
            (pageData?.decoration_type || "hearts") as DecorationType
          }
          customImageUrl={pageData?.custom_decoration_url}
        />
      </div>
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 bg-transparent">
  
          {showIntro ? (
            <div
              id="envelope"
              className={`relative w-[280px] h-[180px] bg-[hsl(var(--primary))] rounded-bl-md rounded-br-md mx-auto shadow-[0_4px_20px_rgba(0,0,0,0.2)] perspective-[1000px] ${isOpen ? "open" : "close"}`}
              onClick={handleIntroClick}
            >
              <div
                className={`front flap absolute w-0 h-0 z-[1] border-l-[140px] border-l-transparent border-r-[140px] border-r-transparent border-b-[82px] border-b-transparent border-t-[98px] border-t-[hsl(var(--primary))] [transform-origin:top] pointer-events-none [transform-style:preserve-3d] ${
                  isOpen
                    ? "[transform:rotateX(180deg)] [transition:transform_0.4s_ease,z-index_0.6s] z-[1]"
                    : "[transform:rotateX(0deg)] [transition:transform_0.4s_0.6s_ease,z-index_1s] z-[5]"
                }`}
              ></div>
              <div className="front pocket absolute w-0 h-0 z-[3] border-l-[140px] border-l-[color-mix(in_srgb,hsl(var(--primary))_60%,white)] border-r-[140px] border-r-[color-mix(in_srgb,hsl(var(--primary))_60%,white)] border-b-[90px] border-b-[hsl(var(--accent))] border-t-[90px] border-t-transparent rounded-bl-md rounded-br-md"></div>
              <div
                className={`letter relative bg-white w-[90%] mx-auto h-[90%] top-[5%] rounded-md shadow-[0_2px_26px_rgba(0,0,0,0.12)] after:content-[''] after:absolute after:inset-0 ${
                  isOpen
                    ? "[transform:translateY(-100px)] [transition:transform_0.4s_0.6s_ease,z-index_0.6s] z-[2]"
                    : "[transform:translateY(0px)] [transition:transform_0.4s_ease,z-index_1s] z-[1]"
                }`}
              >
                <div className="words line1 absolute left-[10%] w-[80%] h-[14%] bg-[#ffe6e6] top-[10%] text-[0.7rem]"></div>
                <div className="words line2 absolute left-[10%] w-[80%] h-[14%] bg-[#ffe6e6] top-[30%] text-center text-[1.1rem]"></div>
                <div className="words line3 absolute left-[10%] w-[80%] h-[14%] bg-[#ffe6e6] top-[50%] text-[1.1rem] text-center"></div>
                <div className="words line4 absolute left-[10%] w-[80%] h-[14%] bg-[#ffe6e6] top-[70%] text-[1.1rem] text-center"></div>
              </div>
              <div className="hearts absolute top-[90px] inset-x-0 z-[2]">
                <div
                  className={`heart a1 absolute bottom-0 right-[10%] pointer-events-none before:content-[''] before:absolute before:left-[50px] before:top-0 before:w-[50px] before:h-[80px] before:bg-[#e60073] before:[border-radius:50px_50px_0_0] before:[transform:rotate(-45deg)] before:[transform-origin:0_100%] before:pointer-events-none after:content-[''] after:absolute after:left-0 after:top-0 after:w-[50px] after:h-[80px] after:bg-[#e60073] after:[border-radius:50px_50px_0_0] after:[transform:rotate(45deg)] after:[transform-origin:100%_100%] after:pointer-events-none left-[20%] scale-[0.6] ${
                    isOpen
                      ? "opacity-100 [animation:slideUp_4s_linear_1_forwards,sideSway_2s_ease-in-out_4_alternate] [animation-delay:0.7s]"
                      : "opacity-0 [animation:none]"
                  }`}
                ></div>
                <div
                  className={`heart a2 absolute bottom-0 right-[10%] pointer-events-none before:content-[''] before:absolute before:left-[50px] before:top-0 before:w-[50px] before:h-[80px] before:bg-[#e60073] before:[border-radius:50px_50px_0_0] before:[transform:rotate(-45deg)] before:[transform-origin:0_100%] before:pointer-events-none after:content-[''] after:absolute after:left-0 after:top-0 after:w-[50px] after:h-[80px] after:bg-[#e60073] after:[border-radius:50px_50px_0_0] after:[transform:rotate(45deg)] after:[transform-origin:100%_100%] after:pointer-events-none left-[55%] scale-100 ${
                    isOpen
                      ? "opacity-100 [animation:slideUp_5s_linear_1_forwards,sideSway_4s_ease-in-out_2_alternate] [animation-delay:0.7s]"
                      : "opacity-0 [animation:none]"
                  }`}
                ></div>
                <div
                  className={`heart a3 absolute bottom-0 right-[10%] pointer-events-none before:content-[''] before:absolute before:left-[50px] before:top-0 before:w-[50px] before:h-[80px] before:bg-[#e60073] before:[border-radius:50px_50px_0_0] before:[transform:rotate(-45deg)] before:[transform-origin:0_100%] before:pointer-events-none after:content-[''] after:absolute after:left-0 after:top-0 after:w-[50px] after:h-[80px] after:bg-[#e60073] after:[border-radius:50px_50px_0_0] after:[transform:rotate(45deg)] after:[transform-origin:100%_100%] after:pointer-events-none left-[10%] scale-[0.8] ${
                    isOpen
                      ? "opacity-100 [animation:slideUp_7s_linear_1_forwards,sideSway_2s_ease-in-out_6_alternate] [animation-delay:0.7s]"
                      : "opacity-0 [animation:none]"
                  }`}
                ></div>
              </div>
            </div>
          ) : (
            <>
                {pageData ? (
                  <ValentineCard
                    pageId={pageData.id}
                    question={pageData.question}
                    beggingMessages={pageData.begging_messages}
                    finalMessage={pageData.final_message}
                    socialLabel={pageData.social_label}
                    socialLink={pageData.social_link}
                    senderName={pageData.sender_name}
                    receiverName={pageData.receiver_name ?? null}
                    alreadyAccepted={!!yesEvent}
                    existingScreenshotUrl={yesEvent?.screenshot_url}
                    theme={pageData.theme}
                    decorationType={
                      (pageData.decoration_type || "hearts") as DecorationType
                    }
                  />
                ) : null}
            </>
          )}
          <audio src={AkoNalangSana} ref={musicVideoRef} preload="auto" />
    </div>
    </>
  );
};

export default Valentine;
