// SoleMate AI - Order Review Modal v2.0
// Complete order summary with COD advance payment system

import { useState } from 'react';
import { X, MessageCircle, Check, Copy, Phone, User, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DesignStore } from '@/hooks/useDesignStore';
import type { PaymentMethod, CustomerDetails, PaymentDetails } from '@/types';
import { getAdvanceAmount, PAKISTANI_COLORS } from '@/data/shoeOptions';

interface OrderReviewModalProps {
  designStore: DesignStore;
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: (customer: CustomerDetails, payment: PaymentDetails) => void;
}

// WhatsApp Business Number - UPDATE THIS
const WHATSAPP_NUMBER = '923025605446';

export function OrderReviewModal({ designStore, isOpen, onClose, onConfirmOrder }: OrderReviewModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentMethod>('cod');
  const [customerInfo, setCustomerInfo] = useState<CustomerDetails>({
    fullName: '',
    phoneNumber: '',
    deliveryAddress: '',
    city: 'Lahore',
  });
  const [transactionId, setTransactionId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;
  
  const totalPrice = designStore.getCurrentPrice();
  const advanceAmount = getAdvanceAmount(totalPrice);
  const config = designStore.getConfiguration();
  
  if (!config) return null;
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!customerInfo.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?92[\s-]?\d{3}[\s-]?\d{7}$/.test(customerInfo.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Enter valid Pakistani number (+92 XXX XXXXXXX)';
    }
    
    if (!customerInfo.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required';
    }
    
    if (!customerInfo.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if ((activeTab === 'easypaisa' || activeTab === 'jazzcash') && !transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    } else if ((activeTab === 'easypaisa' || activeTab === 'jazzcash') && transactionId.trim().length < 10) {
      newErrors.transactionId = 'Transaction ID must be at least 10 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const generateWhatsAppMessage = (): string => {
    const gender = config?.gender === 'men' ? 'Men' : 'Women';
    const configData = config?.config as any;
    
    let message = `🎉 *NEW ORDER - SoleMate AI*\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*Customer Details:*\n`;
    message += `👤 Name: ${customerInfo.fullName}\n`;
    message += `📞 Phone: ${customerInfo.phoneNumber}\n`;
    message += `📍 Address: ${customerInfo.deliveryAddress}, ${customerInfo.city}\n\n`;
    
    message += `*Order Details:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🚻 Gender: ${gender}\n`;
    
    if (config?.gender === 'women') {
      message += `💎 Category: ${configData.category === 'eastern' ? 'Eastern' : 'Western'}\n`;
    }
    
    message += `👟 Style: ${configData.style?.replace(/-/g, ' ')}\n`;
    message += `🧵 Material: ${configData.material?.replace(/-/g, ' ')}\n`;
    
    if (config?.gender === 'men') {
      message += `👞 Sole: ${configData.soleType?.replace(/-/g, ' ')}\n`;
      message += `✨ Detail: ${configData.detail?.replace(/-/g, ' ')}\n`;
    } else {
      message += `✨ Embellishment: ${configData.embellishment?.replace(/-/g, ' ')}\n`;
    }
    
    const colorLabel = PAKISTANI_COLORS.find(c => c.value === configData.color)?.label || configData.color;
    message += `🎨 Color: ${colorLabel}\n`;
    message += `📏 Size: EU ${configData.size}\n\n`;
    
    message += `*Payment:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💳 Method: ${activeTab === 'cod' ? 'Cash on Delivery' : activeTab === 'easypaisa' ? 'Easypaisa' : 'JazzCash'}\n`;
    if (activeTab !== 'cod' && transactionId) {
      message += `🧾 TID: ${transactionId}\n`;
    }
    if (activeTab === 'cod') {
      message += `💰 Total: PKR ${totalPrice.toLocaleString()}\n`;
      message += `💵 Advance Required: PKR ${advanceAmount.toLocaleString()}\n`;
      message += `💵 Balance on Delivery: PKR ${(totalPrice - advanceAmount).toLocaleString()}\n`;
    } else {
      message += `💰 Total Paid: PKR ${totalPrice.toLocaleString()}\n`;
    }
    message += `\nThank you for choosing SoleMate AI! 🙏`;
    
    return encodeURIComponent(message);
  };
  
  const handleWhatsAppCheckout = () => {
    if (!validateForm()) return;
    
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    const paymentDetails: PaymentDetails = {
      method: activeTab,
      advanceAmount,
      ...(activeTab !== 'cod' && { transactionId }),
    };
    
    onConfirmOrder(customerInfo, paymentDetails);
  };
  
  const copyPaymentNumber = () => {
    navigator.clipboard.writeText('03025605446');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const configData = config.config as any;
  
  // Get color hex for display
  const colorHex = PAKISTANI_COLORS.find(c => c.value === configData.color)?.hex;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 bg-white border-b">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Review Your Order</h2>
            <p className="text-sm text-slate-500">Complete your custom shoe order</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 sm:p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Order Summary */}
            <div className="space-y-4">
              {/* Design Preview */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Your Design</h3>
                <div className="aspect-square rounded-xl bg-white overflow-hidden mb-4 shadow-sm">
                  {designStore.generatedImage ? (
                    <img src={designStore.generatedImage} alt="Your design" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No preview generated
                    </div>
                  )}
                </div>
                
                {/* Configuration Summary */}
                <div className="space-y-2 text-sm">
                  {config.gender === 'women' && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Category</span>
                      <Badge variant={configData.category === 'eastern' ? 'default' : 'secondary'} 
                        className={configData.category === 'eastern' ? 'bg-amber-600' : 'bg-rose-500'}>
                        {configData.category === 'eastern' ? 'Eastern' : 'Western'}
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Style</span>
                    <span className="font-medium capitalize">{configData.style?.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Material</span>
                    <span className="font-medium capitalize">{configData.material?.replace(/-/g, ' ')}</span>
                  </div>
                  {config.gender === 'men' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sole</span>
                        <span className="font-medium capitalize">{configData.soleType?.replace(/-/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Detail</span>
                        <span className="font-medium capitalize">{configData.detail?.replace(/-/g, ' ')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Embellishment</span>
                      <span className="font-medium capitalize">{configData.embellishment?.replace(/-/g, ' ')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Color</span>
                    <div className="flex items-center gap-2">
                      {colorHex && (
                        <div 
                          className="w-4 h-4 rounded-full border border-slate-200" 
                          style={{ backgroundColor: colorHex }}
                        />
                      )}
                      <span className="font-medium">
                        {PAKISTANI_COLORS.find(c => c.value === configData.color)?.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Size</span>
                    <span className="font-medium">EU {configData.size}</span>
                  </div>
                </div>
                
                {/* Price Breakdown */}
                <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Price</span>
                    <span className="font-semibold">PKR {totalPrice.toLocaleString()}</span>
                  </div>
                  {activeTab === 'cod' && (
                    <>
                      <div className="flex justify-between text-sm text-amber-700">
                        <span>Advance Payment (COD)</span>
                        <span className="font-semibold">PKR {advanceAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Balance on Delivery</span>
                        <span>PKR {(totalPrice - advanceAmount).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Customer & Payment */}
            <div className="space-y-4">
              {/* Customer Details */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <User className="w-4 h-4" />
                  Customer Details
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={customerInfo.fullName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                      className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={customerInfo.phoneNumber}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="+92 300 1234567"
                      className={errors.phoneNumber ? 'border-red-500' : ''}
                    />
                    {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Input
                      id="address"
                      value={customerInfo.deliveryAddress}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      placeholder="House #, Street, Area"
                      className={errors.deliveryAddress ? 'border-red-500' : ''}
                    />
                    {errors.deliveryAddress && <p className="text-xs text-red-500 mt-1">{errors.deliveryAddress}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Lahore, Karachi, etc."
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                </div>
              </div>
              
              {/* Payment Selection */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </h3>
                
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PaymentMethod)}>
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="cod">COD</TabsTrigger>
                    <TabsTrigger value="easypaisa">Easypaisa</TabsTrigger>
                    <TabsTrigger value="jazzcash">JazzCash</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="cod" className="mt-4">
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <AlertDescription className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">Cash on Delivery with Advance</p>
                        <p>An advance payment of PKR {advanceAmount.toLocaleString()} is required to confirm your order.</p>
                        <p className="text-xs mt-2">Balance of PKR {(totalPrice - advanceAmount).toLocaleString()} to be paid on delivery.</p>
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  <TabsContent value="easypaisa" className="mt-4 space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-800">Easypaisa Payment</h4>
                          <p className="text-sm text-green-700 mt-1">Send PKR {totalPrice.toLocaleString()} to:</p>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="px-3 py-1 bg-white rounded-lg text-green-800 font-mono">03XX-XXXXXXX</code>
                            <button onClick={copyPaymentNumber} className="p-1 hover:bg-green-100 rounded">
                              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-green-600" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="tid">Transaction ID (TID) *</Label>
                      <Input
                        id="tid"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter TID from Easypaisa"
                        className={errors.transactionId ? 'border-red-500' : ''}
                      />
                      {errors.transactionId && <p className="text-xs text-red-500 mt-1">{errors.transactionId}</p>}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="jazzcash" className="mt-4 space-y-4">
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-800">JazzCash Payment</h4>
                          <p className="text-sm text-purple-700 mt-1">Send PKR {totalPrice.toLocaleString()} to:</p>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="px-3 py-1 bg-white rounded-lg text-purple-800 font-mono">03XX-XXXXXXX</code>
                            <button onClick={copyPaymentNumber} className="p-1 hover:bg-purple-100 rounded">
                              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-purple-600" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="tid-jazz">Transaction ID (TID) *</Label>
                      <Input
                        id="tid-jazz"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter TID from JazzCash"
                        className={errors.transactionId ? 'border-red-500' : ''}
                      />
                      {errors.transactionId && <p className="text-xs text-red-500 mt-1">{errors.transactionId}</p>}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* WhatsApp CTA */}
              <Button
                onClick={handleWhatsAppCheckout}
                className="w-full py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg font-semibold shadow-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Confirm Order via WhatsApp
              </Button>
              
              <p className="text-center text-xs text-slate-500">
                Your order details will be sent to our team via WhatsApp for quick processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
