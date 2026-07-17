import { Card } from "@/components/ui/card";
import { Quote, Star, User } from "lucide-react";

type TestimonialCardProps = {
  name: string;
  role: string;
  message: string;
  rating?: number;
};

export default function TestimonialCard({
  name,
  role,
  message,
  rating = 5,
}: TestimonialCardProps) {
  return (
    <Card className="group relative border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/5 overflow-hidden h-full flex flex-col">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Quote Icon */}
      <Quote className="absolute top-4 right-4 h-8 w-8 text-emerald-400/10" />

      {/* Rating Stars */}
      <div className="flex items-center gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-600"
            }`}
          />
        ))}
      </div>

      {/* Message */}
      <p className="relative flex-1 text-sm sm:text-base text-slate-300 leading-relaxed">
        "{message}"
      </p>

      {/* Divider */}
      <div className="relative my-4 h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

      {/* Author */}
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-white text-sm sm:text-base">
            {name}
          </p>
          <p className="text-xs text-slate-400">
            {role}
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-opacity duration-500" />
    </Card>
  );
}