// SoleMate AI - About / Learn More Section
// Professional landing page sections shown when Learn More is clicked

import { Sparkles, Star, Shield, Truck, Palette, Clock, ChevronRight, CheckCircle, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AboutSectionProps {
  onStartDesigning: () => void;
}

export function AboutSection({ onStartDesigning }: AboutSectionProps) {
  return (
    <div id="about-section" className="bg-white">

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 mb-4">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              From design to delivery in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                icon: Palette,
                title: 'Choose Your Style',
                desc: 'Pick from our curated collection of men\'s and women\'s shoe styles — from classic Oxfords to traditional Khussas.',
                color: 'bg-amber-100 text-amber-600',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'Customize Everything',
                desc: 'Select your material, color, embellishments, sole type and size. Every detail is in your hands.',
                color: 'bg-orange-100 text-orange-600',
              },
              {
                step: '03',
                icon: Star,
                title: 'See AI Preview',
                desc: 'Our AI generates a realistic preview of your custom shoe before you place the order. See it before you buy it.',
                color: 'bg-yellow-100 text-yellow-600',
              },
              {
                step: '04',
                icon: Truck,
                title: 'We Deliver',
                desc: 'Our master karigar crafts your shoe by hand and we deliver it straight to your doorstep across Pakistan.',
                color: 'bg-green-100 text-green-600',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-amber-200 to-transparent z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="text-xs font-bold text-amber-400 tracking-widest mb-3">STEP {item.step}</div>
                    <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-4 shadow-sm`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 mb-6">
                <Heart className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Why SoleMate AI</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Pakistan's First AI-Powered <span className="text-amber-500">Shoe Platform</span>
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                We combine cutting-edge AI technology with the timeless craft of Pakistani artisans. 
                Every pair is uniquely yours — designed by you, built by hand.
              </p>
              <div className="space-y-4">
                {[
                  'AI-generated preview before you order — no surprises',
                  'Master karigar with 10+ years of experience',
                  'Premium materials sourced locally in Pakistan',
                  'WhatsApp-based order tracking — always in the loop',
                  'Cash on Delivery, Easypaisa & JazzCash accepted',
                  'Nationwide delivery across all of Pakistan',
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Clock, title: '7-14 Days', subtitle: 'Delivery Time', color: 'from-amber-400 to-orange-500' },
                { icon: Shield, title: '100%', subtitle: 'Handcrafted', color: 'from-green-400 to-emerald-500' },
                { icon: Star, title: '50+', subtitle: 'Designs', color: 'from-blue-400 to-indigo-500' },
                { icon: Heart, title: 'Made With', subtitle: 'Love in Pakistan 🇵🇰', color: 'from-pink-400 to-rose-500' },
              ].map((card, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-bold text-2xl text-gray-900">{card.title}</div>
                  <div className="text-gray-500 text-sm mt-1">{card.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-lg">Everything you need to know before ordering</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'How long does delivery take?',
                a: 'Each pair is handcrafted to order. Delivery typically takes 7-14 working days from order confirmation. We\'ll keep you updated via WhatsApp throughout the process.',
              },
              {
                q: 'Can I see the shoe before paying?',
                a: 'Yes! Our AI generates a realistic preview of your custom shoe before you confirm the order. What you see is what you get — our karigar follows the AI preview exactly.',
              },
              {
                q: 'What payment methods are accepted?',
                a: 'We accept Cash on Delivery (COD), Easypaisa, and JazzCash. For COD orders, a small advance payment may be required to confirm the order.',
              },
              {
                q: 'Do you deliver across all of Pakistan?',
                a: 'Yes! We deliver nationwide across Pakistan including Karachi, Lahore, Islamabad, Peshawar, Quetta and all other cities.',
              },
              {
                q: 'What if the shoe doesn\'t fit?',
                a: 'We use EU sizing and guide you through the size selection carefully. If there\'s a sizing issue on our end, we\'ll work with you to make it right. Contact us on WhatsApp immediately.',
              },
              {
                q: 'How do I track my order?',
                a: 'After placing your order via WhatsApp, our team will provide regular updates on production and delivery status. You can also message us anytime to get an update.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                  <span className="text-amber-500 font-black">Q.</span>
                  {faq.q}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">👟</div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to Design Your<br/>Perfect Pair?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Join hundreds of satisfied customers who wear their own unique design. 
            It takes less than 5 minutes to create yours.
          </p>
          <Button
            size="lg"
            onClick={onStartDesigning}
            className="bg-white text-amber-600 hover:bg-amber-50 px-10 py-6 text-lg font-bold rounded-2xl shadow-2xl shadow-amber-900/30"
          >
            <Sparkles className="w-6 h-6 mr-2" />
            Start Designing Now — It's Free
          </Button>
          <p className="text-white/60 text-sm mt-6">No account needed · WhatsApp checkout · Nationwide delivery</p>
        </div>
      </section>

    </div>
  );
}
