'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, MapPin, Phone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all";

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@kitchino.com' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 000-0000' },
    { icon: MapPin, label: 'Address', value: 'Brussels, Belgium' },
    { icon: Clock, label: 'Hours', value: 'Mon-Fri 9AM-6PM CET' },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative py-16 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-card to-dark" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gold/[0.02] blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-sm uppercase tracking-[0.2em] font-medium">Get in Touch</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mt-3">Contact Us</h1>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6" />
            <p className="text-gray-500 mt-4 max-w-lg mx-auto">Have a question? We&apos;d love to hear from you.</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {contactInfo.map((info, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-start gap-4 p-4 bg-dark-card border border-dark-border rounded-xl hover:border-gold/10 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">{info.label}</p>
                  <p className="text-gray-200 text-sm mt-0.5">{info.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 text-sm text-center"
              >
                Thank you! We&apos;ll get back to you soon.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="glass p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-5 h-5 text-gold" />
                <h2 className="text-lg font-serif font-bold text-white">Send a Message</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Your name" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="your@email.com" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} required placeholder="How can we help?" className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea name="message" value={formData.message} onChange={handleInputChange} required rows={5} placeholder="Tell us more..." className={`${inputClass} resize-none`} />
              </div>

              <Button type="submit" variant="gold" size="lg" disabled={isSubmitting} className="w-full">
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
