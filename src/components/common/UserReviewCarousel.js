'use client';

import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function UserReviewCarousel() {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const reviews = [
    {
      name: 'Rajesh Kumar',
      role: 'Software Engineer',
      location: 'Bangalore',
      image: '👨‍💼',
      text: 'Started with Bronze plan, now upgraded to Gold. Earned ₹45,000 in 3 months. Best passive income platform!',
      rating: 5,
      earnings: '₹45,000',
      timeframe: '3 months'
    },
    {
      name: 'Priya Sharma',
      role: 'Business Owner',
      location: 'Mumbai',
      image: '👩‍💼',
      text: 'The transparency and daily payouts are incredible. My withdrawals are always processed within 24 hours. Highly recommended!',
      rating: 5,
      earnings: '₹78,500',
      timeframe: '5 months'
    },
    {
      name: 'Amit Patel',
      role: 'Student',
      location: 'Delhi',
      image: '👨‍🎓',
      text: 'As a student, this helped me earn while studying. The app is super smooth and secure. No complaints whatsoever!',
      rating: 5,
      earnings: '₹28,900',
      timeframe: '4 months'
    },
    {
      name: 'Deepak Singh',
      role: 'Freelancer',
      location: 'Hyderabad',
      image: '👨‍💻',
      text: 'GoldMine Pro is a game-changer. Stable returns, zero hidden fees, and amazing customer support. Worth every rupee!',
      rating: 5,
      earnings: '₹62,300',
      timeframe: '6 months'
    },
    {
      name: 'Neha Gupta',
      role: 'Homemaker',
      location: 'Pune',
      image: '👩‍🏫',
      text: 'I never thought I could earn this much. GoldMine Pro made it possible. Community is supportive and helpful!',
      rating: 5,
      earnings: '₹35,600',
      timeframe: '3 months'
    },
    {
      name: 'Vikram Reddy',
      role: 'Consultant',
      location: 'Chennai',
      image: '👨‍💼',
      text: 'Professional platform with excellent security. My family and I are all using it. Best investment decision ever!',
      rating: 5,
      earnings: '₹91,200',
      timeframe: '7 months'
    }
  ];

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoplay]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % reviews.length);
    setAutoplay(false);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);
    setAutoplay(false);
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Carousel Container */}
        <div className="relative overflow-hidden rounded-3xl">
          <motion.div
            className="flex"
            animate={{ x: `-${current * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            {reviews.map((review, idx) => (
              <div key={idx} className="w-full flex-shrink-0">
                <div className="bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 text-white p-12 md:p-16 rounded-3xl">
                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(review.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star size={20} className="fill-gold-400 text-gold-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8 italic">
                    "{review.text}"
                  </p>

                  {/* User Info Row */}
                  <div className="flex items-center justify-between pt-8 border-t border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl border border-white/30">
                        {review.image}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{review.name}</p>
                        <p className="text-white/70 text-sm font-mono font-bold uppercase tracking-wider">
                          {review.role} • {review.location}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <p className="text-gold-400 font-bold text-2xl">{review.earnings}</p>
                      <p className="text-white/60 text-[11px] font-mono font-bold uppercase tracking-widest">
                        in {review.timeframe}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all z-10 flex items-center justify-center group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all z-10 flex items-center justify-center group"
        >
          <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setCurrent(idx);
                setAutoplay(false);
              }}
              className={`transition-all ${
                idx === current
                  ? 'bg-dark-50 w-8'
                  : 'bg-dark-300 w-2.5 hover:bg-dark-200'
              }`}
              style={{ height: '4px', borderRadius: '9px' }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
