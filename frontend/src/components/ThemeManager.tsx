import React from 'react';
import { useAuth } from '../context/AuthContext';

export const THEME_PRESETS = {
  slate: {
    dark: {
      bgApp: '#0A0A0A',
      bgCard: '#111111',
      bgSecondary: '#0D0D0D',
      bgInput: '#1A1A1A',
      border: '#222222',
      textPrimary: '#FFFFFF',
      textSecondary: '#E5E5E5',
      textMuted: '#888888',
      accent: '#10B981',
      accentHover: '#059669',
    },
    light: {
      bgApp: '#F9FAFB',
      bgCard: '#FFFFFF',
      bgSecondary: '#F3F4F6',
      bgInput: '#E5E7EB',
      border: '#E5E7EB',
      textPrimary: '#111827',
      textSecondary: '#374151',
      textMuted: '#6B7280',
      accent: '#0284C7',
      accentHover: '#0369A1',
    }
  },
  sage: {
    dark: {
      bgApp: '#0C0F0D',
      bgCard: '#151A16',
      bgSecondary: '#101411',
      bgInput: '#202822',
      border: '#2D3830',
      textPrimary: '#F2F7F4',
      textSecondary: '#C8DCD0',
      textMuted: '#84A996',
      accent: '#4CAF50',
      accentHover: '#388E3C',
    },
    light: {
      bgApp: '#F4F7F5',
      bgCard: '#FFFFFF',
      bgSecondary: '#E9EFEA',
      bgInput: '#DCE6DD',
      border: '#CED9D0',
      textPrimary: '#1E2D24',
      textSecondary: '#3C5245',
      textMuted: '#688574',
      accent: '#2E7D32',
      accentHover: '#1B5E20',
    }
  },
  sapphire: {
    dark: {
      bgApp: '#060B18',
      bgCard: '#0E172E',
      bgSecondary: '#0A1021',
      bgInput: '#18254A',
      border: '#24376C',
      textPrimary: '#EAF1FF',
      textSecondary: '#9CB7F9',
      textMuted: '#6789D8',
      accent: '#F59E0B',
      accentHover: '#D97706',
    },
    light: {
      bgApp: '#F0F4FA',
      bgCard: '#FFFFFF',
      bgSecondary: '#E2EAF4',
      bgInput: '#D4E0F0',
      border: '#C2D1E5',
      textPrimary: '#0C1E3E',
      textSecondary: '#1C3A6B',
      textMuted: '#526D97',
      accent: '#1D4ED8',
      accentHover: '#1E40AF',
    }
  },
  warm: {
    dark: {
      bgApp: '#110F0C',
      bgCard: '#1B1611',
      bgSecondary: '#15110E',
      bgInput: '#2B221A',
      border: '#3A2E22',
      textPrimary: '#FDF6E2',
      textSecondary: '#F5E1C8',
      textMuted: '#B2A18D',
      accent: '#D97706',
      accentHover: '#B45309',
    },
    light: {
      bgApp: '#FBF8F3',
      bgCard: '#FFFFFF',
      bgSecondary: '#F5EFE4',
      bgInput: '#EFE6D4',
      border: '#E3D5BE',
      textPrimary: '#292524',
      textSecondary: '#44403C',
      textMuted: '#78716C',
      accent: '#C2410C',
      accentHover: '#9A3412',
    }
  },
  tokyo: {
    dark: {
      bgApp: '#090812',
      bgCard: '#111021',
      bgSecondary: '#0D0C1A',
      bgInput: '#1A1933',
      border: '#27264D',
      textPrimary: '#F0EFFF',
      textSecondary: '#C3BEF7',
      textMuted: '#8A84C4',
      accent: '#C084FC',
      accentHover: '#A855F7',
    },
    light: {
      bgApp: '#FAF9FF',
      bgCard: '#FFFFFF',
      bgSecondary: '#F1EFFF',
      bgInput: '#E6E1FF',
      border: '#D8D1FC',
      textPrimary: '#1B143F',
      textSecondary: '#3C3175',
      textMuted: '#6D5EA6',
      accent: '#7C3AED',
      accentHover: '#6D28D9',
    }
  }
};

export const ThemeManager: React.FC = () => {
  const { preferences } = useAuth();
  
  const mode = preferences.themeMode || 'dark';
  const theme = preferences.themeName || 'slate';
  
  let colors = THEME_PRESETS.slate.dark;
  
  if (theme === 'custom' && preferences.customThemeColors) {
    colors = preferences.customThemeColors;
  } else if (THEME_PRESETS[theme as keyof typeof THEME_PRESETS]) {
    colors = THEME_PRESETS[theme as keyof typeof THEME_PRESETS][mode as 'dark' | 'light'];
  } else {
    // default fallbacks
    colors = THEME_PRESETS.slate[mode as 'dark' | 'light'];
  }

  // Construct specific CSS overrides mapping our exact tailwind dark scheme to the active palette
  const css = `
    /* Body & Root Overrides */
    body, html, #root {
      background-color: ${colors.bgApp} !important;
      color: ${colors.textPrimary} !important;
    }
    
    /* Background Utilities Overrides */
    .bg-\\[\\#0A0A0A\\], .bg-\\[\\#070707\\], .bg-\\[\\#0C0F0D\\], .bg-\\[\\#060B18\\], .bg-\\[\\#110F0C\\], .bg-\\[\\#090812\\] {
      background-color: ${colors.bgApp} !important;
    }
    .bg-\\[\\#111111\\], .bg-\\[\\#151A16\\], .bg-\\[\\#0E172E\\], .bg-\\[\\#1B1611\\], .bg-\\[\\#111021\\], .bg-\\[\\#121624\\], .bg-\\[\\#0C0C0C\\], .bg-\\[\\#141414\\] {
      background-color: ${colors.bgCard} !important;
    }
    .bg-\\[\\#0D0D0D\\], .bg-\\[\\#101411\\], .bg-\\[\\#0A1021\\], .bg-\\[\\#15110E\\], .bg-\\[\\#0D0C1A\\], .bg-\\[\\#0b0e1a\\], .bg-\\[\\#151515\\], .bg-\\[\\#0F0F0F\\], .bg-\\[\\#161616\\] {
      background-color: ${colors.bgSecondary} !important;
    }
    .bg-\\[\\#1A1A1A\\], .bg-\\[\\#202822\\], .bg-\\[\\#18254A\\], .bg-\\[\\#2B221A\\], .bg-\\[\\#1A1933\\], .bg-\\[\\#181d33\\], .bg-\\[\\#1C1C1C\\], .bg-\\[\\#252525\\], .bg-\\[\\#1D1D2D\\] {
      background-color: ${colors.bgInput} !important;
    }
    .bg-\\[\\#222222\\], .bg-\\[\\#2A2A2A\\], .bg-\\[\\#333333\\], .bg-\\[\\#2D3830\\], .bg-\\[\\#24376C\\], .bg-\\[\\#3A2E22\\], .bg-\\[\\#27264D\\], .bg-zinc-800 {
      background-color: ${colors.border} !important;
    }
    
    /* Border Utilities Overrides */
    .border-\\[\\#222222\\], .border-\\[\\#333333\\], .border-\\[\\#111111\\], .border-\\[\\#1A1A1A\\], .border-zinc-800, .border-neutral-800 {
      border-color: ${colors.border} !important;
    }
    
    /* Text Utilities Overrides */
    .text-white, .text-\\[\\#E5E5E5\\] {
      color: ${colors.textPrimary} !important;
    }
    .text-\\[\\#888888\\], .text-zinc-400, .text-neutral-400 {
      color: ${colors.textSecondary} !important;
    }
    .text-\\[\\#666666\\], .text-\\[\\#444444\\], .text-zinc-500, .text-neutral-500 {
      color: ${colors.textMuted} !important;
    }
    
    /* Primary Accent / Branding Color (Emerald Overrides) */
    .bg-emerald-500, .bg-emerald-600, .bg-\\[\\#10B981\\] {
      background-color: ${colors.accent} !important;
    }
    .text-emerald-400, .text-emerald-500, .text-\\[\\#10B981\\] {
      color: ${colors.accent} !important;
    }
    .hover\\:bg-emerald-600:hover, .hover\\:bg-emerald-500:hover {
      background-color: ${colors.accentHover} !important;
    }
    .border-emerald-500 {
      border-color: ${colors.accent} !important;
    }
    .border-emerald-950\\/40 {
      border-color: ${colors.border} !important;
    }
    
    /* Normalization of status badges for LIGHT MODE */
    ${mode === 'light' ? `
      /* Light mode badge corrections */
      .bg-\\[\\#0D2A1D\\], .bg-\\[\\#0D2214\\] {
        background-color: #DEF7EC !important;
        color: #03543F !important;
        border: 1px solid #BCF0DA !important;
      }
      .bg-\\[\\#0D2A1D\\] span, .bg-\\[\\#0D2214\\] span {
        color: #03543F !important;
      }
      .bg-\\[\\#2D220D\\], .bg-\\[\\#1A1208\\], .bg-\\[\\#2D1C0F\\] {
        background-color: #FDF6B2 !important;
        color: #723B13 !important;
        border: 1px solid #FCE8E6 !important;
      }
      .bg-\\[\\#2D220D\\] span {
        color: #723B13 !important;
      }
      .bg-\\[\\#0D1D2D\\], .bg-\\[\\#1D122D\\] {
        background-color: #E1EFFE !important;
        color: #1E429F !important;
        border: 1px solid #C3DDFD !important;
      }
      .bg-\\[\\#0D1D2D\\] span, .bg-\\[\\#1D122D\\] span {
        color: #1E429F !important;
      }
      .bg-\\[\\#1D120D\\], .bg-\\[\\#2D0D0D\\] {
        background-color: #FDE8E8 !important;
        color: #9B1C1C !important;
        border: 1px solid #F8B4B4 !important;
      }
      .bg-\\[\\#1D120D\\] span {
        color: #9B1C1C !important;
      }
      
      /* Reset light backgrounds inside light mode */
      .bg-\\[\\#E5E5E5\\] {
        background-color: ${colors.bgSecondary} !important;
        color: ${colors.textPrimary} !important;
      }
      
      /* Invert logo, navigation background and general headers appropriately */
      header, nav {
        background-color: ${colors.bgCard} !important;
        border-color: ${colors.border} !important;
      }
      
      /* Hover list items */
      .hover\\:bg-\\[\\#0A0A0A\\]:hover, .hover\\:bg-\\[\\#111111\\]:hover {
        background-color: ${colors.bgSecondary} !important;
      }
      
      /* Input elements text color correction */
      input, select, textarea {
        color: ${colors.textPrimary} !important;
        background-color: ${colors.bgCard} !important;
        border-color: ${colors.border} !important;
      }
    ` : ''}
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: css }} />
  );
};
