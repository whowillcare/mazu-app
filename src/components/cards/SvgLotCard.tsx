'use client';

import React from 'react';

export type CardTheme = 'obsidian' | 'cinnabar' | 'celadon';

export interface SvgLotCardProps {
  lotNumber: number;
  ganzhiZh: string;
  titleZh: string;
  titleEn: string;
  theme?: CardTheme;
  language?: 'en' | 'zh-TW' | 'mixed';
  className?: string;
  showFoilShimmer?: boolean;
}

export const SvgLotCard: React.FC<SvgLotCardProps> = ({
  lotNumber,
  ganzhiZh,
  titleZh,
  titleEn,
  theme = 'obsidian',
  language = 'en',
  className = '',
  showFoilShimmer = true,
}) => {
  const padNum = String(lotNumber).padStart(2, '0');
  const sealSrc = `/assets/cards/seals/seal_${padNum}.png`;
  const artworkSrc = `/assets/cards/lot_${padNum}_card.jpg`;

  // Theme palettes
  const themeColors = {
    obsidian: {
      bg: '#070B11',
      innerBg: '#0D141F',
      goldPrimary: '#D4AF37',
      goldSecondary: '#E8C96C',
      goldMuted: 'rgba(212, 175, 55, 0.45)',
      textMain: '#F5E6BE',
      sealTint: '#C8382B',
      borderRule: 'rgba(212, 175, 55, 0.65)',
    },
    cinnabar: {
      bg: '#1A0C0E',
      innerBg: '#281215',
      goldPrimary: '#F2A65A',
      goldSecondary: '#FAD089',
      goldMuted: 'rgba(242, 166, 90, 0.45)',
      textMain: '#FFF0D4',
      sealTint: '#E83E2D',
      borderRule: 'rgba(242, 166, 90, 0.65)',
    },
    celadon: {
      bg: '#0A1414',
      innerBg: '#122120',
      goldPrimary: '#A2BAA8',
      goldSecondary: '#C5D8CC',
      goldMuted: 'rgba(162, 186, 168, 0.45)',
      textMain: '#E8F3EB',
      sealTint: '#B84A39',
      borderRule: 'rgba(162, 186, 168, 0.60)',
    },
  }[theme];

  return (
    <div
      className={`relative inline-block select-none overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 group ${className}`}
      style={{
        width: '320px',
        height: '480px',
        background: themeColors.bg,
      }}
    >
      <svg
        viewBox="0 0 400 600"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Greek Key / Meander Corner Pattern */}
          <pattern
            id="greekCorner"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,0 H20 V20 H10 V10 H15 V15 H5 V5 H20"
              fill="none"
              stroke={themeColors.goldPrimary}
              strokeWidth="1.2"
            />
          </pattern>

          {/* Central Artwork Clipping Mask */}
          <clipPath id="artworkPortal">
            <rect x="36" y="142" width="328" height="340" rx="6" />
          </clipPath>

          {/* Subtle Radial Vignette for Center */}
          <radialGradient id="portalVignette" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(7, 11, 17, 0.85)" />
          </radialGradient>

          {/* Shimmer Light Gradient */}
          <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(232, 201, 108, 0.18)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* 1. Base Slate Background */}
        <rect width="400" height="600" fill={themeColors.bg} />

        {/* 2. Outer Greek Key / Double Border (Strict lot_01 standard) */}
        <rect
          x="16"
          y="16"
          width="368"
          height="568"
          rx="10"
          fill="none"
          stroke={themeColors.borderRule}
          strokeWidth="1.5"
        />
        <rect
          x="24"
          y="24"
          width="352"
          height="552"
          rx="6"
          fill="none"
          stroke={themeColors.goldMuted}
          strokeWidth="0.8"
        />

        {/* Corner Accents (4 Corners) */}
        <g stroke={themeColors.goldPrimary} strokeWidth="1.2" fill="none">
          {/* Top Left */}
          <path d="M 28 40 L 40 40 L 40 28" />
          {/* Top Right */}
          <path d="M 372 40 L 360 40 L 360 28" />
          {/* Bottom Left */}
          <path d="M 28 560 L 40 560 L 40 572" />
          {/* Bottom Right */}
          <path d="M 372 560 L 360 560 L 360 572" />
        </g>

        {/* 3. Top Serial Number (Standard lot_01 style: universal Arabic numeral) */}
        <text
          x="200"
          y="56"
          textAnchor="middle"
          fill={themeColors.goldSecondary}
          fontFamily="Cinzel, 'Noto Serif SC', serif"
          fontSize="26"
          fontWeight="bold"
          letterSpacing="2"
        >
          {lotNumber}
        </text>

        {/* 4. Top Seal Stamp (Centered directly below top serial number) */}
        <foreignObject x="175" y="72" width="50" height="50">
          <div className="w-full h-full flex items-center justify-center">
            {/* Fallback authentic 2x2 seal stamp */}
            <img
              src={sealSrc}
              alt={`${ganzhiZh} 印`}
              className="w-10 h-10 object-contain drop-shadow-md rounded-[4px]"
              onError={(e) => {
                // If specific seal not found, render text badge
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            />
          </div>
        </foreignObject>

        {/* 5. Center Sacred Geometry Artwork (Clipped into clean inner portal) */}
        <g clipPath="url(#artworkPortal)">
          <image
            href={artworkSrc}
            x="20"
            y="95"
            width="360"
            height="435"
            preserveAspectRatio="xMidYMid slice"
          />
          {/* Portal edge vignette */}
          <rect
            x="36"
            y="142"
            width="328"
            height="340"
            fill="url(#portalVignette)"
          />
        </g>

        {/* Inner Portal Frame Rule */}
        <rect
          x="36"
          y="142"
          width="328"
          height="340"
          rx="6"
          fill="none"
          stroke={themeColors.goldMuted}
          strokeWidth="1"
        />

        {/* 6. Bottom Typography Footer (Dynamic Multilingual) */}
        {/* Classical Chinese Title */}
        <text
          x="200"
          y="518"
          textAnchor="middle"
          fill={themeColors.textMain}
          fontFamily="'Noto Serif SC', 'Songti SC', serif"
          fontSize="19"
          fontWeight="600"
          letterSpacing="4"
        >
          {language === 'en' ? `${titleZh} · ${ganzhiZh}` : titleZh}
        </text>

        {/* English Title / Localized Subtitle */}
        <text
          x="200"
          y="545"
          textAnchor="middle"
          fill={themeColors.goldPrimary}
          fontFamily="Cinzel, 'Times New Roman', serif"
          fontSize="11"
          fontWeight="500"
          letterSpacing="2"
        >
          {titleEn.toUpperCase()}
        </text>

        {/* 7. Hover Gold Foil Shimmer Animation */}
        {showFoilShimmer && (
          <rect
            width="400"
            height="600"
            fill="url(#shimmerGradient)"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          />
        )}
      </svg>
    </div>
  );
};
