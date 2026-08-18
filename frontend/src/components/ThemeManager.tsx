import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const THEME_PRESETS = {
  slate: {
    dark: {
      bgApp: "#0A0A0A",
      bgCard: "#111111",
      bgSecondary: "#161616",
      bgInput: "#1A1A1A",
      border: "#222222",
      borderStrong: "#333333",
      textPrimary: "#FFFFFF",
      textSecondary: "#888888",
      textMuted: "#666666",
      accent: "#10B981",
      accentHover: "#059669",
    },
    light: {
      bgApp: "#F8F9FA",
      bgCard: "#FFFFFF",
      bgSecondary: "#F1F3F5",
      bgInput: "#E9ECEF",
      border: "#DEE2E6",
      borderStrong: "#CED4DA",
      textPrimary: "#111827",
      textSecondary: "#4B5563",
      textMuted: "#6B7280",
      accent: "#10B981",
      accentHover: "#059669",
    },
  },
  sage: {
    dark: {
      bgApp: "#0F1310",
      bgCard: "#171D18",
      bgSecondary: "#0C100D",
      bgInput: "#202722",
      border: "#2B342C",
      borderStrong: "#3E4A3F",
      textPrimary: "#F1F4EC",
      textSecondary: "#C6D2C1",
      textMuted: "#839485",
      accent: "#7FA66B",
      accentHover: "#6B8F58",
    },
    light: {
      bgApp: "#F6F8F3",
      bgCard: "#FFFFFF",
      bgSecondary: "#ECF1E7",
      bgInput: "#E1E9D9",
      border: "#D3DFCB",
      borderStrong: "#B7C7A9",
      textPrimary: "#182216",
      textSecondary: "#3A4736",
      textMuted: "#5C6B58",
      accent: "#4E7A3C",
      accentHover: "#3D6130",
    },
  },
  sapphire: {
    dark: {
      bgApp: "#0B0F17",
      bgCard: "#131A26",
      bgSecondary: "#0D121B",
      bgInput: "#1B2536",
      border: "#263349",
      borderStrong: "#3B4C6B",
      textPrimary: "#EDF1F8",
      textSecondary: "#B7C4DA",
      textMuted: "#7A8CA8",
      accent: "#D8A548",
      accentHover: "#C08F36",
    },
    light: {
      bgApp: "#F2F5FA",
      bgCard: "#FFFFFF",
      bgSecondary: "#E7ECF5",
      bgInput: "#DCE4F0",
      border: "#CBD6E8",
      borderStrong: "#AFC0DC",
      textPrimary: "#0F172A",
      textSecondary: "#334155",
      textMuted: "#64748B",
      accent: "#B4802A",
      accentHover: "#966A20",
    },
  },
  warm: {
    dark: {
      bgApp: "#14100C",
      bgCard: "#1E1712",
      bgSecondary: "#100C09",
      bgInput: "#271E15",
      border: "#362A1D",
      borderStrong: "#4F3D28",
      textPrimary: "#FBF1DE",
      textSecondary: "#E4CBA4",
      textMuted: "#9C8567",
      accent: "#D08A4F",
      accentHover: "#B5723C",
    },
    light: {
      bgApp: "#FBF4E8",
      bgCard: "#FFFFFF",
      bgSecondary: "#F4E9D3",
      bgInput: "#EDDFC0",
      border: "#E1CFA9",
      borderStrong: "#CBB182",
      textPrimary: "#2A1D11",
      textSecondary: "#4D3823",
      textMuted: "#705437",
      accent: "#B8642A",
      accentHover: "#99511F",
    },
  },
  tokyo: {
    dark: {
      bgApp: "#100C14",
      bgCard: "#191320",
      bgSecondary: "#0D0A12",
      bgInput: "#221A2C",
      border: "#302640",
      borderStrong: "#473758",
      textPrimary: "#F1ECF8",
      textSecondary: "#CBBEDD",
      textMuted: "#8D7FA3",
      accent: "#A985D8",
      accentHover: "#9370C4",
    },
    light: {
      bgApp: "#F7F4FB",
      bgCard: "#FFFFFF",
      bgSecondary: "#EEE8F6",
      bgInput: "#E4DAF1",
      border: "#D5C7E8",
      borderStrong: "#BBA5D6",
      textPrimary: "#1F172B",
      textSecondary: "#43335A",
      textMuted: "#69528A",
      accent: "#7C55B0",
      accentHover: "#664896",
    },
  },
  azure: {
    dark: {
      bgApp: "#071426",
      bgCard: "#0D2342",
      bgSecondary: "#091A33",
      bgInput: "#13315C",
      border: "#1C457A",
      borderStrong: "#2196F3",
      textPrimary: "#FFFFFF",
      textSecondary: "#B3D4FC",
      textMuted: "#7BAAE0",
      accent: "#2196F3",
      accentHover: "#1976D2",
    },
    light: {
      bgApp: "#F0F6FC",
      bgCard: "#FFFFFF",
      bgSecondary: "#E1EEFA",
      bgInput: "#CFE3F7",
      border: "#B6D6F2",
      borderStrong: "#2196F3",
      textPrimary: "#0B192C",
      textSecondary: "#1E3E62",
      textMuted: "#3B5A80",
      accent: "#0D47A1",
      accentHover: "#1565C0",
    },
  },
  midnight: {
    dark: {
      bgApp: "#0A2647",
      bgCard: "#144272",
      bgSecondary: "#0E3159",
      bgInput: "#194E85",
      border: "#205295",
      borderStrong: "#2C74B3",
      textPrimary: "#FFFFFF",
      textSecondary: "#B8D9F8",
      textMuted: "#7EA9D4",
      accent: "#2C74B3",
      accentHover: "#3A8FD6",
    },
    light: {
      bgApp: "#F0F4F8",
      bgCard: "#FFFFFF",
      bgSecondary: "#E2EAF2",
      bgInput: "#D0DEEC",
      border: "#B8CDE2",
      borderStrong: "#2C74B3",
      textPrimary: "#0A2647",
      textSecondary: "#144272",
      textMuted: "#335E8A",
      accent: "#144272",
      accentHover: "#205295",
    },
  },
};

// Semantic status colors are intentionally theme-independent
const STATUS = {
  success: {
    bg: "rgba(122,168,105,0.16)",
    text: "#9FCB8B",
    border: "rgba(122,168,105,0.35)",
  },
  warning: {
    bg: "rgba(206,158,84,0.16)",
    text: "#E0B568",
    border: "rgba(206,158,84,0.35)",
  },
  info: {
    bg: "rgba(108,150,206,0.16)",
    text: "#9DBEE8",
    border: "rgba(108,150,206,0.35)",
  },
  danger: {
    bg: "rgba(199,101,101,0.16)",
    text: "#E5A0A0",
    border: "rgba(199,101,101,0.35)",
  },
};

// Escapes a literal Tailwind arbitrary-value class name for use as a CSS selector
const sel = (prefix: string, className: string) =>
  `${prefix} .${className.replace(/([\[\]#\/:.])/g, "\\$1")}`;
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
  const theme = preferences.themeName || "slate";

  useEffect(() => {
    if (mode === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, [mode]);

  let colors: any = THEME_PRESETS.slate.dark;

  if (theme === "custom" && preferences.customThemeColors) {
    colors = preferences.customThemeColors;
  } else if (THEME_PRESETS[theme as keyof typeof THEME_PRESETS]) {
    colors =
      THEME_PRESETS[theme as keyof typeof THEME_PRESETS][
        mode as "dark" | "light"
      ];
  } else {
    colors = THEME_PRESETS.slate[mode as "dark" | "light"];
  }

  const borderStrong = colors.borderStrong || colors.accent;
  const accentSoft =
    mode === "light" ? `${colors.accent}22` : `${colors.accent}29`;
  const rowHover = mode === "light" ? colors.bgSecondary : `${colors.accent}0F`;

  const scope = ".dashboard-theme-scope";

  const bgAppClasses = [
    "bg-[#0A0A0A]",
    "bg-[#070707]",
    "bg-[#0C0F0D]",
    "bg-[#060B18]",
    "bg-[#110F0C]",
    "bg-[#090812]",
    "bg-[#080606]",
  ];
  const bgCardClasses = [
    "bg-[#111111]",
    "bg-[#151A16]",
    "bg-[#0E172E]",
    "bg-[#1B1611]",
    "bg-[#111021]",
    "bg-[#121624]",
    "bg-[#0C0C0C]",
    "bg-[#141414]",
    "bg-[#151515]",
    "bg-[#0F0F0F]",
    "bg-[#100B0B]",
    "bg-[#100C14]",
  ];
  const bgSecondaryClasses = [
    "bg-[#0D0D0D]",
    "bg-[#101411]",
    "bg-[#0A1021]",
    "bg-[#15110E]",
    "bg-[#0D0C1A]",
    "bg-[#0b0e1a]",
    "bg-[#161616]",
    "bg-[#170E0E]",
    "bg-[#0A0707]",
    "bg-[#1C0D0D]",
    "bg-[#140D0D]",
  ];
  const bgInputClasses = [
    "bg-[#1A1A1A]",
    "bg-[#202822]",
    "bg-[#18254A]",
    "bg-[#2B221A]",
    "bg-[#1A1933]",
    "bg-[#181d33]",
    "bg-[#1C1C1C]",
    "bg-[#1D1D2D]",
    "bg-[#202020]",
  ];
  const bgBorderTintClasses = [
    "bg-[#222222]",
    "bg-[#2A2A2A]",
    "bg-[#333333]",
    "bg-[#2D3830]",
    "bg-[#24376C]",
    "bg-[#3A2E22]",
    "bg-[#27264D]",
    "bg-[#252525]",
    "bg-zinc-800",
    "bg-[#27272A]",
  ];

  const borderMainClasses = [
    "border-[#222222]",
    "border-zinc-800",
    "border-neutral-800",
  ];
  const borderSoftClasses = [
    "border-[#1A1A1A]",
    "border-[#1D1D1D]",
    "border-[#1F1F1F]",
    "border-[#1C1C1C]",
  ];
  const borderStrongClasses = ["border-[#444444]", "border-[#333333]", "border-[#3F3F46]"];

  const textPrimaryClasses = [
    "text-white",
    "text-[#FAFAFA]",
    "text-[#E5E5E5]",
  ];

  const textSecondaryClasses = [
    "text-[#888888]",
    "text-zinc-400",
    "text-neutral-400",
    "text-[#999999]",
    "text-[#8c9bb5]",
    "text-[#A1A1AA]",
  ];
  const textMutedClasses = [
    "text-[#666666]",
    "text-[#444444]",
    "text-[#555555]",
    "text-[#333333]",
    "text-zinc-500",
    "text-neutral-500",
    "text-[#71717A]",
  ];

  const notChatbot = ":not(.floating-chatbot-root):not(.floating-chatbot-root *)";

  const css = `
    :root {
      --vos-bg-app: ${colors.bgApp};
      --vos-bg-card: ${colors.bgCard};
      --vos-bg-secondary: ${colors.bgSecondary};
      --vos-bg-input: ${colors.bgInput};
      --vos-border: ${colors.border};
      --vos-text-primary: ${colors.textPrimary};
      --vos-text-secondary: ${colors.textSecondary};
      --vos-text-muted: ${colors.textMuted};
      --vos-accent: ${colors.accent};
      --vos-accent-hover: ${colors.accentHover};
    }

    /* ---- Unified Dashboard Layout Background ---- */
    .dashboard-theme-scope {
      background-color: ${colors.bgApp} !important;
      color: ${colors.textPrimary} !important;
    }

    /* ---- Scoped Dashboard Theme Surfaces (excluding insulated Chatbot) ---- */
    ${scope} ${selAll("", bgAppClasses)}${notChatbot} { background-color: ${colors.bgApp} !important; }
    ${scope} ${selAll("", bgCardClasses)}${notChatbot} { background-color: ${colors.bgCard} !important; }
    ${scope} ${selAll("", bgSecondaryClasses)}${notChatbot} { background-color: ${colors.bgSecondary} !important; }
    ${scope} ${selAll("", bgInputClasses)}${notChatbot} { background-color: ${colors.bgInput} !important; }
    ${scope} ${selAll("", bgBorderTintClasses)}${notChatbot} { background-color: ${colors.border} !important; }

    ${scope} ${selAll("", borderMainClasses)}${notChatbot} { border-color: ${colors.border} !important; }
    ${scope} ${selAll("", borderSoftClasses)}${notChatbot} { border-color: ${mode === "light" ? colors.border : colors.bgInput} !important; }
    ${scope} ${selAll("", borderStrongClasses)}${notChatbot} { border-color: ${borderStrong} !important; }

    /* ---- Text Inversion Rules in Light Mode ---- */
    ${
      mode === "light"
        ? `
      ${scope} ${selAll("", textPrimaryClasses)}${notChatbot}:not([class*="bg-black"]):not([class*="bg-slate-900"]):not([class*="bg-neutral-900"]):not([class*="bg-emerald"]):not(.keep-white) {
        color: ${colors.textPrimary} !important;
      }
      ${scope} ${selAll("", textSecondaryClasses)}${notChatbot} { color: ${colors.textSecondary} !important; }
      ${scope} ${selAll("", textMutedClasses)}${notChatbot} { color: ${colors.textMuted} !important; }
      ${scope} .bg-white.text-black${notChatbot} {
        background-color: ${colors.textPrimary} !important;
        color: ${colors.bgCard} !important;
      }
    `
        : `
      ${scope} ${selAll("", textSecondaryClasses)}${notChatbot} { color: ${colors.textSecondary} !important; }
      ${scope} ${selAll("", textMutedClasses)}${notChatbot} { color: ${colors.textMuted} !important; }
    `
    }

    /* ---- Dashboard Accent (brand) ---- */
    ${scope} .bg-emerald-500, ${scope} .bg-emerald-600, ${scope} .bg-\\[\\#10B981\\] { background-color: ${colors.accent} !important; }
    ${scope} .text-emerald-400, ${scope} .text-emerald-500, ${scope} .text-\\[\\#10B981\\] { color: ${colors.accent} !important; }
    ${scope} .hover\\:bg-emerald-600:hover, ${scope} .hover\\:bg-emerald-500:hover { background-color: ${colors.accentHover} !important; }
    ${scope} .border-emerald-500 { border-color: ${colors.accent} !important; }
    ${scope} .border-emerald-950\\/40 { border-color: ${colors.border} !important; }
    ${scope} .fill-emerald-500, ${scope} .stroke-emerald-500 { fill: ${colors.accent} !important; stroke: ${colors.accent} !important; }

    /* ---- Semantic status badges (theme-independent) ---- */
    ${scope} .bg-\\[\\#0D2A1D\\], ${scope} .bg-\\[\\#0D2214\\], ${scope} .bg-\\[\\#0A2215\\] {
      background-color: ${STATUS.success.bg} !important; border-color: ${STATUS.success.border} !important;
    }
    ${scope} .bg-\\[\\#0D2A1D\\] span, ${scope} .bg-\\[\\#0D2214\\] span, ${scope} .bg-\\[\\#0A2215\\] span { color: ${STATUS.success.text} !important; }
    ${scope} .bg-\\[\\#2D220D\\], ${scope} .bg-\\[\\#1A1208\\], ${scope} .bg-\\[\\#2D1C0F\\], ${scope} .bg-\\[\\#1C120D\\], ${scope} .bg-\\[\\#2D1D0F\\], ${scope} .bg-\\[\\#1C160C\\] {
      background-color: ${STATUS.warning.bg} !important; border-color: ${STATUS.warning.border} !important;
    }
    ${scope} .bg-\\[\\#2D220D\\] span, ${scope} .bg-\\[\\#1A1208\\] span, ${scope} .bg-\\[\\#2D1C0F\\] span { color: ${STATUS.warning.text} !important; }
    ${scope} .bg-\\[\\#0D1D2D\\], ${scope} .bg-\\[\\#1D122D\\] {
      background-color: ${STATUS.info.bg} !important; border-color: ${STATUS.info.border} !important;
    }
    ${scope} .bg-\\[\\#0D1D2D\\] span, ${scope} .bg-\\[\\#1D122D\\] span { color: ${STATUS.info.text} !important; }
    ${scope} .bg-\\[\\#1D120D\\], ${scope} .bg-\\[\\#2D0D0D\\] {
      background-color: ${STATUS.danger.bg} !important; border-color: ${STATUS.danger.border} !important;
    }
    ${scope} .bg-\\[\\#1D120D\\] span { color: ${STATUS.danger.text} !important; }

    ${scope} .text-red-400, ${scope} .text-red-500 { color: ${STATUS.danger.text} !important; }
    ${scope} .bg-red-950\\/20 { background-color: ${STATUS.danger.bg} !important; }
    ${scope} .border-red-900\\/50, ${scope} .border-red-950\\/40 { border-color: ${STATUS.danger.border} !important; }
    ${scope} .text-amber-400 { color: ${STATUS.warning.text} !important; }

    /* ---- High-Contrast Safety Rule: Always keep pure stark white text on black/dark elements ---- */
    .bg-black .text-white, .bg-\\[\\#000000\\] .text-white, .bg-\\[\\#09090B\\] .text-white, 
    .bg-slate-900 .text-white, .bg-neutral-900 .text-white, 
    .bg-emerald-600 .text-white, .bg-emerald-500 .text-white,
    [class*="bg-black/"] .text-white, [class*="bg-white/"] .text-white {
      color: #FFFFFF !important;
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

    /* ================================================================== */
    /* Premium presentation layer — radius, elevation, motion             */
    /* ================================================================== */

    .rounded-sm { border-radius: var(--vos-radius-sm, 10px) !important; }
    .rounded-xs { border-radius: 6px !important; }
    button.rounded-sm, a.rounded-sm, [role="button"].rounded-sm { border-radius: var(--vos-radius-sm, 10px) !important; }

    ${scope} ${selAll("", bgCardClasses)}${notChatbot} { box-shadow: ${mode === "light" ? "var(--vos-shadow-card-light)" : "var(--vos-shadow-card)"}; }

    .transition-all, .transition-colors, .transition-opacity, .transition-transform {
      transition-timing-function: var(--vos-ease-soft) !important;
      transition-duration: 200ms !important;
    }

    button:not(:disabled), [role="button"]:not(:disabled), a.cursor-pointer, .cursor-pointer:not(input):not(select):not(textarea) {
      transition: transform 0.16s var(--vos-ease-soft), box-shadow 0.2s var(--vos-ease-soft), background-color 0.2s var(--vos-ease-soft), border-color 0.2s var(--vos-ease-soft), color 0.2s var(--vos-ease-soft), opacity 0.2s var(--vos-ease-soft);
      will-change: transform;
    }
    button:not(:disabled):hover, [role="button"]:not(:disabled):hover {
      transform: translateY(-1px);
    }
    button:not(:disabled):active, [role="button"]:not(:disabled):active {
      transform: translateY(0) scale(0.98);
    }

    ${scope} input${notChatbot}, ${scope} select${notChatbot}, ${scope} textarea${notChatbot} {
      transition: border-color 0.18s var(--vos-ease-soft), box-shadow 0.18s var(--vos-ease-soft), background-color 0.18s var(--vos-ease-soft) !important;
    }
    ${scope} input${notChatbot}:focus, ${scope} select${notChatbot}:focus, ${scope} textarea${notChatbot}:focus {
      border-color: ${colors.accent} !important;
      box-shadow: 0 0 0 3px ${accentSoft} !important;
    }

    ${scope} table tbody tr:hover {
      background-color: ${rowHover} !important;
    }

    [class*="overflow-y-auto"], [class*="overflow-x-auto"], [class*="overflow-auto"] {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }

    kbd {
      box-shadow: 0 1px 0 rgba(0,0,0,0.4);
    }

    /* ---- Light mode scoped dashboard corrections ---- */
    ${
      mode === "light"
        ? `
      ${scope} .bg-\\[\\#E5E5E5\\]${notChatbot} { background-color: ${colors.bgSecondary} !important; color: ${colors.textPrimary} !important; }
      ${scope} header:not(.landing-header), ${scope} nav:not(.landing-nav) { background-color: ${colors.bgCard} !important; border-color: ${colors.border} !important; }
      ${scope} .hover\\:bg-\\[\\#0A0A0A\\]:hover, ${scope} .hover\\:bg-\\[\\#111111\\]:hover, ${scope} .hover\\:bg-\\[\\#1A1A1A\\]:hover { background-color: ${colors.bgSecondary} !important; }
      ${scope} input${notChatbot}, ${scope} select${notChatbot}, ${scope} textarea${notChatbot} { color: ${colors.textPrimary} !important; background-color: ${colors.bgCard} !important; border-color: ${colors.border} !important; }
      ${scope} ::selection { background: ${colors.accent}33; color: ${colors.textPrimary}; }
      ${scope} ::-webkit-scrollbar-thumb { background-color: ${colors.borderStrong || colors.border}; }
    `
        : ""
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};
