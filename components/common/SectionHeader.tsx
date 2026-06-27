import { Badge } from "@/components/ui/badge";

interface SectionHeaderProps {
  badge: string;
  title: string;
  description: string;
}

export default function SectionHeader({
  badge,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="text-center mb-16">
      <Badge className="bg-emerald-500 text-white">
        {badge}
      </Badge>

      <h2 className="mt-4 text-4xl font-bold text-white">
        {title}
      </h2>

      <p className="mt-4 max-w-3xl mx-auto text-slate-400">
        {description}
      </p>
    </div>
  );
}
