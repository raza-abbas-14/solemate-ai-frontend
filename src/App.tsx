// SoleMate AI - Main Application
// Premium Pakistani Custom Footwear Platform

import { useState } from 'react';
import { Sparkles, Menu, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GenderSelection } from '@/sections/GenderSelection';
import { HeroSection } from '@/sections/HeroSection';
import { AboutSection } from '@/sections/AboutSection';
import { MenConfigurator } from '@/sections/MenConfigurator';
import { WomenConfigurator } from '@/sections/WomenConfigurator';
import { OrderReviewModal } from '@/components/OrderReviewModal';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { AdminDashboard } from '@/sections/AdminDashboard';
import { useDesignStore } from '@/hooks/useDesignStore';
import { useOrderStore } from '@/hooks/useOrderStore';
import type { Gender, CustomerDetails, PaymentDetails } from '@/types';
import './App.css';

type AppView = 'landing' | 'gender-select' | 'configurator' | 'admin' | 'admin-login';

// SECRET ADMIN PASSWORD — change this to whatever you want
const ADMIN_PASSWORD = 'SoleMate@2025';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [showOrderReview, setShowOrderReview] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      setAdminError(false);
      setCurrentView('admin');
    } else {
      setAdminError(true);
      setAdminPassword('');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminPassword('');
    setCurrentView('landing');
  };
  
  const designStore = useDesignStore();
  const orderStore = useOrderStore();
  
  const handleGenderSelect = (gender: Gender) => {
    designStore.setGender(gender);
    setCurrentView('configurator');
  };
  
  const handleConfirmOrder = (customer: CustomerDetails, payment: PaymentDetails) => {
    const config = designStore.getConfiguration();
    const totalPrice = designStore.getCurrentPrice();
    const generatedImage = designStore.generatedImage || undefined;
    
    if (config) {
      orderStore.createOrder(config, customer, payment, totalPrice, generatedImage);
      setShowOrderReview(false);
      setShowOrderSuccess(true);
    }
  };
  
  const handleNewDesign = () => {
    designStore.resetAll();
    setShowOrderSuccess(false);
    setCurrentView('landing');
  };
  
  const renderContent = () => {
    switch (currentView) {
      case 'landing':
        return (
          <>
            <HeroSection 
              onStartDesigning={() => setCurrentView('gender-select')} 
              onLearnMore={() => {
                const el = document.getElementById('about-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* About / Learn More Section */}
            <AboutSection onStartDesigning={() => setCurrentView('gender-select')} />
            
            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xl font-bold font-playfair">SoleMate AI</span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Pakistan's first AI-powered custom footwear platform. Handcrafted by master artisans.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-slate-400 text-sm">
                      <li><button onClick={() => setCurrentView('gender-select')} className="hover:text-amber-400 transition-colors">Design Studio</button></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Contact</h4>
                    <ul className="space-y-2 text-slate-400 text-sm">
                      <li>
                        <a href="mailto:solemate.ai.14@gmail.com" className="hover:text-amber-400 transition-colors">
                          solemate.ai.14@gmail.com
                        </a>
                      </li>
                      <li>
                        <a href="https://wa.me/923025605446" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                          +92 302 5605446
                        </a>
                      </li>
                      <li className="text-slate-500 text-xs mt-1">Pakistan</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Follow Us</h4>
                    <div className="flex gap-3">
                      <a 
                        href="https://www.instagram.com/solemate.ai.14" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 transition-colors"
                        title="Instagram"
                      >
                        <span className="text-sm font-semibold">IG</span>
                      </a>
                      <a 
                        href="https://www.facebook.com/share/1FUfLKwN69/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                        title="Facebook"
                      >
                        <span className="text-sm font-semibold">FB</span>
                      </a>
                      <a 
                        href="https://www.tiktok.com/@solemate.ai.14" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-black transition-colors border border-slate-700 hover:border-white"
                        title="TikTok"
                      >
                        <span className="text-sm font-semibold">TK</span>
                      </a>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-slate-500 text-xs">@solemate.ai.14</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
                  © 2025 SoleMate AI. All rights reserved. Handcrafted in Pakistan.
                </div>
              </div>
            </footer>
          </>
        );
        
      case 'gender-select':
        return (
          <div>
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <button
                    onClick={() => setCurrentView('landing')}
                    className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold font-playfair bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">SoleMate AI</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-16">
              <GenderSelection onSelectGender={handleGenderSelect} />
            </div>
          </div>
        );
        
      case 'configurator':
        if (designStore.selectedGender === 'men') {
          return (
            <MenConfigurator
              designStore={designStore}
              onReviewOrder={() => setShowOrderReview(true)}
              onBack={() => setCurrentView('gender-select')}
            />
          );
        }
        return (
          <WomenConfigurator
            designStore={designStore}
            onReviewOrder={() => setShowOrderReview(true)}
            onBack={() => setCurrentView('gender-select')}
          />
        );
        
      case 'admin-login':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Access</h1>
                <p className="text-slate-500 text-sm mt-2">Enter your password to continue</p>
              </div>

              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => { setAdminPassword(e.target.value); setAdminError(false); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-amber-500 transition-colors ${adminError ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                />
                {adminError && (
                  <p className="text-red-500 text-sm text-center">❌ Incorrect password. Try again.</p>
                )}
                <Button
                  onClick={handleAdminLogin}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold text-base"
                >
                  Login to Dashboard
                </Button>
                <button
                  onClick={() => setCurrentView('landing')}
                  className="w-full text-slate-400 hover:text-slate-600 text-sm transition-colors py-2"
                >
                  ← Back to Website
                </button>
              </div>
            </div>
          </div>
        );

      case 'admin':
        if (!isAdminLoggedIn) {
          setCurrentView('admin-login');
          return null;
        }
        return <AdminDashboard orderStore={orderStore} onLogout={handleAdminLogout} />;
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation - Only show on landing */}
      {currentView === 'landing' && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold font-playfair bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  SoleMate AI
                </span>
              </div>
              
              <div className="hidden md:flex items-center gap-8">
                <Button 
                  onClick={() => setCurrentView('gender-select')}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Design Your Shoes
                </Button>
              </div>
              
              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
              <Button onClick={() => { setCurrentView('gender-select'); setMobileMenuOpen(false); }} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                Design Your Shoes
              </Button>
            </div>
          )}
        </nav>
      )}
      
      <main className={currentView === 'landing' ? 'pt-16' : ''}>
        {renderContent()}
      </main>
      
      {showOrderReview && (
        <OrderReviewModal
          designStore={designStore}
          isOpen={showOrderReview}
          onClose={() => setShowOrderReview(false)}
          onConfirmOrder={handleConfirmOrder}
        />
      )}
      
      {showOrderSuccess && (
        <OrderSuccessModal
          onNewDesign={handleNewDesign}
          onViewOrders={() => { setShowOrderSuccess(false); setCurrentView('admin'); }}
        />
      )}
    </div>
  );
}

export default App;
