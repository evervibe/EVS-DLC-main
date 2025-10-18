import React from 'react';

const ISO_TO_FLAG: Record<string, string> = {
  DE: '🇩🇪', US: '🇺🇸', ES: '🇪🇸', FR: '🇫🇷', RU: '🇷🇺',
  JP: '🇯🇵', CN: '🇨🇳', TW: '🇹🇼', IT: '🇮🇹', TR: '🇹🇷',
  NL: '🇳🇱', GB: '🇬🇧'
};

export const LANG_MAP: Record<string, { label: string; country?: string }> = {
  ger: { label: 'Deutsch', country: 'DE' },
  usa: { label: 'English', country: 'US' },
  spn: { label: 'Español', country: 'ES' },
  frc: { label: 'Français', country: 'FR' },
  rus: { label: 'Русский', country: 'RU' },
  jpn: { label: '日本語', country: 'JP' },
  chn: { label: '中文', country: 'CN' },
  twn: { label: '繁體中文', country: 'TW' },
  ita: { label: 'Italiano', country: 'IT' },
  tur: { label: 'Türkçe', country: 'TR' },
  nld: { label: 'Nederlands', country: 'NL' },
  uk: { label: 'English (UK)', country: 'GB' },
  base: { label: 'Base' },
  dev: { label: 'Dev' },
};

export function FlagEmoji({ lang }: { lang: string }) {
  const meta = LANG_MAP[lang];
  const flag = meta?.country ? ISO_TO_FLAG[meta.country] : '🏷️';
  return <span aria-hidden>{flag}</span>;
}
