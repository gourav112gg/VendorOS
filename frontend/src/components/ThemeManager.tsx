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
    },
    light: {
      bgApp: "#F0F4F9",
      bgCard: "#FFFFFF",
      bgSecondary: "#E2E8F0",
      bgInput: "#D8E2ED",
      border: "#CBD5E1",
      borderStrong: "#94A3B8",
      textPrimary: "#0F172A",
      textSecondary: "#334155",
      textMuted: "#64748B",
      accent: "#2563EB",
      accentHover: "#1D4ED8",
    },
  },
  obsidian: {
    dark: {
      bgApp: "#0F0F0F",
      bgCard: "#171717",
      bgSecondary: "#141414",
      bgInput: "#212121",
      border: "#2E2E2E",
      borderStrong: "#454545",
      textPrimary: "#FAFAFA",
      textSecondary: "#A3A3A3",
      textMuted: "#737373",
      accent: "#D97706",
      accentHover: "#B45309",
    },
    light: {
      bgApp: "#F7F7F6",
      bgCard: "#FFFFFF",
      bgSecondary: "#ECECEB",
      bgInput: "#E2E2E0",
      border: "#D4D4D1",
      borderStrong: "#A8A8A4",
      textPrimary: "#171717",
      textSecondary: "#525252",
      textMuted: "#737373",
      accent: "#D97706",
      accentHover: "#B45309",
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
    },
    light: {
      bgApp: "#F0FDF4",
      bgCard: "#FFFFFF",
      bgSecondary: "#DCFCE7",
      bgInput: "#D1FAE5",
      border: "#A7F3D0",
      borderStrong: "#6EE7B7",
      textPrimary: "#064E3B",
      textSecondary: "#065F46",
      textMuted: "#047857",
      accent: "#059669",
      accentHover: "#047857",
    },
  },
  graphite: {
    dark: {
      bgApp: "#1C1C24",
      bgCard: "#24242F",
      bgSecondary: "#20202A",
      bgInput: "#2D2D3B",
      border: "#3B3B4D",
      borderStrong: "#52526A",
      textPrimary: "#F5F5FA",
      textSecondary: "#C5C5D8",
      textMuted: "#8E8EA8",
      accent: "#818CF8",
      accentHover: "#6366F1",
    },
    light: {
      bgApp: "#F4F4F8",
      bgCard: "#FFFFFF",
      bgSecondary: "#EAEAF2",
      bgInput: "#DFDFEA",
      border: "#CBCBDD",
      borderStrong: "#A7A7C6",
      textPrimary: "#181824",
      textSecondary: "#424258",
      textMuted: "#686884",
      accent: "#6366F1",
      accentHover: "#4F46E5",
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

// Semantic status colors are intentionally theme-independent
const STATUS = {
  success: {
    bg: "rgba(52,211,153,0.16)",
    text: "#6EE7B7",
    border: "rgba(52,211,153,0.35)",
  },
  warning: {
    bg: "rgba(217,119,6,0.16)",
    text: "#FBBF24",
    border: "rgba(217,119,6,0.35)",
  },
  info: {
    bg: "rgba(96,165,250,0.16)",
    text: "#93C5FD",
    border: "rgba(96,165,250,0.35)",
  },
  danger: {
    bg: "rgba(239,68,68,0.16)",
    text: "#FCA5A5",
    border: "rgba(239,68,68,0.35)",
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
  const theme = preferences.themeName || "midnight";

  useEffect(() => {
    if (mode === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, [mode]);

  let colors: any = THEME_PRESETS.midnight.dark;

  if (theme === "custom" && preferences.customThemeColors) {
    colors = preferences.customThemeColors;
  } else {
    const preset = resolveThemePreset(theme);
    colors = preset[mode as "dark" | "light"] || preset.dark;
  }

  const borderStrong = colors.borderStrong || colors.accent;
  const accentSoft =
    mode === "light" ? `${colors.accent}22` : `${colors.accent}29`;
  const rowHover = mode === "light" ? colors.bgSecondary : `${colors.accent}0F`;

  const scope = ".dashboard-theme-scope";

  const bgAppClasses = [
    "bg-[#0B1120]",
    "bg-[#0F0F0F]",
    "bg-[#0C1A14]",
    "bg-[#1C1C24]",
    "bg-[#0A0A0A]",
    "bg-[#070707]",
    "bg-[#0C0F0D]",
    "bg-[#060B18]",
    "bg-[#110F0C]",
    "bg-[#090812]",
    "bg-[#080606]",
  ];
  const bgCardClasses = [
    "bg-[#111C33]",
    "bg-[#171717]",
    "bg-[#13261F]",
    "bg-[#24242F]",
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
    "bg-[#0E172B]",
    "bg-[#141414]",
    "bg-[#0F1F19]",
    "bg-[#20202A]",
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
    "bg-[#182747]",
    "bg-[#212121]",
    "bg-[#1B332A]",
    "bg-[#2D2D3B]",
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
    "bg-[#1E3159]",
    "bg-[#2E2E2E]",
    "bg-[#24473A]",
    "bg-[#3B3B4D]",
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
    "border-[#1E3159]",
    "border-[#2E2E2E]",
    "border-[#24473A]",
    "border-[#3B3B4D]",
    "border-[#222222]",
    "border-zinc-800",
    "border-neutral-800",
  ];
  const borderSoftClasses = [
    "border-[#182747]",
    "border-[#212121]",
    "border-[#1B332A]",
    "border-[#2D2D3B]",
    "border-[#1A1A1A]",
    "border-[#1D1D1D]",
    "border-[#1F1F1F]",
    "border-[#1C1C1C]",
  ];
  const borderStrongClasses = [
    "border-[#2B457D]",
    "border-[#454545]",
    "border-[#336352]",
    "border-[#52526A]",
    "border-[#444444]",
    "border-[#333333]",
    "border-[#3F3F46]",
  ];

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
    ${scope} .bg-emerald-500, ${scope} .bg-emerald-600, ${scope} .bg-\\[\\#10B981\\],
    ${scope} .bg-blue-500, ${scope} .bg-blue-600, ${scope} .bg-\\[\\#60A5FA\\],
    ${scope} .bg-amber-600, ${scope} .bg-\\[\\#D97706\\],
    ${scope} .bg-indigo-500, ${scope} .bg-\\[\\#818CF8\\] { background-color: ${colors.accent} !important; }

    ${scope} .text-emerald-400, ${scope} .text-emerald-500, ${scope} .text-\\[\\#10B981\\],
    ${scope} .text-blue-400, ${scope} .text-blue-500, ${scope} .text-\\[\\#60A5FA\\],
    ${scope} .text-amber-500, ${scope} .text-\\[\\#D97706\\],
    ${scope} .text-indigo-400, ${scope} .text-\\[\\#818CF8\\] { color: ${colors.accent} !important; }

    ${scope} .hover\\:bg-emerald-600:hover, ${scope} .hover\\:bg-emerald-500:hover,
    ${scope} .hover\\:bg-blue-600:hover, ${scope} .hover\\:bg-blue-500:hover,
    ${scope} .hover\\:bg-amber-600:hover, ${scope} .hover\\:bg-amber-500:hover,
    ${scope} .hover\\:bg-indigo-600:hover, ${scope} .hover\\:bg-indigo-500:hover { background-color: ${colors.accentHover} !important; }

    ${scope} .border-emerald-500, ${scope} .border-blue-500, ${scope} .border-amber-500, ${scope} .border-indigo-500 { border-color: ${colors.accent} !important; }
    ${scope} .border-emerald-950\\/40, ${scope} .border-blue-950\\/40, ${scope} .border-amber-950\\/40, ${scope} .border-indigo-950\\/40 { border-color: ${colors.border} !important; }
    ${scope} .fill-emerald-500, ${scope} .stroke-emerald-500, ${scope} .fill-blue-500, ${scope} .stroke-blue-500 { fill: ${colors.accent} !important; stroke: ${colors.accent} !important; }

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
