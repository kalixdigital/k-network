// components/contact/ContactInfo.tsx
import { Card } from "@/components/ui/card";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock
} from "lucide-react";

const contactDetails = [
  {
    icon: Mail,
    title: "Email",
    details: ["support@k-network.com", "kalixdigital@gmail.com"],
    color: "text-emerald-400",
  },
  {
    icon: Phone,
    title: "Phone",
    details: ["+234 813 942 9770", "+234 811 309 4811"],
    color: "text-blue-400",
  },
  {
    icon: MapPin,
    title: "Address",
    details: ["Lagos, Nigeria", "Available nationwide"],
    color: "text-yellow-400",
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Monday - Friday: 9AM - 6PM", "Saturday: 10AM - 2PM"],
    color: "text-purple-400",
  },
];

export default function ContactInfo() {
  return (
    <div className="space-y-4">
      {contactDetails.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.title}
            className="border-slate-800 bg-slate-900/80 backdrop-blur-xl p-4 transition-all duration-300 hover:border-emerald-500/20"
          >
            <div className="flex items-start gap-4">
              <div className={`rounded-lg ${item.color} bg-emerald-500/10 p-2.5`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                {item.details.map((detail, index) => (
                  <p key={index} className="text-sm text-slate-400">
                    {detail}
                  </p>
                ))}
              </div>
            </div>
          </Card>
        );
      })}

      {/* Social Links - Text-based */}
      <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Follow Us</h3>
        <div className="flex gap-3">
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 font-bold text-sm transition hover:bg-emerald-500/10 hover:text-emerald-400 hover:border hover:border-emerald-500/20"
            aria-label="Facebook"
          >
            f
          </a>
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 font-bold text-sm transition hover:bg-emerald-500/10 hover:text-emerald-400 hover:border hover:border-emerald-500/20"
            aria-label="Twitter"
          >
            t
          </a>
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 font-bold text-sm transition hover:bg-emerald-500/10 hover:text-emerald-400 hover:border hover:border-emerald-500/20"
            aria-label="Instagram"
          >
            ig
          </a>
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 font-bold text-sm transition hover:bg-emerald-500/10 hover:text-emerald-400 hover:border hover:border-emerald-500/20"
            aria-label="YouTube"
          >
            yt
          </a>
        </div>
      </Card>
    </div>
  );
}