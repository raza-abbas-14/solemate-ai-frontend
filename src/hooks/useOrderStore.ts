// SoleMate AI - Order Store Hook v2.0
// Order management with advance payment system
// Updated: Eastern/Western categories, Pakistani colors

import { useState, useCallback } from 'react';
import type { Order, OrderStatus, ShoeConfiguration, CustomerDetails, PaymentDetails, DashboardMetrics, KanbanColumn } from '@/types';
import { getAdvanceAmount } from '@/data/shoeOptions';

function generateOrderId(): string {
  const prefix = 'SM';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

const sampleOrders: Order[] = [
  {
    id: 'SM-A7B2-KL9',
    configuration: {
      gender: 'women',
      config: {
        category: 'eastern',
        style: 'khussa',
        material: 'velvet',
        embellishment: 'zardozi',
        color: 'burgundy',
        size: 38,
      },
    },
    customer: {
      fullName: 'Ayesha Khan',
      phoneNumber: '+92 300 1234567',
      deliveryAddress: '123 Garden Town, Lahore',
      city: 'Lahore',
    },
    payment: { 
      method: 'easypaisa', 
      transactionId: '12345678901',
      advanceAmount: 2000,
    },
    totalPrice: 8000,
    advancePaid: true,
    status: 'in-production',
    aiGeneratedImage: '/images/generated/sample-1.jpg',
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'SM-X9P3-MN2',
    configuration: {
      gender: 'men',
      config: {
        style: 'oxford',
        material: 'premium-leather',
        soleType: 'leather-sole',
        detail: 'plain',
        color: 'black',
        size: 42,
      },
    },
    customer: {
      fullName: 'Ahmed Hassan',
      phoneNumber: '+92 321 9876543',
      deliveryAddress: '456 DHA Phase 5, Lahore',
      city: 'Lahore',
    },
    payment: { 
      method: 'cod',
      advanceAmount: 3000,
    },
    totalPrice: 15000,
    advancePaid: false,
    status: 'new-order',
    aiGeneratedImage: '/images/generated/sample-2.jpg',
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'SM-Q5R8-XY7',
    configuration: {
      gender: 'women',
      config: {
        category: 'western',
        style: 'block-heel',
        material: 'genuine-leather',
        embellishment: 'plain',
        color: 'beige',
        size: 39,
      },
    },
    customer: {
      fullName: 'Fatima Ali',
      phoneNumber: '+92 333 4567890',
      deliveryAddress: '789 Gulberg, Lahore',
      city: 'Lahore',
    },
    payment: { 
      method: 'jazzcash', 
      transactionId: '98765432109',
      advanceAmount: 2000,
    },
    totalPrice: 6500,
    advancePaid: true,
    status: 'quality-check',
    aiGeneratedImage: '/images/generated/sample-3.jpg',
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: 'SM-M3N7-PQ8',
    configuration: {
      gender: 'men',
      config: {
        style: 'loro-piana',
        material: 'premium-suede',
        soleType: 'leather-sole',
        detail: 'plain',
        color: 'camel',
        size: 43,
      },
    },
    customer: {
      fullName: 'Omar Farooq',
      phoneNumber: '+92 312 3456789',
      deliveryAddress: '234 Model Town, Lahore',
      city: 'Lahore',
    },
    payment: { 
      method: 'cod',
      advanceAmount: 3000,
    },
    totalPrice: 14500,
    advancePaid: false,
    status: 'advance-paid',
    aiGeneratedImage: '/images/generated/sample-4.jpg',
    createdAt: new Date(Date.now() - 86400000 * 1),
    updatedAt: new Date(Date.now() - 43200000),
  },
];

export type OrderStore = ReturnType<typeof useOrderStore>;

export function useOrderStore() {
  const [orders, setOrders] = useState<Order[]>(sampleOrders);

  const createOrder = useCallback((
    configuration: ShoeConfiguration,
    customer: CustomerDetails,
    payment: PaymentDetails,
    totalPrice: number,
    aiGeneratedImage?: string
  ): Order => {
    const advanceAmount = getAdvanceAmount(totalPrice);
    const advancePaid = payment.method !== 'cod';
    
    const newOrder: Order = {
      id: generateOrderId(),
      configuration,
      customer,
      payment: {
        ...payment,
        advanceAmount,
      },
      totalPrice,
      advancePaid,
      status: payment.method === 'cod' ? 'new-order' : 'advance-paid',
      aiGeneratedImage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() }
        : order
    ));
  }, []);

  const markAdvancePaid = useCallback((orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, advancePaid: true, status: 'advance-paid', updatedAt: new Date() }
        : order
    ));
  }, []);

  const getOrdersByStatus = useCallback((status: OrderStatus): Order[] => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getMetrics = useCallback((): DashboardMetrics => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const ordersInProduction = orders.filter(o => o.status === 'in-production').length;
    const pendingOrders = orders.filter(o => o.status === 'new-order' || o.status === 'advance-paid').length;
    const advancePending = orders.filter(o => !o.advancePaid).length;
    
    return { 
      totalOrders, 
      totalRevenue, 
      ordersInProduction, 
      pendingOrders,
      advancePending,
    };
  }, [orders]);

  const getKanbanColumns = useCallback((): KanbanColumn[] => {
    const columns: { status: OrderStatus; title: string }[] = [
      { status: 'new-order', title: 'New Orders' },
      { status: 'advance-paid', title: 'Advance Paid' },
      { status: 'in-production', title: 'In Production' },
      { status: 'quality-check', title: 'Quality Check' },
      { status: 'ready-for-delivery', title: 'Ready for Delivery' },
      { status: 'delivered', title: 'Delivered' },
    ];
    
    return columns.map(col => ({
      status: col.status,
      title: col.title,
      orders: orders.filter(order => order.status === col.status),
    }));
  }, [orders]);

  return {
    orders,
    createOrder,
    updateOrderStatus,
    markAdvancePaid,
    getOrdersByStatus,
    getMetrics,
    getKanbanColumns,
  };
}
