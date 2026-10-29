/** Colors a credit card can be drawn in. Keys match accounts.card_color. */
export const cardColorKeys = [
  'forest',
  'graphite',
  'navy',
  'petrol',
  'plum',
  'burgundy',
  'espresso',
  'copper',
  'black',
  'champagne',
  'silver',
] as const

export type CardColor = (typeof cardColorKeys)[number]

type Swatch = {
  label: string
  /** Card background on a light page, and on a dark page (slightly lifted). */
  bg: string
  bgDark: string
  /** Text and bar color on the card. */
  fg: string
  /** The empty part of the limit bar. */
  track: string
}

const onDark = 'rgba(255, 255, 255, 0.16)'
const onLight = 'rgba(0, 0, 0, 0.14)'

export const cardColors: Record<CardColor, Swatch> = {
  forest: { label: 'Forest', bg: '#123c2c', bgDark: '#1c4a37', fg: '#eef5f1', track: onDark },
  graphite: { label: 'Graphite', bg: '#2b2f2d', bgDark: '#353a37', fg: '#eef1ef', track: onDark },
  navy: { label: 'Navy', bg: '#1b2a44', bgDark: '#243655', fg: '#edf1f8', track: onDark },
  petrol: { label: 'Petrol', bg: '#143a40', bgDark: '#1c4a51', fg: '#eaf4f5', track: onDark },
  plum: { label: 'Plum', bg: '#3a2440', bgDark: '#4a2f52', fg: '#f5eef7', track: onDark },
  burgundy: { label: 'Burgundy', bg: '#4a1e25', bgDark: '#5c2730', fg: '#f8edee', track: onDark },
  espresso: { label: 'Espresso', bg: '#3b2a1e', bgDark: '#4a3527', fg: '#f6efe9', track: onDark },
  copper: { label: 'Copper', bg: '#8c4320', bgDark: '#a0512b', fg: '#fbf1ea', track: onDark },
  black: { label: 'Black', bg: '#121212', bgDark: '#1e1e1e', fg: '#f2f2f2', track: onDark },
  champagne: {
    label: 'Champagne',
    bg: '#d9cdb4',
    bgDark: '#cfc2a6',
    fg: '#2a251b',
    track: onLight,
  },
  silver: { label: 'Silver', bg: '#cdd1d3', bgDark: '#c2c7c9', fg: '#1e2224', track: onLight },
}

export const DEFAULT_CARD_COLOR: CardColor = 'forest'

/** The account's card color, falling back to the default for unknown or unset values. */
export function cardColorOf(value: string | null | undefined): CardColor {
  return cardColorKeys.includes(value as CardColor) ? (value as CardColor) : DEFAULT_CARD_COLOR
}
