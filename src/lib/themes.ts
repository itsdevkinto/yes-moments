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
      primary: "346 77% 50%",
      secondary: "350 60% 92%",
      accent: "10 70% 65%",
      background: "20 50% 98%",
      foreground: "350 30% 20%",
      muted: "350 15% 45%",
      card: "20 40% 97%",
      lightBackground: "346 60% 90%",
    },
    gradient: "linear-gradient(135deg, hsl(350 70% 75%) 0%, hsl(346 77% 60%) 50%, hsl(348 83% 50%) 100%)",
  },
  {
    id: "Blue",
    name: "Blue",
    emoji: "🌊",
    colors: {
      primary: "210 80% 50%",
      secondary: "210 60% 92%",
      accent: "180 70% 50%",
      background: "210 50% 98%",
      foreground: "210 30% 20%",
      muted: "210 15% 45%",
      card: "210 40% 97%",
      lightBackground: "210 70% 85%",
    },
    gradient: "linear-gradient(135deg, hsl(210 70% 75%) 0%, hsl(210 80% 55%) 50%, hsl(200 80% 45%) 100%)",
  },
  {
    id: "purple",
    name: "Purple",
    emoji: "🌙",
    colors: {
      primary: "260 70% 60%",
      secondary: "260 40% 25%",
      accent: "280 60% 55%",
      background: "260 30% 10%",
      foreground: "260 20% 95%",
      muted: "260 20% 55%",
      card: "260 25% 15%",
      lightBackground: "260 50% 20%",
    },
    gradient: "linear-gradient(135deg, hsl(260 50% 40%) 0%, hsl(280 60% 50%) 50%, hsl(300 50% 45%) 100%)",
  },
  {
    id: "Red",
    name: "Red",
    emoji: "❤️‍🔥",
    colors: {
      primary: "0 85% 45%",
      secondary: "0 60% 90%",
      accent: "15 80% 55%",
      background: "0 30% 97%",
      foreground: "0 40% 15%",
      muted: "0 20% 45%",
      card: "0 40% 96%",
      lightBackground: "0 80% 88%",
    },
    gradient: "linear-gradient(135deg, hsl(0 70% 65%) 0%, hsl(0 85% 50%) 50%, hsl(350 80% 40%) 100%)",
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
    gradient: "linear-gradient(135deg, hsl(50 80% 70%) 0%, hsl(40 90% 55%) 50%, hsl(25 85% 50%) 100%)",
  },
];

export type DecorationType = "hearts" | "bears" | "stars" | "flowers" | "stunna";

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
    symbols: ["💕", "💖", "💗", "💓", "💝", "❤️", "🩷", "🤍", "💌","💕", "💖", "💗", "💓", "💝", "❤️", "🩷", "🤍", "💌"],
  },
  {
    id: "bears",
    name: "",
    emoji: "🧸",
    symbols: ["🧸", "🐻", "🐻‍❄️","🧸", "🐻", "🐻‍❄️", "🎀", "🧸", "🐻", "🐻‍❄️","🧸", "🐻", "🐻‍❄️", "🎀", "🧸", "🐻", "🐻‍❄️"],
  },
  {
    id: "stars",
    name: "",
    emoji: "⭐",
    symbols: ["⭐", "✨", "🌟", "💫", "🌠", "✦", "★", "🌙", "⭐", "✨", "🌟", "💫", "🌠", "✦", "★", "🌙"],
  },
  {
    id: "flowers",
    name: "",
    emoji: "🌸",
    symbols: ["🌸", "🌺", "🌹", "🌷", "💐", "🌻", "🌼", "🪻", "🌸", "🌺", "🌹", "🌷", "💐", "🌻", "🌼", "🪻"],
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
