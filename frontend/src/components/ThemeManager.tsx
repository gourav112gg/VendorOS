import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const THEME_PRESETS = {
  slate: {
    dark: {
      bgApp: "#09090B",
      bgCard: "#18181B",
      bgSecondary: "#121215",
      bgInput: "#09090B",
      border: "#27272A",
      borderStrong: "#3F3F46",
      textPrimary: "#FAFAFA",
      textSecondary: "#A1A1AA",
      textMuted: "#71717A",
      accent: "#FAFAFA",
      accentHover: "#E4E4E7",
    },
    light: {
      bgApp: "#FAF6EE",
      bgCard: "#FFFFFF",
      bgSecondary: "#F4EFE6",
      bgInput: "#EBE3D5",
      border: "#E2D7C3",
      borderStrong: "#C9BA9B",
      textPrimary: "#18181B",
      textSecondary: "#52525B",
      textMuted: "#71717A",
      accent: "#18181B",
      accentHover: "#27272A",
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
      textPrimary: "#202A1E",
      textSecondary: "#445040",
      textMuted: "#78876F",
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
      textPrimary: "#101827",
      textSecondary: "#33445E",
      textMuted: "#64758F",
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
      textPrimary: "#2E2013",
      textSecondary: "#55402A",
      textMuted: "#8A7154",
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
      textPrimary: "#1D1728",
      textSecondary: "#3E3251",
      textMuted: "#6F6086",
      accent: "#7C55B0",
      accentHover: "#664896",
    },
  },
};

// Semantic status colors are intentionally theme-independent so
// success/warning/info/danger read consistently everywhere.
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
const sel = (className: string) =>
  `.${className.replace(/([\[\]#\/:.])/g, "\\$1")}`;
const selAll = (classNames: string[]) => classNames.map(sel).join(", ");

export const ThemeManager: React.FC = () => {
  const { preferences } = useAuth();

  const mode = preferences.themeMode || "dark";
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

  const bgAppClasses = [
    "bg-[#0A0A0A]",
    "bg-[#070707]",
    "bg-[#0C0F0D]",
    "bg-[#060B18]",
    "bg-[#110F0C]",
    "bg-[#090812]",
    "bg-[#09090B]",
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
    "bg-[#18181B]",
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
    "bg-[#121215]",
    "bg-[#170E0E]",
    "bg-[#0A0707]",
    "bg-[#1C0D0D]",
    "bg-[#140D0D]",
    "bg-stone-100/80",
    "bg-stone-200/60",
    "bg-black/5",
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
    "bg-[#09090B]",
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
    "border-[#27272A]",
    "border-red-950/60",
    "border-red-950/40",
    "border-stone-200",
    "border-stone-300",
    "border-black/10",
    "border-black/15",
  ];
  const borderSoftClasses = [
    "border-[#1A1A1A]",
    "border-[#1D1D1D]",
    "border-[#1F1F1F]",
    "border-[#1C1C1C]",
  ];
  const borderStrongClasses = ["border-[#444444]", "border-[#333333]", "border-[#3F3F46]"];

  const textPrimaryClasses = ["text-white", "text-[#E5E5E5]", "text-[#FAFAFA]"];
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

  const css = `
    /* ---- Base surfaces ---- */
    body, html, #root {
      background-color: ${colors.bgApp} !important;
      color: ${colors.textPrimary} !important;
    }

    ${selAll(bgAppClasses)} { background-color: ${colors.bgApp} !important; }
    ${selAll(bgCardClasses)} { background-color: ${colors.bgCard} !important; }
    ${selAll(bgSecondaryClasses)} { background-color: ${colors.bgSecondary} !important; }
    ${selAll(bgInputClasses)} { background-color: ${colors.bgInput} !important; }
    ${selAll(bgBorderTintClasses)} { background-color: ${colors.border} !important; }

    ${selAll(borderMainClasses)} { border-color: ${colors.border} !important; }
    ${selAll(borderSoftClasses)} { border-color: ${mode === "light" ? colors.border : colors.bgInput} !important; }
    ${selAll(borderStrongClasses)} { border-color: ${borderStrong} !important; }

    ${selAll(textPrimaryClasses)} { color: ${colors.textPrimary} !important; }
    ${selAll(textSecondaryClasses)} { color: ${colors.textSecondary} !important; }
    ${selAll(textMutedClasses)} { color: ${colors.textMuted} !important; }

    /* ---- Accent (brand) ---- */
    .bg-emerald-500, .bg-emerald-600, .bg-\\[\\#10B981\\] { background-color: ${colors.accent} !important; }
    .text-emerald-400, .text-emerald-500, .text-\\[\\#10B981\\] { color: ${colors.accent} !important; }
    .hover\\:bg-emerald-600:hover, .hover\\:bg-emerald-500:hover { background-color: ${colors.accentHover} !important; }
    .border-emerald-500 { border-color: ${colors.accent} !important; }
    .border-emerald-950\\/40 { border-color: ${colors.border} !important; }
    .fill-emerald-500, .stroke-emerald-500 { fill: ${colors.accent} !important; stroke: ${colors.accent} !important; }

    /* ---- Semantic status badges (theme-independent, dark & light) ---- */
    .bg-\\[\\#0D2A1D\\], .bg-\\[\\#0D2214\\], .bg-\\[\\#0A2215\\] {
      background-color: ${STATUS.success.bg} !important; border-color: ${STATUS.success.border} !important;
    }
    .bg-\\[\\#0D2A1D\\] span, .bg-\\[\\#0D2214\\] span, .bg-\\[\\#0A2215\\] span { color: ${STATUS.success.text} !important; }
    .bg-\\[\\#2D220D\\], .bg-\\[\\#1A1208\\], .bg-\\[\\#2D1C0F\\], .bg-\\[\\#1C120D\\], .bg-\\[\\#2D1D0F\\], .bg-\\[\\#1C160C\\] {
      background-color: ${STATUS.warning.bg} !important; border-color: ${STATUS.warning.border} !important;
    }
    .bg-\\[\\#2D220D\\] span, .bg-\\[\\#1A1208\\] span, .bg-\\[\\#2D1C0F\\] span { color: ${STATUS.warning.text} !important; }
    .bg-\\[\\#0D1D2D\\], .bg-\\[\\#1D122D\\] {
      background-color: ${STATUS.info.bg} !important; border-color: ${STATUS.info.border} !important;
    }
    .bg-\\[\\#0D1D2D\\] span, .bg-\\[\\#1D122D\\] span { color: ${STATUS.info.text} !important; }
    .bg-\\[\\#1D120D\\], .bg-\\[\\#2D0D0D\\] {
      background-color: ${STATUS.danger.bg} !important; border-color: ${STATUS.danger.border} !important;
    }
    .bg-\\[\\#1D120D\\] span { color: ${STATUS.danger.text} !important; }

    .text-red-400, .text-red-500 { color: ${STATUS.danger.text} !important; }
    .bg-red-950\\/20 { background-color: ${STATUS.danger.bg} !important; }
    .border-red-900\\/50, .border-red-950\\/40 { border-color: ${STATUS.danger.border} !important; }
    .text-amber-400 { color: ${STATUS.warning.text} !important; }

    /* ================================================================== */
    /* Premium presentation layer — radius, elevation, motion             */
    /* ================================================================== */

    .rounded-sm { border-radius: var(--vos-radius-sm, 10px) !important; }
    .rounded-xs { border-radius: 6px !important; }
    button.rounded-sm, a.rounded-sm, [role="button"].rounded-sm { border-radius: var(--vos-radius-sm, 10px) !important; }

    ${selAll(bgCardClasses)} { box-shadow: ${mode === "light" ? "var(--vos-shadow-card-light)" : "var(--vos-shadow-card)"}; }

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

    input, select, textarea {
      transition: border-color 0.18s var(--vos-ease-soft), box-shadow 0.18s var(--vos-ease-soft), background-color 0.18s var(--vos-ease-soft) !important;
    }
    input:focus, select:focus, textarea:focus {
      border-color: ${colors.accent} !important;
      box-shadow: 0 0 0 3px ${accentSoft} !important;
    }

    tbody tr, [class*="divide-y"] > div {
      transition: background-color 0.16s var(--vos-ease-soft);
    }
    table tbody tr:hover {
      background-color: ${rowHover} !important;
    }

    [class*="overflow-y-auto"], [class*="overflow-x-auto"], [class*="overflow-auto"] {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }

    kbd {
      box-shadow: 0 1px 0 rgba(0,0,0,0.4);
    }

    /* ---- Light mode corrections ---- */
    ${
      mode === "light"
        ? `
      .bg-\\[\\#E5E5E5\\] { background-color: ${colors.bgSecondary} !important; color: ${colors.textPrimary} !important; }
      header:not(.landing-header), nav:not(.landing-nav) { background-color: ${colors.bgCard} !important; border-color: ${colors.border} !important; }
      .hover\\:bg-\\[\\#0A0A0A\\]:hover, .hover\\:bg-\\[\\#111111\\]:hover, .hover\\:bg-\\[\\#1A1A1A\\]:hover { background-color: ${colors.bgSecondary} !important; }
      input, select, textarea { color: ${colors.textPrimary} !important; background-color: ${colors.bgCard} !important; border-color: ${colors.border} !important; }
      ::selection { background: ${colors.accent}33; color: ${colors.textPrimary}; }
      ::-webkit-scrollbar-thumb { background-color: ${colors.borderStrong || colors.border}; }
    `
        : ""
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};
