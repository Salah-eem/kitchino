'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/authStore';

export default function CheckoutPage() {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuthStore();
  const { items, subtotal, total, clear } = useCartStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'PAYPAL' | 'COD'>('CARD');
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '', street: '', city: '', state: '', zipCode: '', country: '',
  });

  useEffect(() => {
    if (!user) {
      toast.error('Please login to checkout');
      router.push(`/${locale}/auth/login?redirect=checkout`);
    }
  }, [user, router, locale]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyDiscount = async () => {
    if (!discountCode) return;
    setIsValidating(true);
    try {
      const res = await apiClient.validateDiscount(discountCode, subtotal);
      setAppliedDiscount(res.data);
      toast.success('Discount applied!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid discount code');
      setAppliedDiscount(null);
    } finally {
      setIsValidating(false);
    }
  };

  const finalTotal = Math.max((total - (appliedDiscount?.discountAmount || 0)), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsProcessing(true);
    try {
      const response = await apiClient.createOrder({
        items: items.map((item) => ({ 
          productId: item.productId, 
          quantity: item.quantity,
          price: item.product.price 
        })),
        shippingAddress: formData,
        discountCode: appliedDiscount?.code,
        paymentMethod,
      });

      const { url, orderId } = response.data;

      if (url) {
        window.location.href = url;
      } else {
        clear();
        toast.success('Order placed successfully!');
        router.push(`/${locale}/checkout/success?orderId=${orderId}`);
      }
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all text-sm";

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-400 font-serif text-lg">Your cart is empty</p>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'CARD', name: 'Credit Card', icon: CreditCard, description: 'Pay securely with Stripe' },
    { id: 'PAYPAL', name: 'PayPal', icon: ShoppingBag, description: 'Fast and secure payment' },
    { id: 'COD', name: 'Cash on Delivery', icon: MapPin, description: 'Pay when you receive' },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-sm uppercase tracking-[0.2em] font-medium">Complete Your Order</span>
            <h1 className="text-4xl font-serif font-bold text-white mt-2">Checkout</h1>
            <div className="w-12 h-[1px] bg-gradient-to-r from-gold to-transparent mt-4" />
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="glass p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-white">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required className={inputClass} />
                  <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required className={inputClass} />
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required className={`${inputClass} col-span-2`} />
                  <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} required className={`${inputClass} col-span-2`} />
                  <input type="text" name="street" placeholder="Street Address" value={formData.street} onChange={handleInputChange} required className={`${inputClass} col-span-2`} />
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required className={inputClass} />
                  <input type="text" name="state" placeholder="State/Province" value={formData.state} onChange={handleInputChange} required className={inputClass} />
                  <input type="text" name="zipCode" placeholder="Zip Code" value={formData.zipCode} onChange={handleInputChange} required className={inputClass} />
                  <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} required className={inputClass} />
                </div>
              </div>

              <div className="glass p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gold" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-white">Payment Method</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-4 rounded-xl border text-left transition-all group ${
                        paymentMethod === method.id 
                          ? 'bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]' 
                          : 'bg-dark-surface border-white/5 hover:border-gold/30'
                      }`}
                    >
                      <method.icon className={`w-6 h-6 mb-3 ${paymentMethod === method.id ? 'text-gold' : 'text-gray-500 group-hover:text-gold/50'}`} />
                      <p className={`font-bold text-sm ${paymentMethod === method.id ? 'text-white' : 'text-gray-400'}`}>{method.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-gold" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-white">Discount Code</h2>
                </div>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Enter code (e.g. WELCOME10)" 
                    value={discountCode} 
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} 
                    className={inputClass} 
                  />
                  <Button 
                    type="button" 
                    variant="gold" 
                    onClick={handleApplyDiscount}
                    disabled={isValidating || !discountCode}
                    className="flex-shrink-0 px-8"
                  >
                    {isValidating ? '...' : 'Apply'}
                  </Button>
                </div>
                {appliedDiscount && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex justify-between items-center">
                    <div className="text-green-500 text-sm font-medium">
                      Code <span className="font-bold">{appliedDiscount.code}</span> applied!
                    </div>
                    <button type="button" onClick={() => setAppliedDiscount(null)} className="text-xs text-green-500/50 hover:text-green-500">Remove</button>
                  </motion.div>
                )}
              </div>

              <Button type="submit" variant="gold" size="lg" disabled={isProcessing} className="w-full">
                <CreditCard className="w-5 h-5" />
                {isProcessing ? 'Processing...' : `Place Order — $${finalTotal.toFixed(2)}`}
              </Button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="glass-gold p-6 sticky top-24">
              <h2 className="text-lg font-serif font-bold text-white mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 border-b border-gold/10 pb-6">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-400 truncate mr-2">{item.product.name} × {item.quantity}</span>
                      <span className="text-gray-200 flex-shrink-0">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-gray-200">${(subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Shipping</span>
                    <span className="text-gray-200">$10.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Tax (10%)</span>
                    <span className="text-gray-200">${((subtotal || 0) * 0.1).toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-green-500 font-medium">
                      <span>Discount ({appliedDiscount.code})</span>
                      <span>-${appliedDiscount.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-serif font-bold text-white text-lg">Total</span>
                <span className="text-3xl font-bold text-gold">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
