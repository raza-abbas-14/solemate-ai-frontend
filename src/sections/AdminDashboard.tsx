// SoleMate AI - Admin Dashboard v2.0
// Mobile-responsive with hamburger menu and stacked cards

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  DollarSign,
  Package,
  Clock,
  LogOut,
  Search,
  ChevronRight,
  ChevronLeft,
  GripVertical,
  Menu,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { OrderStore } from '@/hooks/useOrderStore';
import { getAllOrders, updateOrderStatus } from '@/services/orderService';
import type { Order as SupabaseOrder } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types';

interface AdminDashboardProps {
  orderStore: OrderStore;
  onLogout: () => void;
}

type ViewMode = 'dashboard' | 'kanban' | 'orders';

const STATUS_COLORS: Record<OrderStatus, string> = {
  'new-order': 'bg-blue-500',
  'advance-paid': 'bg-emerald-500',
  'in-production': 'bg-amber-500',
  'quality-check': 'bg-purple-500',
  'ready-for-delivery': 'bg-green-500',
  'delivered': 'bg-slate-500',
  'cancelled': 'bg-red-500',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  'new-order': 'New Order',
  'advance-paid': 'Advance Paid',
  'in-production': 'In Production',
  'quality-check': 'Quality Check',
  'ready-for-delivery': 'Ready for Delivery',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled',
};

export function AdminDashboard({ orderStore, onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [realOrders, setRealOrders] = useState<SupabaseOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SupabaseOrder | null>(null);

  // Load real orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      const data = await getAllOrders();
      setRealOrders(data);
      setLoadingOrders(false);
    };
    fetchOrders();
    // Refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Database call
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      setRealOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  // Compute Dashboard Metrics directly from realOrders
  const totalOrders = realOrders.length;
  const totalRevenue = realOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
  const ordersInProduction = realOrders.filter(o => o.status === 'in-production').length;
  const pendingOrders = realOrders.filter(o => o.status === 'new-order' || o.status === 'advance-paid' || o.status === 'pending').length;

  // Advance pending definition might mean not safepay or advance paid 
  const advancePending = realOrders.filter(o =>
    o.status !== 'advance-paid' && o.status !== 'in-production' && o.status !== 'ready-for-delivery' && o.status !== 'delivered' && o.payment_method !== 'safepay-full'
  ).length;

  const metrics = {
    totalOrders,
    totalRevenue,
    ordersInProduction,
    pendingOrders,
    advancePending
  };

  // Compile Kanban Columns directly from realOrders
  const columns = [
    { status: 'pending', title: 'Pending Approval' },
    { status: 'new-order', title: 'New Orders' },
    { status: 'advance-paid', title: 'Advance Paid' },
    { status: 'in-production', title: 'In Production' },
    { status: 'quality-check', title: 'Quality Check' },
    { status: 'ready-for-delivery', title: 'Ready for Delivery' },
    { status: 'delivered', title: 'Delivered' },
  ].map(col => ({
    ...col,
    orders: realOrders.filter(o => o.status === col.status)
  }));

  const filteredOrders = realOrders.filter(order =>
    (order.order_number?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (order.customer_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban Board', icon: Package },
    { id: 'orders', label: 'All Orders', icon: ShoppingBag },
  ];

  // Mobile Sidebar Content
  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">SM</span>
            </div>
            <span className="font-bold text-white">SoleMate AI</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">SM</span>
          </div>
        )}
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id as ViewMode);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeView === item.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all ${!sidebarOpen && 'justify-center'
            }`}
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex fixed inset-y-0 left-0 z-40 bg-slate-900 border-r border-slate-800 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <SidebarContent />

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-white" />}
        </button>
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 bg-slate-900 border-slate-800 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        {/* Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-white capitalize">{activeView.replace('-', ' ')}</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="pl-10 w-48 lg:w-64 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
          </div>
        </header>

        {/* Mobile Search */}
        <div className="sm:hidden px-4 py-3 bg-slate-900/50 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="pl-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="p-4 md:p-6">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              {/* Metrics Grid - Stacked on mobile */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
                <MetricCard
                  title="Total Orders"
                  value={metrics.totalOrders.toString()}
                  icon={ShoppingBag}
                  color="from-blue-500 to-blue-600"
                />
                <MetricCard
                  title="Revenue"
                  value={`PKR ${(metrics.totalRevenue / 1000).toFixed(0)}K`}
                  icon={DollarSign}
                  color="from-green-500 to-emerald-600"
                />
                <MetricCard
                  title="In Production"
                  value={metrics.ordersInProduction.toString()}
                  icon={Package}
                  color="from-amber-500 to-orange-600"
                />
                <MetricCard
                  title="Pending"
                  value={metrics.pendingOrders.toString()}
                  icon={Clock}
                  color="from-purple-500 to-pink-600"
                />
                <MetricCard
                  title="Advance Due"
                  value={metrics.advancePending?.toString() || '0'}
                  icon={AlertCircle}
                  color="from-red-500 to-rose-600"
                />
              </div>

              {/* Recent Orders */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-white text-lg">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-3">
                    {realOrders.slice(0, 5).map((order) => (
                      <OrderRow key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === 'kanban' && (
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {columns.map((column) => (
                <div key={column.status} className="flex-shrink-0 w-72 md:w-80">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[column.status as OrderStatus] || 'bg-slate-500'}`} />
                      <h3 className="font-semibold text-white text-sm md:text-base">{column.title}</h3>
                      <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                        {column.orders.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {column.orders.map((order) => (
                      <KanbanCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === 'orders' && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-white text-lg">All Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <OrderRow key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Order Details Sliding Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent side="right" className="w-full sm:w-[540px] bg-slate-900 border-slate-800 p-0 overflow-y-auto">
          {selectedOrder && (
            <div className="p-6 text-slate-200">
              <h2 className="text-xl font-bold text-white mb-4">Order Details</h2>
              <div className="aspect-video w-full rounded-2xl bg-slate-800 overflow-hidden mb-6">
                {selectedOrder.image_url ? (
                  <img src={selectedOrder.image_url} alt="AI Design" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <Package className="w-12 h-12 mb-2 opacity-50" />
                    <p>No Image Available</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Status Update section */}
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Update Status</h3>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      if (selectedOrder.id) {
                        handleStatusChange(selectedOrder.id, e.target.value);
                        setSelectedOrder({ ...selectedOrder, status: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-amber-500"
                  >
                    <option value="pending">Pending Approval</option>
                    <option value="new-order">New Order</option>
                    <option value="advance-paid">Advance Paid</option>
                    <option value="in-production">In Production</option>
                    <option value="quality-check">Quality Check</option>
                    <option value="ready-for-delivery">Ready for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <h3 className="text-xs font-semibold text-slate-400 mb-1 uppercase">Customer</h3>
                    <p className="font-medium text-white">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-slate-400 mt-1">{selectedOrder.customer_phone}</p>
                    <p className="text-sm text-slate-400 mt-2 truncate">{selectedOrder.customer_city}</p>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <h3 className="text-xs font-semibold text-slate-400 mb-1 uppercase">Order Number</h3>
                    <p className="font-mono text-amber-400 mb-2">{selectedOrder.order_number}</p>
                    <h3 className="text-xs font-semibold text-slate-400 mb-1 uppercase">Payment</h3>
                    <p className="text-sm text-white capitalize">{selectedOrder.payment_method?.replace('-', ' ')}</p>
                    <p className="font-semibold text-emerald-400 mt-1">PKR {selectedOrder.total_price?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase">Shoe Configuration</h3>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="text-slate-400">Gender</div>
                    <div className="font-medium text-white capitalize">{selectedOrder.gender}</div>

                    <div className="text-slate-400">Style</div>
                    <div className="font-medium text-white capitalize">{selectedOrder.style?.replace(/-/g, ' ')}</div>

                    <div className="text-slate-400">Material</div>
                    <div className="font-medium text-white capitalize">{selectedOrder.material?.replace(/-/g, ' ')}</div>

                    <div className="text-slate-400">Color</div>
                    <div className="font-medium text-white capitalize">{selectedOrder.color}</div>

                    <div className="text-slate-400">Size</div>
                    <div className="font-medium text-white">EU {selectedOrder.size}</div>

                    {selectedOrder.embellishment && (
                      <>
                        <div className="text-slate-400">Embellishment/Detail</div>
                        <div className="font-medium text-white capitalize">{selectedOrder.embellishment?.replace(/-/g, ' ')}</div>
                      </>
                    )}

                    {selectedOrder.sole && (
                      <>
                        <div className="text-slate-400">Sole</div>
                        <div className="font-medium text-white capitalize">{selectedOrder.sole?.replace(/-/g, ' ')}</div>
                      </>
                    )}
                  </div>
                </div>

                {(selectedOrder.notes || selectedOrder.safepay_reference) && (
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase">Additional Details</h3>
                    {selectedOrder.safepay_reference && (
                      <p className="text-sm text-slate-300 mb-2">Safepay Ref: <span className="font-mono text-emerald-400">{selectedOrder.safepay_reference}</span></p>
                    )}
                    {selectedOrder.notes && (
                      <p className="text-sm text-slate-400">{selectedOrder.notes}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div >
  );
}

function MetricCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="bg-slate-900 border-slate-800 overflow-hidden">
      <CardContent className="p-3 md:p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-slate-400 text-xs md:text-sm truncate">{title}</p>
            <p className="text-xl md:text-3xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderRow({ order, onClick }: { order: SupabaseOrder; onClick: () => void }) {
  const isPaid = order.payment_method?.includes('safepay') || order.status !== 'new-order' && order.status !== 'pending';

  return (
    <div
      onClick={onClick}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors gap-3 sm:gap-0 cursor-pointer"
    >
      <div className="flex items-center gap-3 md:gap-4">
        {order.image_url ? (
          <img src={order.image_url} alt="Order" className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-white text-sm md:text-base">{order.order_number}</p>
          <p className="text-xs md:text-sm text-slate-400 truncate">{order.customer_name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-6">
        <div className="text-right">
          <p className="font-medium text-white text-sm md:text-base">PKR {order.total_price?.toLocaleString() || '0'}</p>
          <div className="flex items-center gap-2 justify-end">
            <p className="text-xs text-slate-400 capitalize">{order.payment_method?.replace('-', ' ')}</p>
            {isPaid ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-500" />
            )}
          </div>
        </div>

        <Badge className={`capitalize text-xs ${STATUS_COLORS[order.status as OrderStatus] || 'bg-slate-500'}`}>
          {STATUS_LABELS[order.status as OrderStatus] || order.status}
        </Badge>

        <ChevronRight className="w-5 h-5 text-slate-500 hidden sm:block" />
      </div>
    </div>
  );
}

function KanbanCard({ order, onClick }: { order: SupabaseOrder; onClick: () => void }) {
  const isPaid = order.payment_method?.includes('safepay') || order.status !== 'new-order' && order.status !== 'pending';

  return (
    <div
      onClick={onClick}
      className="p-3 md:p-4 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-750 transition-colors border border-transparent hover:border-slate-700"
    >
      <div className="aspect-video rounded-lg bg-slate-700 overflow-hidden mb-3">
        {order.image_url ? (
          <img src={order.image_url} alt="Order" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-slate-500" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <p className="font-medium text-white text-xs md:text-sm">{order.order_number}</p>
          <GripVertical className="w-3 h-3 md:w-4 md:h-4 text-slate-500" />
        </div>

        <p className="text-xs md:text-sm text-slate-400 truncate">{order.customer_name}</p>

        <div className="flex items-center justify-between pt-2">
          <p className="font-semibold text-amber-400 text-xs md:text-sm">
            PKR {order.total_price?.toLocaleString() || '0'}
          </p>
          {isPaid ? (
            <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
          )}
        </div>
      </div>
    </div>
  );
}
