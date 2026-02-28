// SoleMate AI - Complete Shoe Options Data
// Pakistani Market-Optimized Catalog v2.0
// Restructured: Material-based pricing, Eastern/Western categories

import type { PricingOption } from '@/types';

// ============ MEN'S STYLE OPTIONS (No Base Prices) ============
export const MEN_STYLE_OPTIONS: PricingOption[] = [
  {
    value: 'penny-loafer',
    label: 'Classic Penny Loafer',
    price: 0,
    image: '/images/styles/men-penny-loafer.jpg',
    description: 'Timeless formal elegance with signature strap',
  },
  {
    value: 'chunky-loafer',
    label: 'Chunky Loafer',
    price: 0,
    image: '/images/styles/men-chunky-loafer.jpg',
    description: 'Modern trendy thick sole profile',
  },
  {
    value: 'oxford',
    label: 'Oxford Lace-Up',
    price: 0,
    image: '/images/styles/men-oxford.jpg',
    description: 'Boardroom sophistication, closed lacing',
  },
  {
    value: 'double-monk',
    label: 'Double Monk Strap',
    price: 0,
    image: '/images/styles/men-double-monk.jpg',
    description: 'Premium double buckle style',
  },
  {
    value: 'chelsea-boot',
    label: 'Chelsea Boot',
    price: 0,
    image: '/images/styles/men-chelsea.jpg',
    description: 'Versatile ankle boot with elastic sides (Plain design only)',
  },
  {
    value: 'wingtip-brogue',
    label: 'Wingtip Brogue',
    price: 0,
    image: '/images/styles/men-brogue.jpg',
    description: 'Perforated formal detail, W-shaped toe',
  },
  {
    value: 'tassel-loafer',
    label: 'Tassel Loafer',
    price: 0,
    image: '/images/styles/men-tassel.jpg',
    description: 'Elegant slip-on with decorative tassels',
  },
  {
    value: 'loro-piana',
    label: 'Loro Piana Style',
    price: 0,
    image: '/images/styles/men-loro-piana.jpg',
    description: 'Luxury suede-only, minimalist plain design',
  },
];

// ============ MEN'S MATERIAL OPTIONS (Pricing Tiers) ============
// Normal Tier: PKR 5,500 - 7,000
// Premium Tier: PKR 14,500 - 16,000
export const MEN_MATERIAL_OPTIONS: PricingOption[] = [
  {
    value: 'normal-leather',
    label: 'Classic Leather',
    price: 6000,
    image: '/images/materials/normal-leather.jpg',
    description: 'Quality full-grain leather - PKR 6,000',
    tier: 'normal',
  },
  {
    value: 'normal-suede',
    label: 'Classic Suede',
    price: 5500,
    image: '/images/materials/normal-suede.jpg',
    description: 'Soft velvety texture - PKR 5,500',
    tier: 'normal',
  },
  {
    value: 'premium-leather',
    label: 'Premium Leather',
    price: 15000,
    image: '/images/materials/premium-leather.jpg',
    description: 'Top-grade Italian leather - PKR 15,000',
    tier: 'premium',
  },
  {
    value: 'premium-suede',
    label: 'Premium Suede',
    price: 14500,
    image: '/images/materials/premium-suede.jpg',
    description: 'Luxury calfskin suede - PKR 14,500',
    tier: 'premium',
  },
  {
    value: 'nappa-leather',
    label: 'Nappa Leather',
    price: 16000,
    image: '/images/materials/nappa-leather.jpg',
    description: 'Ultra-soft premium finish - PKR 16,000',
    tier: 'premium',
  },
];

// ============ LORO PIANA SPECIFIC MATERIALS (Suede Only) ============
export const LORO_PIANA_MATERIALS: PricingOption[] = [
  {
    value: 'normal-suede',
    label: 'Classic Suede',
    price: 4500,
    image: '/images/materials/normal-suede.jpg',
    description: 'Soft velvety texture - PKR 4,500',
    tier: 'normal',
  },
  {
    value: 'premium-suede',
    label: 'Premium Suede',
    price: 14500,
    image: '/images/materials/premium-suede.jpg',
    description: 'Luxury calfskin suede - PKR 14,500',
    tier: 'premium',
  },
];

// ============ MEN'S SOLE OPTIONS ============
export const MEN_SOLE_OPTIONS: PricingOption[] = [
  {
    value: 'leather-sole',
    label: 'Leather Sole',
    price: 0,
    image: '/images/soles/leather.jpg',
    description: 'Classic dress sole, elegant',
  },
  {
    value: 'rubber-sole',
    label: 'Rubber Sole',
    price: 800,
    image: '/images/soles/rubber.jpg',
    description: 'Durable & grippy, all-weather',
  },
  {
    value: 'crepe-sole',
    label: 'Crepe Sole',
    price: 1200,
    image: '/images/soles/crepe.jpg',
    description: 'Soft & comfortable, casual',
  },
];

// ============ MEN'S DETAIL OPTIONS ============
// Note: Chelsea Boot and Loro Piana = Plain only
export const MEN_DETAIL_OPTIONS: PricingOption[] = [
  {
    value: 'plain',
    label: 'Plain',
    price: 0,
    image: '/images/details/plain.jpg',
    description: 'Clean minimal look, no embellishments',
  },
  {
    value: 'penny-strap',
    label: 'Penny Strap',
    price: 500,
    image: '/images/details/penny-strap.jpg',
    description: 'Classic penny keeper strap',
  },
  {
    value: 'horsebit',
    label: 'Horsebit Buckle',
    price: 1200,
    image: '/images/details/horsebit.jpg',
    description: 'Signature metal horsebit hardware',
  },
  {
    value: 'tassels',
    label: 'Leather Tassels',
    price: 800,
    image: '/images/details/tassels.jpg',
    description: 'Elegant swing tassel detail',
  },
  {
    value: 'buckle',
    label: 'Metal Buckle',
    price: 600,
    image: '/images/details/buckle.jpg',
    description: 'Classic single buckle accent',
  },
];

// ============ WOMEN'S EASTERN STYLES ============
export const WOMEN_EASTERN_STYLES: PricingOption[] = [
  {
    value: 'khussa',
    label: 'Traditional Khussa',
    price: 0,
    image: '/images/styles/women-khussa.jpg',
    description: 'Elegant pointed-toe classic with curved front',
  },
  {
    value: 'punjabi-jutti',
    label: 'Punjabi Jutti',
    price: 0,
    image: '/images/styles/women-jutti.jpg',
    description: 'Traditional flat shoe with closed toe',
  },
  {
    value: 'kolhapuri',
    label: 'Kolhapuri Sandal',
    price: 0,
    image: '/images/styles/women-kolhapuri.jpg',
    description: 'Traditional flat sandal with straps',
  },
];

// ============ WOMEN'S WESTERN STYLES ============
export const WOMEN_WESTERN_STYLES: PricingOption[] = [
  {
    value: 'pump',
    label: 'Classic Pump',
    price: 0,
    image: '/images/styles/women-pump.jpg',
    description: 'Timeless closed-toe heel',
  },
  {
    value: 'block-heel',
    label: 'Block Heel',
    price: 0,
    image: '/images/styles/women-block-heel.jpg',
    description: 'Stable comfortable wide heel',
  },
  {
    value: 'mules',
    label: 'Elegant Mules',
    price: 0,
    image: '/images/styles/women-mules.jpg',
    description: 'Slip-on backless style',
  },
  {
    value: 'stiletto',
    label: 'Stiletto Heel',
    price: 0,
    image: '/images/styles/women-stiletto.jpg',
    description: 'Elegant slender high heel',
  },
];

// ============ EASTERN MATERIALS ============
export const EASTERN_MATERIALS: PricingOption[] = [
  {
    value: 'velvet',
    label: 'Rich Velvet',
    price: 4500,
    image: '/images/materials/velvet.jpg',
    description: 'Plush luxurious fabric - PKR 4,500',
  },
  {
    value: 'raw-silk',
    label: 'Raw Silk',
    price: 5500,
    image: '/images/materials/raw-silk.jpg',
    description: 'Elegant lustrous finish - PKR 5,500',
  },
  {
    value: 'brocade',
    label: 'Brocade',
    price: 6000,
    image: '/images/materials/brocade.jpg',
    description: 'Woven patterned fabric - PKR 6,000',
  },
  {
    value: 'leather-eastern',
    label: 'Genuine Leather',
    price: 7000,
    image: '/images/materials/leather-eastern.jpg',
    description: 'Quality leather - PKR 7,000',
  },
];

// ============ WESTERN MATERIALS ============
export const WESTERN_MATERIALS: PricingOption[] = [
  {
    value: 'genuine-leather',
    label: 'Genuine Leather',
    price: 6500,
    image: '/images/materials/genuine-leather.jpg',
    description: 'Quality leather - PKR 6,500',
  },
  {
    value: 'suede-western',
    label: 'Premium Suede',
    price: 6000,
    image: '/images/materials/suede-western.jpg',
    description: 'Soft velvety texture - PKR 6,000',
  },
  {
    value: 'patent-leather',
    label: 'Patent Leather',
    price: 7500,
    image: '/images/materials/patent-leather.jpg',
    description: 'High-gloss finish - PKR 7,500',
  },
  {
    value: 'synthetic-leather',
    label: 'Synthetic Leather',
    price: 5000,
    image: '/images/materials/synthetic-leather.jpg',
    description: 'Vegan-friendly option - PKR 5,000',
  },
];

// ============ EASTERN EMBELLISHMENTS (Traditional) ============
export const EASTERN_EMBELLISHMENTS: PricingOption[] = [
  {
    value: 'plain',
    label: 'Plain',
    price: 0,
    image: '/images/embellishments/plain.jpg',
    description: 'Clean unadorned look',
  },
  {
    value: 'zardozi',
    label: 'Zardozi Embroidery',
    price: 3500,
    image: '/images/embellishments/zardozi.jpg',
    description: 'Gold thread work - PKR 3,500',
  },
  {
    value: 'dabka',
    label: 'Dabka Work',
    price: 3000,
    image: '/images/embellishments/dabka.jpg',
    description: 'Silver wire embroidery - PKR 3,000',
  },
  {
    value: 'tilla',
    label: 'Tilla Embroidery',
    price: 2500,
    image: '/images/embellishments/tilla.jpg',
    description: 'Metallic thread work - PKR 2,500',
  },
  {
    value: 'mirror-work',
    label: 'Mirror Work',
    price: 2000,
    image: '/images/embellishments/mirror-work.jpg',
    description: 'Traditional shisha work - PKR 2,000',
  },
  {
    value: 'pearls',
    label: 'Pearl Accents',
    price: 1800,
    image: '/images/embellishments/pearls.jpg',
    description: 'Elegant pearl detail - PKR 1,800',
  },
  {
    value: 'gold-chain',
    label: 'Gold Chain',
    price: 2200,
    image: '/images/embellishments/gold-chain.jpg',
    description: 'Metallic chain accent - PKR 2,200',
  },
];

// ============ WESTERN EMBELLISHMENTS (Modern) ============
export const WESTERN_EMBELLISHMENTS: PricingOption[] = [
  {
    value: 'plain',
    label: 'Plain',
    price: 0,
    image: '/images/embellishments/plain.jpg',
    description: 'Clean minimalist look',
  },
  {
    value: 'bow',
    label: 'Satin Bow',
    price: 800,
    image: '/images/embellishments/bow.jpg',
    description: 'Elegant fabric bow - PKR 800',
  },
  {
    value: 'crystal',
    label: 'Crystal Studs',
    price: 1500,
    image: '/images/embellishments/crystal.jpg',
    description: 'Sparkling crystal accents - PKR 1,500',
  },
  {
    value: 'metallic-accent',
    label: 'Metallic Accent',
    price: 1200,
    image: '/images/embellishments/metallic.jpg',
    description: 'Gold/silver hardware - PKR 1,200',
  },
];

// ============ PAKISTANI MARKET COLORS ============
export const PAKISTANI_COLORS: { value: string; label: string; hex: string }[] = [
  { value: 'black', label: 'Midnight Black', hex: '#0d0d0d' },
  { value: 'dark-brown', label: 'Dark Brown', hex: '#3d2817' },
  { value: 'chocolate-brown', label: 'Chocolate Brown', hex: '#5d4037' },
  { value: 'tan', label: 'Classic Tan', hex: '#a67c52' },
  { value: 'camel', label: 'Camel', hex: '#c19a6b' },
  { value: 'beige', label: 'Beige', hex: '#d4c4a8' },
  { value: 'khaki', label: 'Khaki', hex: '#c3b091' },
  { value: 'navy-blue', label: 'Navy Blue', hex: '#1a2744' },
  { value: 'burgundy', label: 'Burgundy', hex: '#722f37' },
  { value: 'cream', label: 'Cream', hex: '#f5f5dc' },
];

// ============ SIZE OPTIONS ============
export const MEN_SIZES = [39, 40, 41, 42, 43, 44, 45, 46];
export const WOMEN_SIZES = [35, 36, 37, 38, 39, 40, 41, 42];

// ============ ADVANCE PAYMENT RULES ============
// PKR 5,000-6,000 shoes: PKR 2,000 advance
// PKR 15,000+ shoes: PKR 3,000 advance
export const getAdvanceAmount = (totalPrice: number): number => {
  if (totalPrice >= 14000) {
    return 3000;
  } else if (totalPrice >= 5000 && totalPrice <= 7000) {
    return 2000;
  }
  return 2000; // Default
};

// ============ PRICING CALCULATORS ============

// Men's Price Calculator - Material-based pricing
export function calculateMenPrice(config: {
  style: string;
  material: string;
  soleType: string;
  detail: string;
}): number {
  const materialPrice = MEN_MATERIAL_OPTIONS.find(m => m.value === config.material)?.price || 0;
  const solePrice = MEN_SOLE_OPTIONS.find(s => s.value === config.soleType)?.price || 0;
  const detailPrice = MEN_DETAIL_OPTIONS.find(d => d.value === config.detail)?.price || 0;
  
  return materialPrice + solePrice + detailPrice;
}

// Loro Piana Price Calculator - Suede only
export function calculateLoroPianaPrice(config: {
  material: string;
  soleType: string;
}): number {
  const materialPrice = LORO_PIANA_MATERIALS.find(m => m.value === config.material)?.price || 0;
  const solePrice = MEN_SOLE_OPTIONS.find(s => s.value === config.soleType)?.price || 0;
  
  return materialPrice + solePrice;
}

// Women's Eastern Price Calculator
export function calculateEasternPrice(config: {
  style: string;
  material: string;
  embellishment: string;
}): number {
  const materialPrice = EASTERN_MATERIALS.find(m => m.value === config.material)?.price || 0;
  const embellishmentPrice = EASTERN_EMBELLISHMENTS.find(e => e.value === config.embellishment)?.price || 0;
  
  return materialPrice + embellishmentPrice;
}

// Women's Western Price Calculator
export function calculateWesternPrice(config: {
  style: string;
  material: string;
  embellishment: string;
}): number {
  const materialPrice = WESTERN_MATERIALS.find(m => m.value === config.material)?.price || 0;
  const embellishmentPrice = WESTERN_EMBELLISHMENTS.find(e => e.value === config.embellishment)?.price || 0;
  
  return materialPrice + embellishmentPrice;
}

// ============ CONDITIONAL LOGIC HELPERS ============

// Check if style requires plain design only
export const requiresPlainDesign = (style: string): boolean => {
  return style === 'chelsea-boot' || style === 'loro-piana';
};

// Check if style is Loro Piana (suede-only)
export const isLoroPiana = (style: string): boolean => {
  return style === 'loro-piana';
};

// Get available materials for style
export const getMaterialsForStyle = (style: string): PricingOption[] => {
  if (isLoroPiana(style)) {
    return LORO_PIANA_MATERIALS;
  }
  return MEN_MATERIAL_OPTIONS;
};

// Get available details for style
export const getDetailsForStyle = (style: string): PricingOption[] => {
  if (requiresPlainDesign(style)) {
    return MEN_DETAIL_OPTIONS.filter(d => d.value === 'plain');
  }
  return MEN_DETAIL_OPTIONS;
};

// ============ STEP LABELS ============
export const MEN_STEP_LABELS = ['Style', 'Material', 'Sole', 'Detail', 'Color', 'Size'];
export const WOMEN_STEP_LABELS = ['Category', 'Style', 'Material', 'Embellishment', 'Color', 'Size'];

// ============ STYLE-SPECIFIC NOTES ============
export const getStyleNote = (style: string): string | null => {
  if (style === 'chelsea-boot') {
    return 'Chelsea Boot features elastic side panels. Plain design only.';
  }
  if (style === 'loro-piana') {
    return 'Loro Piana style is suede-only with minimalist plain design.';
  }
  return null;
};
