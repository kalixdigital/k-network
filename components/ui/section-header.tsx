interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  center?: boolean;
}

import { Badge } from "@/components/ui/badge";

export default function SectionHeader({
  badge,
  title,
  description,
  center = true,
}: SectionHeaderProps) {
  return (
    <div className={center ? "text-center" : ""}>
      {badge && (
        <Badge className="bg-emerald-500 text-white">
          {badge}
        </Badge>
      )}

      <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-5 max-w-3xl mx-auto text-slate-400 leading-8 text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
