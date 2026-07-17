import Link from "next/link";
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Heart,
  Shield,
  Users,
  Gift,
  Share2,
  MessageCircle,
  Camera,
  Play
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "About Us", href: "/about" },
      { label: "Products", href: "/products" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
    support: [
      { label: "Help Center", href: "/help" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund" },
    ],
    resources: [
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Affiliate Program", href: "/affiliate" },
    ],
  };

  return (
    <footer className="relative border-t border-slate-800 bg-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-400">
                K-NETWORK
              </h2>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Wellness Today. Wealth Tomorrow. Join thousands of members building their wellness and wealth.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 transition hover:bg-emerald-500/10 hover:text-emerald-400 hover:border hover:border-emerald-500/20"
                aria-label="Facebook"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 transition hover:bg-emerald-500/10 hover:text-emerald-400 hover:border hover:border-emerald-500/20"
                aria-label="Twitter"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 transition hover:bg-emerald-500/10 hover:text-emerald-400 hover:border hover:border-emerald-500/20"
                aria-label="Instagram"
              >
                <Camera className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 transition hover:bg-emerald-500/10 hover:text-emerald-400 hover:border hover:border-emerald-500/20"
                aria-label="YouTube"
              >
                <Play className="h-4 w-4" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4 text-emerald-400/60" />
                <span>support@k-network.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="h-4 w-4 text-emerald-400/60" />
                <span>+234 813 942 9770</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 text-emerald-400/60" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-emerald-400 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-emerald-400 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-emerald-400 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <p className="text-sm text-slate-500 order-2 sm:order-1">
            © {currentYear} K-NETWORK. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 order-1 sm:order-2">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-emerald-400/60" />
              Made with care
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-emerald-400/60" />
              Secure & Trusted
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-emerald-400/60" />
              2,500+ Members
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Gift className="h-3 w-3 text-emerald-400/60" />
              100K+ Points Earned
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}