// SoleMate AI - Complete Type Definitions
// Premium Pakistani Custom Footwear Platform

export type Gender = 'men' | 'women';
export type WomenCategory = 'eastern' | 'western';
export type PaymentMethod = 'cod' | 'easypaisa' | 'jazzcash';
export type MaterialTier = 'normal' | 'premium';

// Order Status for Admin Dashboard
export type OrderStatus = 
  | 'new-order' 
  | 'advance-paid'
  | 'in-production' 
  | 'quality-check' 
  | 'ready-for-delivery' 
  | 'delivered' 
  | 'cancelled';

// ============ MEN'S SHOE TYPES ============
export type MenStyle = 
  | 'penny-loafer'       // Classic formal
  | 'chunky-loafer'      // Trendy thick profile
  | 'oxford'             // Classic lace-up
  | 'double-monk'        // Premium buckle style
  | 'chelsea-boot'       // Ankle boot (plain only)
  | 'wingtip-brogue'     // Perforated formal
  | 'tassel-loafer'      // Elegant with tassels
  | 'loro-piana';        // Suede-only, plain only

export type MenMaterial = 
  | 'normal-leather'
  | 'normal-suede'
  | 'premium-leather'
  | 'premium-suede'
  | 'nappa-leather';

export type MenSoleType = 
  | 'leather-sole'
  | 'rubber-sole'
  | 'crepe-sole';

export type MenDetail = 
  | 'plain'
  | 'penny-strap'
  | 'horsebit'
  | 'tassels'
  | 'buckle';

// ============ WOMEN'S SHOE TYPES ============
export type WomenStyle = 
  // Eastern
  | 'khussa'
  | 'punjabi-jutti'
  | 'kolhapuri'
  // Western
  | 'pump'
  | 'block-heel'
  | 'mules'
  | 'stiletto';

// Eastern Materials
export type EasternMaterial = 
  | 'velvet'
  | 'raw-silk'
  | 'brocade'
  | 'leather-eastern';

// Western Materials
export type WesternMaterial =
  | 'genuine-leather'
  | 'suede-western'
  | 'patent-leather'
  | 'synthetic-leather';

// Eastern Embellishments
export type EasternEmbellishment = 
  | 'plain'
  | 'zardozi'
  | 'dabka'
  | 'tilla'
  | 'mirror-work'
  | 'pearls'
  | 'gold-chain';

// Western Embellishments
export type WesternEmbellishment =
  | 'plain'
  | 'bow'
  | 'crystal'
  | 'metallic-accent';

// ============ COLORS - Pakistani Market ============
export type PakistaniColor =
  | 'black'              // Most popular
  | 'dark-brown'         // Second most popular
  | 'chocolate-brown'    // Very versatile
  | 'tan'                // Highly demanded
  | 'camel'              // Neutral trending
  | 'beige'              // Modern trend
  | 'khaki'              // Earthy tone
  | 'navy-blue'          // Popular
  | 'burgundy'           // Rich color
  | 'cream';             // Light neutral

// ============ CONFIGURATION INTERFACES ============
export interface MenConfiguration {
  style: MenStyle | null;
  material: MenMaterial | null;
  soleType: MenSoleType | null;
  detail: MenDetail | null;
  color: PakistaniColor | null;
  size: number | null;
}

export interface WomenConfiguration {
  category: WomenCategory | null;
  style: WomenStyle | null;
  material: EasternMaterial | WesternMaterial | null;
  embellishment: EasternEmbellishment | WesternEmbellishment | null;
  color: PakistaniColor | null;
  size: number | null;
}

export type ShoeConfiguration = 
  | { gender: 'men'; config: MenConfiguration }
  | { gender: 'women'; config: WomenConfiguration };

// ============ PRICING STRUCTURES ============
export interface PricingOption {
  value: string;
  label: string;
  price: number;
  image: string;
  description?: string;
  disabled?: boolean;
  tier?: 'normal' | 'premium';
}

// ============ CUSTOMER & ORDER ============
export interface CustomerDetails {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  city: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  transactionId?: string;
  advanceAmount: number;
}

export interface Order {
  id: string;
  configuration: ShoeConfiguration;
  customer: CustomerDetails;
  payment: PaymentDetails;
  totalPrice: number;
  advancePaid: boolean;
  status: OrderStatus;
  aiGeneratedImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ UI COMPONENT PROPS ============
export interface OptionCardProps {
  value: string;
  label: string;
  image: string;
  price?: number;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

// ============ DASHBOARD ============
export interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  ordersInProduction: number;
  pendingOrders: number;
  advancePending: number;
}

export interface KanbanColumn {
  status: OrderStatus;
  title: string;
  orders: Order[];
}
