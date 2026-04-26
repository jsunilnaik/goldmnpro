'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  ExternalLink,
} from 'lucide-react';

const faqs = [
  {
    question: 'How does gold mining work?',
    answer: 'After subscribing to a plan, you can start mining sessions. Points accumulate based on your plan\'s mining rate. These points are converted to gold grams and credited to your wallet.',
  },
  {
    question: 'When can I withdraw my earnings?',
    answer: 'Withdrawals are processed on the 15th of every month. You have a 3-day window (15th-17th) to submit your withdrawal request. Minimum withdrawal amount is ₹500.',
  },
  {
    question: 'How are mining points calculated?',
    answer: 'Mining points are calculated based on your plan\'s mining rate (points per hour) multiplied by the duration of your mining session. Higher plans have faster mining rates.',
  },
  {
    question: 'What is the referral program?',
    answer: 'Share your referral code with friends. When they subscribe to a plan, you earn 3-10% of their plan value as bonus, directly credited to your wallet.',
  },
  {
    question: 'Is KYC mandatory for withdrawal?',
    answer: 'Yes, KYC verification (PAN & Aadhar) is required before you can make your first withdrawal. This is for regulatory compliance.',
  },
  {
    question: 'What happens when my plan expires?',
    answer: 'When your plan expires, mining will stop. Your accumulated balance remains in your wallet. You can subscribe to a new plan to continue mining.',
  },
  {
    question: 'Are there any deductions on withdrawal?',
    answer: 'Yes, TDS (Tax Deducted at Source) of 30% is applicable as per Income Tax regulations. A small processing fee of ₹10 may also apply for bank transfers.',
  },
];

export default function SupportPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setSending(true);
    try {
      // In production, this would create a support ticket
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Support ticket submitted! We\'ll respond within 24 hours.');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to submit ticket');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-dark-50">Help & Support</h1>
        <p className="text-dark-500 text-sm mt-1 font-medium">We're here to help you</p>
      </div>

      {/* Quick Contact */}
      <div className="grid grid-cols-2 gap-3">
        <a href="mailto:support@goldminepro.com" className="glass-card p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-dark-800 shadow-sm bg-white">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Mail size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-dark-50">Email Us</p>
            <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">24hr response</p>
          </div>
        </a>
        <a href="tel:+919876543210" className="glass-card p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-dark-800 shadow-sm bg-white">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
            <Phone size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-dark-50">Call Us</p>
            <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">Mon-Sat 10-6</p>
          </div>
        </a>
      </div>

      {/* FAQs */}
      <div className="glass-card overflow-hidden border-dark-800 shadow-sm bg-white">
        <div className="p-4 border-b border-dark-900/5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-dark-50">
            <HelpCircle size={16} className="text-gold-600" />
            Frequently Asked Questions
          </h3>
        </div>
        <div className="divide-y divide-dark-900/5">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-bold text-dark-50 pr-4">{faq.question}</span>
                {openFaq === i ? (
                  <ChevronUp size={16} className="text-gold-600 shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-dark-400 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-3.5"
                >
                  <p className="text-sm text-dark-100 leading-relaxed font-medium">{faq.answer}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="glass-card p-5 border-dark-800 shadow-sm bg-white">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-dark-50">
          <MessageSquare size={16} className="text-blue-600" />
          Submit a Ticket
        </h3>

        <form onSubmit={handleSubmitTicket} className="space-y-3">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            required
            className="w-full bg-slate-50 border border-dark-800 rounded-xl px-4 py-3 text-sm font-medium text-dark-100 outline-none focus:border-gold-500/50 shadow-sm"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue..."
            rows={4}
            required
            className="w-full bg-slate-50 border border-dark-800 rounded-xl px-4 py-3 text-sm font-medium text-dark-100 outline-none focus:border-gold-500/50 resize-none shadow-sm"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full bg-gold-gradient text-dark-50 font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit Ticket
          </button>
        </form>
      </div>
    </div>
  );
}