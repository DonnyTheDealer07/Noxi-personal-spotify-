/** The names and colors of NOXI's seven original, user-selected palettes. */
export const THEMES = [
  { id: 'marshmallow-galaxy', name: 'Marshmallow Galaxy', subtitle: 'The original NOXI universe', colors: ['#F8F4FF', '#7756ED', '#FF77C8'], dark: false },
  { id: 'royal-ember', name: 'Royal Ember', subtitle: 'Charcoal · royal blue · tangerine', colors: ['#17191E', '#245BEB', '#FF8A24'], dark: true },
  { id: 'abyssal-bloom', name: 'Abyssal Bloom', subtitle: 'Aqua jade · midnight abyss · baby pink', colors: ['#39CDB8', '#080F24', '#FFB7D5'], dark: true },
  { id: 'punk-inferno', name: 'Punk Inferno', subtitle: 'Red orange · snowy white · punk yellow', colors: ['#FF4828', '#FFFAF4', '#F9E400'], dark: false },
  { id: 'cotton-candy-skies', name: 'Cotton Candy Skies', subtitle: 'Sky blue · white · hot pink', colors: ['#75C9FF', '#FFFFFF', '#FF3EA5'], dark: false },
  { id: 'wildwood', name: 'Wildwood', subtitle: 'Forest green · jungle green · pumpkin', colors: ['#123B27', '#27834B', '#FF891C'], dark: true },
  { id: 'sakura-noir', name: 'Sakura Noir', subtitle: 'Deep black · bright white · sakura pink', colors: ['#08080B', '#FFFFFF', '#FFB7C5'], dark: true },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export const DEFAULT_THEME: ThemeId = 'marshmallow-galaxy';

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEMES.some(theme => theme.id === value);
}
