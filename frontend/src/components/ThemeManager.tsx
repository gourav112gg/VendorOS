import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const THEME_PRESETS = {
  midnight: {
    dark: {
      bgApp: "#0B1120",
      bgCard: "#111C33",
      bgSecondary: "#0E172B",
      bgInput: "#182747",
      border: "#1E3159",
      borderStrong: "#2B457D",
      textPrimary: "#FFFFFF",
      textSecondary: "#94A3B8",
      textMuted: "#64748B",
      accent: "#60A5FA",
      accentHover: "#3B82F6",
      buttonPrimaryBg: "#FFFFFF",
      buttonPrimaryText: "#0B1120",
    },
    light: {
      bgApp: "#F1F5F9",
      bgCard: "#FFFFFF",
      bgSecondary: "#F8FAFC",
      bgInput: "#FFFFFF",
      border: "#CBD5E1",
      borderStrong: "#94A3B8",
      textPrimary: "#0F172A",
      textSecondary: "#334155",
      textMuted: "#64748B",
      accent: "#2563EB",
      accentHover: "#1D4ED8",
      buttonPrimaryBg: "#0F172A",
      buttonPrimaryText: "#FFFFFF",
    },
  },
  obsidian: {
    dark: {
      bgApp: "#0A0A0A",
      bgCard: "#121212",
      bgSecondary: "#181818",
      bgInput: "#202020",
      border: "#262626",
      borderStrong: "#404040",
      textPrimary: "#FAFAFA",
      textSecondary: "#A3A3A3",
      textMuted: "#737373",
      accent: "#D97706",
      accentHover: "#B45309",
      buttonPrimaryBg: "#FAFAFA",
      buttonPrimaryText: "#0A0A0A",
    },
    light: {
      bgApp: "#F8F8F7",
      bgCard: "#FFFFFF",
      bgSecondary: "#F2F2F0",
      bgInput: "#FFFFFF",
      border: "#D4D4D1",
      borderStrong: "#A8A8A4",
      textPrimary: "#171717",
      textSecondary: "#525252",
      textMuted: "#737373",
      accent: "#D97706",
      accentHover: "#B45309",
      buttonPrimaryBg: "#171717",
      buttonPrimaryText: "#FFFFFF",
    },
  },
  pine: {
    dark: {
      bgApp: "#0C1A14",
      bgCard: "#13261F",
      bgSecondary: "#0F1F19",
      bgInput: "#1B332A",
      border: "#24473A",
      borderStrong: "#336352",
      textPrimary: "#ECFDF5",
      textSecondary: "#A7F3D0",
      textMuted: "#4E8773",
      accent: "#34D399",
      accentHover: "#10B981",
      buttonPrimaryBg: "#ECFDF5",
      buttonPrimaryText: "#064E3B",
    },
    light: {
      bgApp: "#F0FDF4",
      bgCard: "#FFFFFF",
      bgSecondary: "#DCFCE7",
      bgInput: "#FFFFFF",
      border: "#A7F3D0",
      borderStrong: "#6EE7B7",
      textPrimary: "#064E3B",
      textSecondary: "#065F46",
      textMuted: "#047857",
      accent: "#059669",
      accentHover: "#047857",
      buttonPrimaryBg: "#064E3B",
      buttonPrimaryText: "#FFFFFF",
    },
  },
  graphite: {
    dark: {
      bgApp: "#16161E",
      bgCard: "#1E1E28",
      bgSecondary: "#1A1A22",
      bgInput: "#252532",
      border: "#353545",
      borderStrong: "#4D4D63",
      textPrimary: "#F5F5FA",
      textSecondary: "#C5C5D8",
      textMuted: "#8E8EA8",
      accent: "#818CF8",
      accentHover: "#6366F1",
      buttonPrimaryBg: "#F5F5FA",
      buttonPrimaryText: "#181824",
    },
    light: {
      bgApp: "#F4F4F8",
      bgCard: "#FFFFFF",
      bgSecondary: "#EAEAF2",
      bgInput: "#FFFFFF",
      border: "#CBCBDD",
      borderStrong: "#A7A7C6",
      textPrimary: "#181824",
      textSecondary: "#424258",
      textMuted: "#686884",
      accent: "#6366F1",
      accentHover: "#4F46E5",
      buttonPrimaryBg: "#181824",
      buttonPrimaryText: "#FFFFFF",
    },
  },
};

// Legacy Theme Name Resolver for Backwards Compatibility
export const resolveThemePreset = (themeName: string) => {
  const clean = (themeName || "midnight").toLowerCase().trim();
  if (clean === "slate" || clean === "sapphire") return THEME_PRESETS.obsidian;
  if (clean === "sage" || clean === "warm") return THEME_PRESETS.pine;
  if (clean === "tokyo" || clean === "azure") return THEME_PRESETS.graphite;
  if (clean in THEME_PRESETS) return THEME_PRESETS[clean as keyof typeof THEME_PRESETS];
  return THEME_PRESETS.midnight;
};

// Semantic status colors for Light and Dark modes
const STATUS = {
  dark: {
    success: {
      bg: "rgba(16, 185, 129, 0.16)",
      text: "#6EE7B7",
      border: "rgba(16, 185, 129, 0.35)",
    },
    warning: {
      bg: "rgba(245, 158, 11, 0.16)",
      text: "#FBBF24",
      border: "rgba(245, 158, 11, 0.35)",
    },
    info: {
      bg: "rgba(96, 165, 250, 0.16)",
      text: "#93C5FD",
      border: "rgba(96, 165, 250, 0.35)",
    },
    danger: {
      bg: "rgba(239, 68, 68, 0.16)",
      text: "#FCA5A5",
      border: "rgba(239, 68, 68, 0.35)",
    },
  },
  light: {
    success: {
      bg: "#ECFDF5",
      text: "#047857",
      border: "#A7F3D0",
    },
    warning: {
      bg: "#FFFBEB",
      text: "#B45309",
      border: "#FDE68A",
    },
    info: {
      bg: "#EFF6FF",
      text: "#1D4ED8",
      border: "#BFDBFE",
    },
    danger: {
      bg: "#FEF2F2",
      text: "#B91C1C",
      border: "#FECACA",
    },
  },
};

// Escapes a literal Tailwind arbitrary-value class name for use as a CSS selector
const sel = (prefix: string, className: string) =>
  `${prefix} .${className.replace(/([\[\]#\/:.%])/g, "\\$1")}`;
const selAll = (prefix: string, classNames: string[]) =>
  classNames.map((c) => sel(prefix, c)).join(", ");

export const ThemeManager: React.FC = () => {
  const { preferences } = useAuth();

  const [systemIsDark, setSystemIsDark] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const rawMode = preferences.themeMode || "dark";
  const mode = rawMode === "system" ? (systemIsDark ? "dark" : "light") : rawMode;
  const theme = preferences.themeName || "midnight";

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mode === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    }
  }, [mode]);

  let colors: any = THEME_PRESETS.midnight.dark;

  if (theme === "custom" && preferences.customThemeColors) {
    colors = preferences.customThemeColors;
  } else {
    const preset = resolveThemePreset(theme);
    colors = preset[mode as "dark" | "light"] || preset.dark;
  }

  const status = STATUS[mode as "dark" | "light"] || STATUS.dark;
  const borderStrong = colors.borderStrong || colors.accent;
  const accentSoft =
    mode === "light" ? `${colors.accent}22` : `${colors.accent}29`;
  const rowHover = mode === "light" ? colors.bgSecondary : `${colors.accent}0F`;

  const scope = ".dashboard-theme-scope";
  const notChatbot = ":not(.floating-chatbot-root):not(.floating-chatbot-root *)";

  const bgAppClasses = [
    "bg-[#0B1120]",
    "bg-[#0F0F0F]",
    "bg-[#0C1A14]",
    "bg-[#1C1C24]",
    "bg-[#16161E]",
    "bg-[#0A0A0A]",
    "bg-[#070707]",
    "bg-[#080606]",
    "bg-[#080808]",
    "bg-[#090812]",
    "bg-[#0C0F0D]",
    "bg-[#060B18]",
    "bg-[#110F0C]",
  ];

  const bgCardClasses = [
    "bg-[#111111]",
    "bg-[#121212]",
    "bg-[#131313]",
    "bg-[#141414]",
    "bg-[#151515]",
    "bg-[#161616]",
    "bg-[#171717]",
    "bg-[#111C33]",
    "bg-[#13261F]",
    "bg-[#24242F]",
    "bg-[#1E1E28]",
    "bg-[#0E172E]",
    "bg-[#121624]",
    "bg-[#1B1611]",
    "bg-[#111021]",
    "bg-[#100B0B]",
    "bg-[#100C14]",
    "bg-[#0C0C0C]",
    "bg-[#0D0D0D]",
    "bg-[#0E0E0E]",
    "bg-[#0F0F0F]",
    "bg-zinc-900",
    "bg-zinc-950",
    "bg-neutral-900",
    "bg-neutral-950",
    "bg-slate-900",
    "bg-slate-950",
  ];

  const bgSecondaryClasses = [
    "bg-[#0E172B]",
    "bg-[#0F1F19]",
    "bg-[#20202A]",
    "bg-[#1A1A22]",
    "bg-[#1A1A1A]",
    "bg-[#1C1C1C]",
    "bg-[#1D1D1D]",
    "bg-[#1E1E1E]",
    "bg-[#1F1F1F]",
    "bg-[#212121]",
    "bg-[#222222]",
    "bg-[#242424]",
    "bg-[#252525]",
    "bg-[#262626]",
    "bg-[#282828]",
    "bg-[#2A2A2A]",
    "bg-[#2D2D2D]",
    "bg-[#333333]",
    "bg-[#101411]",
    "bg-[#0A1021]",
    "bg-[#15110E]",
    "bg-[#0D0C1A]",
    "bg-[#0b0e1a]",
    "bg-[#170E0E]",
    "bg-[#0A0707]",
    "bg-[#1C0D0D]",
    "bg-[#140D0D]",
    "bg-white/5",
    "bg-white/10",
    "bg-white/[0.02]",
    "bg-white/[0.03]",
    "bg-white/[0.04]",
    "bg-white/[0.05]",
    "bg-white/[0.06]",
    "bg-white/[0.08]",
    "bg-white/[1%]",
    "bg-white/[2%]",
  ];

  const bgInputClasses = [
    "bg-[#182747]",
    "bg-[#212121]",
    "bg-[#1B332A]",
    "bg-[#2D2D3B]",
    "bg-[#252532]",
    "bg-[#1A1A1A]",
    "bg-[#202822]",
    "bg-[#18254A]",
    "bg-[#2B221A]",
    "bg-[#1A1933]",
    "bg-[#181d33]",
    "bg-[#1C1C1C]",
    "bg-[#1D1D2D]",
    "bg-[#202020]",
    "bg-[#0A0A0A]",
  ];

  const borderMainClasses = [
    "border-[#1E3159]",
    "border-[#2E2E2E]",
    "border-[#24473A]",
    "border-[#3B3B4D]",
    "border-[#353545]",
    "border-[#111111]",
    "border-[#141414]",
    "border-[#161616]",
    "border-[#181818]",
    "border-[#1A1A1A]",
    "border-[#1C1C1C]",
    "border-[#1D1D1D]",
    "border-[#1E1E1E]",
    "border-[#1F1F1F]",
    "border-[#202020]",
    "border-[#222222]",
    "border-[#242424]",
    "border-[#262626]",
    "border-[#282828]",
    "border-[#2A2A2A]",
    "border-[#2D2D2D]",
    "border-zinc-800",
    "border-zinc-700",
    "border-neutral-800",
    "border-neutral-700",
    "border-slate-800",
    "border-slate-700",
    "border-white/5",
    "border-white/10",
    "border-white/15",
    "border-white/20",
    "border-white/[0.04]",
    "border-white/[0.06]",
    "border-white/[0.08]",
  ];

  const borderStrongClasses = [
    "border-[#2B457D]",
    "border-[#454545]",
    "border-[#333333]",
    "border-[#336352]",
    "border-[#52526A]",
    "border-[#4D4D63]",
    "border-[#3A3A3A]",
    "border-[#404040]",
    "border-[#444444]",
    "border-[#555555]",
    "border-[#666666]",
    "border-zinc-600",
    "border-neutral-600",
    "border-slate-600",
  ];

  const textPrimaryClasses = [
    "text-white",
    "text-white/90",
    "text-white/80",
    "text-white/70",
    "text-white/60",
    "text-[#FFFFFF]",
    "text-[#FAFAFA]",
    "text-[#F5F5F5]",
    "text-[#F0F0F0]",
    "text-[#E5E5E5]",
    "text-[#D4D4D4]",
    "text-[#CCCCCC]",
    "text-[#AAAAAA]",
    "text-neutral-100",
    "text-neutral-200",
    "text-zinc-100",
    "text-zinc-200",
    "text-slate-100",
    "text-slate-200",
    "text-gray-100",
    "text-gray-200",
  ];

  const textSecondaryClasses = [
    "text-[#888888]",
    "text-[#94A3B8]",
    "text-[#999999]",
    "text-[#8c9bb5]",
    "text-[#A1A1AA]",
    "text-[#7A8CA8]",
    "text-[#8A97AB]",
    "text-neutral-300",
    "text-neutral-400",
    "text-zinc-300",
    "text-zinc-400",
    "text-slate-300",
    "text-slate-400",
    "text-gray-300",
    "text-gray-400",
  ];

  const textMutedClasses = [
    "text-[#666666]",
    "text-[#555555]",
    "text-[#444444]",
    "text-[#333333]",
    "text-[#71717A]",
    "text-[#64748B]",
    "text-neutral-500",
    "text-zinc-500",
    "text-slate-500",
    "text-gray-500",
  ];

  const css = `
    :root {
      --vos-bg-app: ${colors.bgApp};
      --vos-bg-card: ${colors.bgCard};
      --vos-bg-secondary: ${colors.bgSecondary};
      --vos-bg-input: ${colors.bgInput};
      --vos-border: ${colors.border};
      --vos-border-strong: ${borderStrong};
      --vos-text-primary: ${colors.textPrimary};
      --vos-text-secondary: ${colors.textSecondary};
      --vos-text-muted: ${colors.textMuted};
      --vos-accent: ${colors.accent};
      --vos-accent-hover: ${colors.accentHover};
      --vos-btn-primary-bg: ${colors.buttonPrimaryBg};
      --vos-btn-primary-text: ${colors.buttonPrimaryText};
    }

    /* ---- Unified Dashboard Layout Background & Base Colors ---- */
    html.light body,
    .dashboard-theme-scope {
      background-color: ${colors.bgApp} !important;
      color: ${colors.textPrimary} !important;
    }

    /* ---- Scoped Dashboard Theme Surfaces (excluding insulated Chatbot) ---- */
    ${scope} ${selAll("", bgAppClasses)}${notChatbot} { background-color: ${colors.bgApp} !important; }
    ${scope} ${selAll("", bgCardClasses)}${notChatbot} { background-color: ${colors.bgCard} !important; }
    ${scope} ${selAll("", bgSecondaryClasses)}${notChatbot} { background-color: ${colors.bgSecondary} !important; }
    ${scope} ${selAll("", bgInputClasses)}${notChatbot} { background-color: ${colors.bgInput} !important; }

    ${scope} ${selAll("", borderMainClasses)}${notChatbot} { border-color: ${colors.border} !important; }
    ${scope} ${selAll("", borderStrongClasses)}${notChatbot} { border-color: ${borderStrong} !important; }
    ${scope} .divide-\\[\\#222222\\] > :not([hidden]) ~ :not([hidden])${notChatbot},
    ${scope} .divide-\\[\\#1A1A1A\\] > :not([hidden]) ~ :not([hidden])${notChatbot},
    ${scope} .divide-\\[\\#1D1D1D\\] > :not([hidden]) ~ :not([hidden])${notChatbot},
    ${scope} .divide-\\[\\#262626\\] > :not([hidden]) ~ :not([hidden])${notChatbot},
    ${scope} .divide-\\[\\#333333\\] > :not([hidden]) ~ :not([hidden])${notChatbot} {
      border-color: ${colors.border} !important;
    }

    /* ---- Mode-Specific Text & Element Inversion Rules ---- */
    ${
      mode === "light"
        ? `
      ${scope} ${selAll("", textPrimaryClasses)}${notChatbot}:not(.keep-white):not([class*="bg-emerald"]):not([class*="bg-blue"]):not([class*="bg-indigo"]):not([class*="bg-amber"]):not([class*="bg-rose"]):not([class*="bg-red"]):not([class*="text-emerald"]):not([class*="text-amber"]):not([class*="text-red"]):not([class*="text-green"]):not([class*="text-blue"]):not([class*="text-indigo"]):not([class*="text-rose"]) {
        color: ${colors.textPrimary} !important;
      }
      ${scope} ${selAll("", textSecondaryClasses)}${notChatbot}:not(.keep-white):not([class*="text-emerald"]):not([class*="text-amber"]):not([class*="text-red"]):not([class*="text-green"]):not([class*="text-blue"]):not([class*="text-indigo"]):not([class*="text-rose"]) {
        color: ${colors.textSecondary} !important;
      }
      ${scope} ${selAll("", textMutedClasses)}${notChatbot}:not(.keep-white):not([class*="text-emerald"]):not([class*="text-amber"]):not([class*="text-red"]):not([class*="text-green"]):not([class*="text-blue"]):not([class*="text-indigo"]):not([class*="text-rose"]) {
        color: ${colors.textMuted} !important;
      }

      /* Solid Buttons & Active Badges Inversion */
      ${scope} .bg-white.text-black${notChatbot},
      ${scope} .bg-white.text-neutral-900${notChatbot},
      ${scope} .bg-white.text-slate-900${notChatbot} {
        background-color: ${colors.buttonPrimaryBg} !important;
        color: ${colors.buttonPrimaryText} !important;
        border-color: ${colors.buttonPrimaryBg} !important;
      }

      /* Primary Inverted Button Hover States in Light Mode */
      ${scope} .hover\\:bg-\\[\\#E5E5E5\\]:hover${notChatbot},
      ${scope} .hover\\:bg-\\[\\#F0EAD8\\]:hover${notChatbot},
      ${scope} .hover\\:bg-\\[\\#F5F5F5\\]:hover${notChatbot},
      ${scope} .hover\\:bg-\\[\\#EEEEEE\\]:hover${notChatbot},
      ${scope} .hover\\:bg-neutral-200:hover${notChatbot},
      ${scope} .hover\\:bg-stone-200:hover${notChatbot},
      ${scope} .hover\\:bg-slate-200:hover${notChatbot} {
        background-color: ${colors.accentHover || '#1E293B'} !important;
        color: #FFFFFF !important;
      }

      /* Inputs, Textareas, Selects in Light Mode */
      ${scope} input${notChatbot}, ${scope} select${notChatbot}, ${scope} textarea${notChatbot} {
        background-color: #FFFFFF !important;
        color: ${colors.textPrimary} !important;
        border-color: ${colors.border} !important;
      }
      ${scope} input${notChatbot}::placeholder, ${scope} textarea${notChatbot}::placeholder {
        color: ${colors.textMuted} !important;
      }
      ${scope} input${notChatbot}:focus, ${scope} select${notChatbot}:focus, ${scope} textarea${notChatbot}:focus {
        border-color: ${colors.accent} !important;
        box-shadow: 0 0 0 3px ${accentSoft} !important;
      }

      /* Table Header & Rows in Light Mode */
      ${scope} table thead tr th${notChatbot},
      ${scope} table thead tr${notChatbot} {
        background-color: ${colors.bgSecondary} !important;
        color: ${colors.textSecondary} !important;
        border-color: ${colors.border} !important;
      }
      ${scope} table tbody tr:hover${notChatbot} {
        background-color: ${colors.bgSecondary} !important;
      }

      /* Navigation & Header in Light Mode */
      ${scope} nav${notChatbot} {
        background-color: rgba(255, 255, 255, 0.96) !important;
        border-color: ${colors.border} !important;
      }
      ${scope} header${notChatbot} {
        background-color: ${colors.bgCard} !important;
        border-color: ${colors.border} !important;
      }

      /* Interactive Hover Overrides in Light Mode */
      ${scope} .hover\\:bg-\\[\\#1A1A1A\\]:hover${notChatbot},
      ${scope} .hover\\:bg-\\[\\#202020\\]:hover${notChatbot},
      ${scope} .hover\\:bg-\\[\\#222222\\]:hover${notChatbot},
      ${scope} .hover\\:bg-white\\/\\[0\\.03\\]:hover${notChatbot},
      ${scope} .hover\\:bg-white\\/5:hover${notChatbot},
      ${scope} .hover\\:bg-white\\/\\[1\\%\\]:hover${notChatbot} {
        background-color: ${colors.bgSecondary} !important;
      }
      ${scope} .hover\\:text-white:hover${notChatbot} {
        color: ${colors.textPrimary} !important;
      }
      ${scope} .hover\\:border-\\[\\#333333\\]:hover${notChatbot},
      ${scope} .hover\\:border-\\[\\#444444\\]:hover${notChatbot} {
        border-color: ${borderStrong} !important;
      }

      /* Keyboard Shortcuts <kbd> in Light Mode */
      ${scope} kbd${notChatbot} {
        background-color: ${colors.bgSecondary} !important;
        border-color: ${colors.border} !important;
        color: ${colors.textPrimary} !important;
      }

      /* Fixed Dialogs, Modals, Overlays in Light Mode */
      ${scope} .fixed.inset-0 .bg-\\[\\#111111\\]${notChatbot},
      ${scope} .fixed.inset-0 .bg-\\[\\#0F0F0F\\]${notChatbot},
      ${scope} .fixed.inset-0 .bg-\\[\\#0A0A0A\\]${notChatbot} {
        background-color: ${colors.bgCard} !important;
        border-color: ${colors.border} !important;
        color: ${colors.textPrimary} !important;
      }
    `
        : `
      /* Dark Mode Text Adjustments */
      ${scope} ${selAll("", textSecondaryClasses)}${notChatbot} {
        color: ${colors.textSecondary} !important;
      }
      ${scope} ${selAll("", textMutedClasses)}${notChatbot} {
        color: ${colors.textMuted} !important;
      }

      /* Inputs in Dark Mode */
      ${scope} input${notChatbot}, ${scope} select${notChatbot}, ${scope} textarea${notChatbot} {
        background-color: ${colors.bgInput} !important;
        color: ${colors.textPrimary} !important;
        border-color: ${colors.border} !important;
      }
      ${scope} input${notChatbot}::placeholder, ${scope} textarea${notChatbot}::placeholder {
        color: ${colors.textMuted} !important;
      }
      ${scope} input${notChatbot}:focus, ${scope} select${notChatbot}:focus, ${scope} textarea${notChatbot}:focus {
        border-color: ${colors.accent} !important;
        box-shadow: 0 0 0 3px ${accentSoft} !important;
      }

      /* Table Rows in Dark Mode */
      ${scope} table tbody tr:hover${notChatbot} {
        background-color: ${rowHover} !important;
      }
    `
    }

    /* ---- Semantic Status Badges & Indicators (Light & Dark) ---- */
    ${scope} .bg-\\[\\#0D2A1D\\]${notChatbot}, ${scope} .bg-\\[\\#0D2214\\]${notChatbot}, ${scope} .bg-\\[\\#0A2215\\]${notChatbot},
    ${scope} .bg-emerald-500\\/10${notChatbot}, ${scope} .bg-emerald-950\\/20${notChatbot}, ${scope} .bg-emerald-950\\/30${notChatbot} {
      background-color: ${status.success.bg} !important;
      border-color: ${status.success.border} !important;
    }
    ${scope} .bg-\\[\\#0D2A1D\\] span${notChatbot}, ${scope} .bg-\\[\\#0D2214\\] span${notChatbot}, ${scope} .bg-\\[\\#0A2215\\] span${notChatbot},
    ${scope} .text-emerald-400${notChatbot}, ${scope} .text-emerald-500${notChatbot}, ${scope} .text-\\[\\#6EE7B7\\]${notChatbot} {
      color: ${status.success.text} !important;
    }

    ${scope} .bg-\\[\\#2D220D\\]${notChatbot}, ${scope} .bg-\\[\\#1A1208\\]${notChatbot}, ${scope} .bg-\\[\\#2D1C0F\\]${notChatbot},
    ${scope} .bg-\\[\\#1C120D\\]${notChatbot}, ${scope} .bg-\\[\\#2D1D0F\\]${notChatbot}, ${scope} .bg-\\[\\#1C160C\\]${notChatbot},
    ${scope} .bg-amber-500\\/10${notChatbot}, ${scope} .bg-amber-950\\/20${notChatbot}, ${scope} .bg-amber-950\\/30${notChatbot} {
      background-color: ${status.warning.bg} !important;
      border-color: ${status.warning.border} !important;
    }
    ${scope} .bg-\\[\\#2D220D\\] span${notChatbot}, ${scope} .bg-\\[\\#1A1208\\] span${notChatbot}, ${scope} .bg-\\[\\#2D1C0F\\] span${notChatbot},
    ${scope} .text-amber-400${notChatbot}, ${scope} .text-amber-500${notChatbot}, ${scope} .text-\\[\\#FBBF24\\]${notChatbot} {
      color: ${status.warning.text} !important;
    }

    ${scope} .bg-\\[\\#0D1D2D\\]${notChatbot}, ${scope} .bg-\\[\\#1D122D\\]${notChatbot},
    ${scope} .bg-blue-500\\/10${notChatbot}, ${scope} .bg-sky-500\\/10${notChatbot}, ${scope} .bg-indigo-500\\/10${notChatbot} {
      background-color: ${status.info.bg} !important;
      border-color: ${status.info.border} !important;
    }
    ${scope} .bg-\\[\\#0D1D2D\\] span${notChatbot}, ${scope} .bg-\\[\\#1D122D\\] span${notChatbot},
    ${scope} .text-blue-400${notChatbot}, ${scope} .text-sky-400${notChatbot}, ${scope} .text-indigo-400${notChatbot} {
      color: ${status.info.text} !important;
    }

    ${scope} .bg-\\[\\#1D120D\\]${notChatbot}, ${scope} .bg-\\[\\#2D0D0D\\]${notChatbot},
    ${scope} .bg-red-500\\/10${notChatbot}, ${scope} .bg-red-950\\/20${notChatbot}, ${scope} .bg-rose-500\\/10${notChatbot} {
      background-color: ${status.danger.bg} !important;
      border-color: ${status.danger.border} !important;
    }
    ${scope} .text-red-400${notChatbot}, ${scope} .text-red-500${notChatbot}, ${scope} .text-rose-400${notChatbot} {
      color: ${status.danger.text} !important;
    }

    /* ---- Brand Accent Elements & Buttons ---- */
    ${scope} .bg-emerald-500, ${scope} .bg-emerald-600, ${scope} .bg-\\[\\#10B981\\],
    ${scope} .bg-blue-500, ${scope} .bg-blue-600, ${scope} .bg-\\[\\#60A5FA\\],
    ${scope} .bg-amber-600, ${scope} .bg-\\[\\#D97706\\],
    ${scope} .bg-indigo-500, ${scope} .bg-\\[\\#818CF8\\] {
      background-color: ${colors.accent} !important;
      color: #FFFFFF !important;
    }

    ${scope} .text-emerald-500, ${scope} .text-\\[\\#10B981\\],
    ${scope} .text-blue-500, ${scope} .text-\\[\\#60A5FA\\],
    ${scope} .text-amber-500, ${scope} .text-\\[\\#D97706\\],
    ${scope} .text-indigo-500, ${scope} .text-\\[\\#818CF8\\] {
      color: ${colors.accent} !important;
    }

    ${scope} .hover\\:bg-emerald-600:hover, ${scope} .hover\\:bg-emerald-500:hover,
    ${scope} .hover\\:bg-blue-600:hover, ${scope} .hover\\:bg-blue-500:hover,
    ${scope} .hover\\:bg-amber-600:hover, ${scope} .hover\\:bg-amber-500:hover,
    ${scope} .hover\\:bg-indigo-600:hover, ${scope} .hover\\:bg-indigo-500:hover {
      background-color: ${colors.accentHover} !important;
      color: #FFFFFF !important;
    }

    ${scope} .border-emerald-500, ${scope} .border-blue-500, ${scope} .border-amber-500, ${scope} .border-indigo-500 {
      border-color: ${colors.accent} !important;
    }

    /* ---- Card Elevation & Smooth Motion ---- */
    .rounded-sm { border-radius: var(--vos-radius-sm, 10px) !important; }
    .rounded-xs { border-radius: 6px !important; }
    button.rounded-sm, a.rounded-sm, [role="button"].rounded-sm { border-radius: var(--vos-radius-sm, 10px) !important; }

    ${scope} ${selAll("", bgCardClasses)}${notChatbot} {
      box-shadow: ${mode === "light" ? "var(--vos-shadow-card-light)" : "var(--vos-shadow-card)"};
    }

    /* ---- Permanent Obsidian Monochrome Isolation for Floating Chatbot ---- */
    .floating-chatbot-root .bg-\\[\\#09090B\\],
    .floating-chatbot-root.bg-\\[\\#09090B\\] {
      background-color: #09090B !important;
    }
    .floating-chatbot-root .bg-\\[\\#18181B\\] {
      background-color: #18181B !important;
    }
    .floating-chatbot-root .bg-\\[\\#121215\\] {
      background-color: #121215 !important;
    }
    .floating-chatbot-root .bg-\\[\\#27272A\\] {
      background-color: #27272A !important;
    }
    .floating-chatbot-root .text-white {
      color: #FFFFFF !important;
    }
    .floating-chatbot-root .text-\\[\\#FAFAFA\\] {
      color: #FAFAFA !important;
    }
    .floating-chatbot-root .text-neutral-100 {
      color: #F5F5F5 !important;
    }
    .floating-chatbot-root .text-neutral-300 {
      color: #D4D4D4 !important;
    }
    .floating-chatbot-root .text-neutral-400 {
      color: #A3A3A3 !important;
    }
    .floating-chatbot-root .text-neutral-500 {
      color: #737373 !important;
    }
    .floating-chatbot-root .border-white\\/15,
    .floating-chatbot-root .border-white\\/20,
    .floating-chatbot-root .border-white\\/10 {
      border-color: rgba(255, 255, 255, 0.18) !important;
    }

    /* ---- Selection and Scrollbars ---- */
    ${scope} ::selection { background: ${colors.accent}33; color: ${colors.textPrimary}; }
    ${scope} ::-webkit-scrollbar-track { background: ${colors.bgApp}; }
    ${scope} ::-webkit-scrollbar-thumb { background-color: ${borderStrong}; border-radius: 4px; }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};

