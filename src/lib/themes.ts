// Theme configuration for Valentine cards
export interface ThemeConfig {
  id: string;
  name: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    card: string;
    lightBackground: string;
  };
  gradient: string;
}

export const themes: ThemeConfig[] = [
  {
    id: "Default",
    name: "Default",
    emoji: "🌹",
    colors: {
      primary: "346 64% 58%",
      secondary: "345 81% 80%",
      accent: "349 100% 69%",
      background: "20 50% 98%",
      foreground: "350 30% 20%",
      muted: "350 15% 45%",
      card: "20 40% 97%",
      lightBackground: "346 60% 90%",
    },
    gradient:
      "linear-gradient(135deg, hsl(345 70% 75%) 0%, hsl(346 77% 60%) 50%, hsl(349 83% 50%) 100%)",
  },
  {
    id: "Blue",
    name: "Blue",
    emoji: "🌊",
    colors: {
      primary: "210 64% 58%",
      secondary: "209 81% 80%",
      accent: "213 100% 69%",
      background: "210 50% 98%",
      foreground: "210 30% 20%",
      muted: "210 15% 45%",
      card: "210 40% 97%",
      lightBackground: "210 70% 85%",
    },
    gradient:
      "linear-gradient(135deg, hsl(209 70% 75%) 0%, hsl(210 77% 60%) 50%, hsl(213 83% 50%) 100%)",
  },
  {
    id: "purple",
    name: "Purple",
    emoji: "🌙",
    colors: {
      primary: "260 64% 58%",
      secondary: "259 81% 80%",
      accent: "263 100% 69%",
      background: "260 30% 10%",
      foreground: "260 20% 95%",
      muted: "260 20% 55%",
      card: "260 25% 15%",
      lightBackground: "260 50% 20%",
    },
    gradient:
      "linear-gradient(135deg, hsl(259 70% 75%) 0%, hsl(260 77% 60%) 50%, hsl(263 83% 50%) 100%)",
  },
  {
    id: "Red",
    name: "Red",
    emoji: "❤️‍🔥",
    colors: {
      primary: "2 64% 58%",
      secondary: "1 81% 80%",
      accent: "5 100% 69%",
      background: "0 30% 97%",
      foreground: "0 40% 15%",
      muted: "0 20% 45%",
      card: "0 40% 96%",
      lightBackground: "0 80% 88%",
    },
    gradient:
      "linear-gradient(135deg, hsl(1 70% 75%) 0%, hsl(2 77% 60%) 50%, hsl(5 83% 50%) 100%)",
  },
  {
    id: "golden",
    name: "Gold",
    emoji: "✨",
    colors: {
      primary: "40 90% 50%",
      secondary: "45 70% 92%",
      accent: "25 85% 55%",
      background: "45 60% 98%",
      foreground: "30 40% 20%",
      muted: "40 25% 45%",
      card: "45 50% 97%",
      lightBackground: "40 80% 85%",
    },
    gradient:
      "linear-gradient(135deg, hsl(50 80% 70%) 0%, hsl(40 90% 55%) 50%, hsl(25 85% 50%) 100%)",
  },
];

export type DecorationType =
  | "hearts"
  | "bears"
  | "stars"
  | "flowers"
  | "stunna";

export interface DecorationConfig {
  id: DecorationType;
  name: string;
  emoji: string;
  symbols: string[];
}

export const decorations: DecorationConfig[] = [
  {
    id: "hearts",
    name: "",
    emoji: "💕",
    symbols: [
      "💕",
      "💖",
      "💗",
      "💓",
      "💝",
      "❤️",
      "🩷",
      "🤍",
      "💌",
      "💕",
      "💖",
      "💗",
      "💓",
      "💝",
      "❤️",
      "🩷",
      "🤍",
      "💌",
    ],
  },
  {
    id: "bears",
    name: "",
    emoji: "🧸",
    symbols: [
      "🧸",
      "🐻",
      "🐻‍❄️",
      "🧸",
      "🐻",
      "🐻‍❄️",
      "🎀",
      "🧸",
      "🐻",
      "🐻‍❄️",
      "🧸",
      "🐻",
      "🐻‍❄️",
      "🎀",
      "🧸",
      "🐻",
      "🐻‍❄️",
    ],
  },
  {
    id: "stars",
    name: "",
    emoji: "⭐",
    symbols: [
      "⭐",
      "✨",
      "🌟",
      "💫",
      "🌠",
      "✦",
      "★",
      "🌙",
      "⭐",
      "✨",
      "🌟",
      "💫",
      "🌠",
      "✦",
      "★",
      "🌙",
    ],
  },
  {
    id: "flowers",
    name: "",
    emoji: "🌸",
    symbols: [
      "🌸",
      "🌺",
      "🌹",
      "🌷",
      "💐",
      "🌻",
      "🌼",
      "🪻",
      "🌸",
      "🌺",
      "🌹",
      "🌷",
      "💐",
      "🌻",
      "🌼",
      "🪻",
    ],
  },
  {
    id: "stunna",
    name: "",
    emoji: "💎",
    symbols: ["💎", "💎", "💎", "💎", "💎", "💎", "💎", "💎"],
  },
];

export function getThemeById(id: string): ThemeConfig {
  return themes.find((t) => t.id === id) || themes[0];
}

export function getDecorationById(id: DecorationType): DecorationConfig {
  return decorations.find((d) => d.id === id) || decorations[0];
}
