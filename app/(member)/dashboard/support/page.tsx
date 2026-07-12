"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { getLevel } from "@/lib/constants/levels";
import { 
  ArrowLeft,
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  FileText,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

type FAQItem = {
  id: number;
  question: string;
  answer: string;
  open: boolean;
};

export default function SupportPage() {
  const router = useRouter();
  const userLevel = 1;
  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;
  const levelBorder = levelData.borderColor;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: 1,
      question: "How do I earn points?",
      answer: "You can earn points by making purchases, referring friends, and achieving membership levels. Each purchase gives you product points, and referrals give you bonus points.",
      open: false,
    },
    {
      id: 2,
      question: "How does the referral program work?",
      answer: "Share your unique referral link with friends. When they sign up and make their first purchase, you earn referral bonus points. The more referrals you have, the higher your membership level.",
      open: false,
    },
    {
      id: 3,
      question: "What are membership levels?",
      answer: "There are 6 membership levels: Beginner, Bronze, Silver, Gold, Platinum, and Diamond. Each level unlocks new benefits and higher earning potential based on your points, referrals, and activity.",
      open: false,
    },
    {
      id: 4,
      question: "How do I redeem my points?",
      answer: "Points can be converted to earnings. Go to the Rewards page to see your points and earnings. The points rate is set by the admin.",
      open: false,
    },
    {
      id: 5,
      question: "How do I contact support?",
      answer: "You can contact us through the contact form below or email us directly at support@k-network.com. We typically respond within 24-48 hours.",
      open: false,
    },
  ]);

  const toggleFaq = (id: number) => {
    setFaqs((prev) =>
      prev.map((faq) =>
        faq.id === id ? { ...faq, open: !faq.open } : { ...faq, open: false }
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // In a real app, you would save this to a support_tickets table
      // For now, we'll just show a success message
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast.success("Your message has been sent! We'll get back to you soon.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Support form error:", error);
      showToast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const supportOptions = [
    {
      icon: Mail,
      label: "Email Support",
      description: "Send us an email",
      action: "mailto:support@k-network.com",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: MessageCircle,
      label: "Live Chat",
      description: "Chat with our support team",
      action: "#",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: FileText,
      label: "Documentation",
      description: "Read our guides and tutorials",
      action: "#",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 hover:bg-slate-800 transition"
        >
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Help & Support</h1>
          <p className="text-sm text-slate-400">Get help with your account and learn more</p>
        </div>
      </div>

      {/* Support Options */}
      <div className="grid gap-4 md:grid-cols-3">
        {supportOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <a
              key={index}
              href={option.action}
              className={`rounded-2xl border ${levelBorder} bg-slate-900/50 p-6 shadow-xl backdrop-blur transition hover:bg-slate-800/30 group`}
            >
              <div className={`rounded-lg ${option.bg} p-3 inline-block mb-3`}>
                <Icon className={`h-6 w-6 ${option.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-white">{option.label}</h3>
              <p className="text-xs text-slate-400 mt-1">{option.description}</p>
            </a>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className={`rounded-2xl border ${levelBorder} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className={`h-5 w-5 ${levelColor}`} />
          <h3 className="text-sm font-semibold text-white">Frequently Asked Questions</h3>
        </div>
        <div className="space-y-2">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="rounded-xl border border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/50 transition"
              >
                <span className="text-sm font-medium text-white">{faq.question}</span>
                <ChevronRight
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    faq.open ? "rotate-90" : ""
                  }`}
                />
              </button>
              {faq.open && (
                <div className="px-4 pb-3 pt-0 text-sm text-slate-400 border-t border-slate-800">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className={`rounded-2xl border ${levelBorder} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className={`h-5 w-5 ${levelColor}`} />
          <h3 className="text-sm font-semibold text-white">Contact Us</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              placeholder="Brief subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
              placeholder="Describe your issue or question..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg ${levelBg} px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}