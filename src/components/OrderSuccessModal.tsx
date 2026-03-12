// SoleMate AI - Order Success Modal

import { CheckCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderSuccessModalProps {
  onNewDesign: () => void;
}

export function OrderSuccessModal({ onNewDesign }: OrderSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold font-playfair text-slate-900 mb-2">
          Order Confirmed!
        </h3>
        
        <p className="text-slate-600 mb-8">
          Thank you for your order. We've received your details and will begin crafting your custom shoes soon.
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onNewDesign} className="w-full">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
