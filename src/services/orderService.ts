// SoleMate AI - Order Service
// Handles all database operations for orders

import { supabase } from '@/lib/supabase';

export interface Order {
  id?: string;
  order_number: string;
  status: string;
  gender: string;
  style: string;
  material: string;
  color: string;
  embellishment?: string;
  sole?: string;
  size: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  payment_method: string;
  total_price: number;
  notes?: string;
  image_url?: string;
  safepay_reference?: string;
  created_at?: string;
}

// Save a new order to Supabase
export async function saveOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) {
    console.error('Error saving order:', error);
    return null;
  }
  return data;
}

// Get all orders (for admin dashboard)
export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data || [];
}

// Update order status (for admin dashboard)
export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order:', error);
    return false;
  }
  return true;
}

// Upload base64 image to Supabase Storage and return the public URL
export async function uploadImageToStorage(base64Image: string): Promise<string | null> {
  try {
    // Determine the mime type from the base64 string
    const match = base64Image.match(/^data:(image\/[^;]+);base64,/);
    if (!match) {
      console.error('Invalid base64 image format');
      return null;
    }

    const mimeType = match[1];
    const base64Data = base64Image.replace(/^data:image\/[^;]+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const fileName = `design_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;

    const { error: uploadError } = await supabase.storage
      .from('designs') // Creating a bucket named 'designs'
      .upload(fileName, blob, {
        contentType: mimeType,
      });

    if (uploadError) {
      console.error('Error uploading image to storage:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('designs')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading to storage:', error);
    return null;
  }
}

// Generate order number
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `SM-${year}${month}${day}-${random}`;
}
