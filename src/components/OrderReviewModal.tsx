// SoleMate AI - Order Review Modal v2.0
// Complete order summary with COD advance payment system

import { useState } from 'react';
import { X, CreditCard, ShoppingBag, Truck, ShieldCheck, AlertCircle, MessageCircle, CheckCircle, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DesignStore } from '@/hooks/useDesignStore';
import type { PaymentMethod, CustomerDetails, PaymentDetails } from '@/types';
import { getAdvanceAmount, PAKISTANI_COLORS } from '@/data/shoeOptions';
import { saveOrder, generateOrderNumber, uploadImageToStorage } from '@/services/orderService';
import { createCheckoutSession } from '@/services/safepay';

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
    city: '',
    deliveryAddress: '',
  });
  const [transactionId, setTransactionId] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [isProcessingSafepay, setIsProcessingSafepay] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successReference, setSuccessReference] = useState<string>('');

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

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (!isValid) {
      alert("Please fill in all required Customer Details (Name, Phone, Address, City) completely and correctly before placing your order.");
    }

    return isValid;
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
    message += `💳 Method: ${activeTab === 'cod' ? 'Cash on Delivery' : activeTab === 'safepay-advance' ? 'Safepay (Advance)' : 'Safepay (Full)'}\n`;
    if (activeTab === 'cod') {
      message += `💰 Total: PKR ${totalPrice.toLocaleString()}\n`;
      message += `💵 Advance Required: PKR ${advanceAmount.toLocaleString()}\n`;
      message += `💵 Balance on Delivery: PKR ${(totalPrice - advanceAmount).toLocaleString()}\n`;
    } else {
      const paidAmount = activeTab === 'safepay-advance' ? advanceAmount : totalPrice;
      message += `💰 Total Paid: PKR ${paidAmount.toLocaleString()} via Safepay\n`;
    }
    message += `\nThank you for choosing SoleMate AI! 🙏`;

    return encodeURIComponent(message);
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    const configData = (config as unknown) as Record<string, string>;
    const orderNumber = generateOrderNumber();

    const paymentDetails: PaymentDetails = {
      method: activeTab,
      advanceAmount,
    };

    setIsProcessingSafepay(true);

    // 1. Upload Image to Supabase
    let finalImageUrl = designStore.generatedImage;
    if (finalImageUrl && finalImageUrl.startsWith('data:image')) {
      const storageUrl = await uploadImageToStorage(finalImageUrl);
      if (storageUrl) {
        finalImageUrl = storageUrl;
      }
    }

    // 2. Generate Safepay Session OR handle manual
    let checkoutUrl = '';
    const isManual = activeTab === 'easypaisa' || activeTab === 'jazzcash';
    const needsAdvancePayment = activeTab === 'cod' || activeTab === 'safepay-advance';

    if (!isManual && (needsAdvancePayment || activeTab === 'safepay-full')) {
      try {
        const amountToPay = activeTab === 'safepay-full' ? totalPrice : advanceAmount;
        checkoutUrl = await createCheckoutSession({
          amount: amountToPay, // Our helper expects normal currency value now, backend handles subunits
          orderId: orderNumber,
          source: 'custom'
        });

        // Generate tracking reference
        const mockRef = `track_${Math.floor(Math.random() * 99999)}`;
        paymentDetails.safepayReference = mockRef;
        setSuccessReference(mockRef);

      } catch (err) {
        setIsProcessingSafepay(false);
        console.error("Safepay creation failed", err);
        alert("Failed to connect to Safepay. Please check your API keys or try again.");
        return;
      }
    }

    // 3. Save Order to Database
    const savedOrder = await saveOrder({
      order_number: orderNumber,
      status: 'new-order',
      gender: designStore.selectedGender || '',
      style: configData?.style || '',
      material: configData?.material || '',
      color: configData?.color || '',
      embellishment: configData?.embellishment || configData?.detail || '',
      sole: configData?.soleType || '',
      size: configData?.size || '',
      customer_name: customerInfo.fullName,
      customer_phone: customerInfo.phoneNumber,
      customer_address: customerInfo.deliveryAddress,
      customer_city: customerInfo.city,
      payment_method: activeTab,
      total_price: totalPrice,
      image_url: finalImageUrl || undefined,
      safepay_reference: paymentDetails.safepayReference,
    });

    if (!savedOrder) {
      setIsProcessingSafepay(false);
      alert("Database Error: Failed to save the order! Please ensure your Supabase table schema is updated with 'image_url' and 'safepay_reference'.");
      return;
    }

    if (isManual) {
      // Create targeted WhatsApp Link
      const waMessage = `Hello SoleMate AI! I have placed order #${orderNumber}.\nI will be paying via ${activeTab === 'easypaisa' ? 'Easypaisa' : 'Jazzcash'}. Here will be my receipt:`;
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, '_blank');
    } else if (checkoutUrl) {
      // Open Safepay in a new secure tab so the user doesn't lose their website state
      window.open(checkoutUrl, '_blank');
    }

    setIsProcessingSafepay(false);
    setIsSuccess(true);
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
            <h2 className="text-xl font-bold text-slate-900">
              {isSuccess ? "Order Confirmed!" : "Review Your Order"}
            </h2>
            <p className="text-sm text-slate-500">
              {isSuccess ? "Thank you for shopping with SoleMate AI" : "Complete your custom shoe order"}
            </p>
          </div>
          <button onClick={() => {
            if (isSuccess) {
              onConfirmOrder(customerInfo, { method: activeTab, advanceAmount, safepayReference: successReference });
            } else {
              onClose();
            }
          }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-6 md:p-12 flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4 animate-[bounce_1s_ease-in-out_infinite]">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center">Payment Verified Successfully!</h2>

            <p className="text-center text-slate-500 max-w-md mx-auto">
              Your order is now confirmed and entered into our production queue. We will notify you once it's shipped.
            </p>

            {successReference && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full max-w-sm text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Safepay Reference ID</p>
                <p className="font-mono text-lg text-emerald-600 font-bold">{successReference}</p>
              </div>
            )}

            <Button
              onClick={() => onConfirmOrder(customerInfo, { method: activeTab, advanceAmount, safepayReference: successReference })}
              className="w-full max-w-sm py-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
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

                {/* Payment Selection Hierarchy */}
                <div className="space-y-4">
                  {/* Primary Safepay Options */}
                  <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
                    <div className="bg-emerald-50/50 p-3 border-b border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src="/images/safepay-logo.png"
                          alt="Safepay"
                          className="h-6 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) {
                              fallback.classList.remove('hidden');
                              fallback.classList.add('flex');
                            }
                          }}
                        />
                        <div className="hidden items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          <span className="font-bold tracking-tight text-emerald-800">Safepay</span>
                        </div>
                        <span className="font-semibold text-emerald-900 border-l border-emerald-200 pl-2 ml-1">Secure Checkout</span>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-none text-xs">Fastest</Badge>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Safepay Full Option */}
                      <div
                        onClick={() => setActiveTab('safepay-full')}
                        className={`p-3 border rounded-xl flex items-start gap-3 cursor-pointer transition-all ${activeTab === 'safepay-full' ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-slate-200 hover:border-emerald-300'}`}
                      >
                        <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${activeTab === 'safepay-full' ? 'border-emerald-500' : 'border-slate-300'}`}>
                          {activeTab === 'safepay-full' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 leading-tight">Safepay <span className="text-emerald-600">(Full Amount)</span></p>
                          <p className="text-xs text-slate-500 mt-0.5">Pay PKR {totalPrice.toLocaleString()} instantly via Debit/Credit Card or Wallet.</p>
                        </div>
                      </div>

                      {/* Safepay Advance Option */}
                      <div
                        onClick={() => setActiveTab('safepay-advance')}
                        className={`p-3 border rounded-xl flex items-start gap-3 cursor-pointer transition-all ${activeTab === 'safepay-advance' ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-slate-200 hover:border-emerald-300'}`}
                      >
                        <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${activeTab === 'safepay-advance' ? 'border-emerald-500' : 'border-slate-300'}`}>
                          {activeTab === 'safepay-advance' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 leading-tight">Safepay <span className="text-emerald-600">(Advance Only)</span></p>
                          <p className="text-xs text-slate-500 mt-0.5">Pay standard PKR {advanceAmount.toLocaleString()} advance securely online to begin production.</p>
                        </div>
                      </div>

                      {/* Standard COD Option */}
                      <div
                        onClick={() => setActiveTab('cod')}
                        className={`p-3 border rounded-xl flex items-start gap-3 cursor-pointer transition-all ${activeTab === 'cod' ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-slate-200 hover:border-emerald-300'}`}
                      >
                        <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${activeTab === 'cod' ? 'border-emerald-500' : 'border-slate-300'}`}>
                          {activeTab === 'cod' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 leading-tight">Cash on Delivery <span className="text-amber-600 text-xs italic ml-1">(Requires PK {advanceAmount.toLocaleString()} advance via Safepay)</span></p>
                          <p className="text-xs text-slate-500 mt-0.5">Advance handled via Safepay. Remaining balance of PKR {(totalPrice - advanceAmount).toLocaleString()} paid at doorstep.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual OR Separator */}
                  <div className="relative py-2 flex items-center opacity-70">
                    <div className="flex-grow border-t border-slate-300"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs tracking-widest font-bold uppercase">Or Manual Verification</span>
                    <div className="flex-grow border-t border-slate-300"></div>
                  </div>

                  {/* Secondary Manual Option (Easypaisa) */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div
                      onClick={() => setActiveTab('easypaisa')}
                      className={`p-4 flex flex-col cursor-pointer transition-all hover:bg-slate-50 ${activeTab === 'easypaisa' ? 'bg-slate-50 border-b border-slate-200' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 leading-tight">Easypaisa / Bank Transfer</p>
                          <p className="text-xs text-slate-500">Complete transaction over WhatsApp</p>
                        </div>
                        <div className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${activeTab === 'easypaisa' ? 'border-slate-800' : 'border-slate-300'}`}>
                          {activeTab === 'easypaisa' && <div className="w-2 h-2 rounded-full bg-slate-800"></div>}
                        </div>
                      </div>
                    </div>
                    {/* Expandable Info if Selected */}
                    {activeTab === 'easypaisa' && (
                      <div className="p-4 bg-slate-50/80">
                        <Alert className="bg-blue-50/50 border-blue-100 p-3">
                          <MessageCircle className="w-4 h-4 text-blue-600 shrink-0" />
                          <AlertDescription className="text-[13px] text-blue-800 ml-2 mt-0">
                            Selecting this bypasses our automated cards system. Clicking 'Submit' will save your order into our queue and immediately redirect you to WhatsApp.
                            <strong> Please have your payment screenshot ready to send to our support agent.</strong>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Submission CTA */}
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessingSafepay}
                  className="w-full py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg font-semibold shadow-lg"
                >
                  {isProcessingSafepay ? (
                    <span className="flex items-center">
                      <span className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
                      Verifying Payment...
                    </span>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Place Order & Verify Payment
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-slate-500">
                  Your payment is securely processed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
