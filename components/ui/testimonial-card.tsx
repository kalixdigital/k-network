interface TestimonialCardProps {
  name: string;
  role: string;
  message: string;
}

export default function TestimonialCard({
  name,
  role,
  message,
}: TestimonialCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500">
      <p className="text-slate-300 leading-relaxed">
        "{message}"
      </p>

      <div className="mt-6">
        <h4 className="font-bold text-white">{name}</h4>
        <p className="text-sm text-slate-400">{role}</p>
      </div>
    </div>
  );
}
