// components/about/AboutTeam.tsx - Alternative version
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail } from "lucide-react";

const team = [
  {
    name: "Isiaq Mudathir",
    role: "Founder & CEO",
    bio: "Passionate about wellness and building communities that create wealth.",
    email: "isiaq@k-network.com",
    linkedin: "https://linkedin.com/in/isiaqmudathir",
    twitter: "https://twitter.com/isiaqmudathir",
  },
];

export default function AboutTeam() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 lg:py-28 border-t border-slate-800">
      <div className="relative">
        <div className="text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-2 text-sm font-medium">
            Our Team
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Meet the Team
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto">
            The passionate people behind K-NETWORK driving wellness and wealth creation.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <Card
              key={member.name}
              className="group border-slate-800 bg-slate-900/50 p-6 text-center transition-all duration-300 hover:border-emerald-500/20 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <User className="h-10 w-10" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">
                {member.name}
              </h3>
              <p className="text-sm text-emerald-400">{member.role}</p>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                {member.bio}
              </p>
              
              {/* Social Links - Text-based */}
              <div className="mt-4 flex justify-center gap-3">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="text-slate-400 hover:text-emerald-400 transition text-sm font-medium"
                    aria-label="Email"
                  >
                    ✉
                  </a>
                )}
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-400 transition text-sm font-bold"
                    aria-label="LinkedIn"
                  >
                    in
                  </a>
                )}
                {member.twitter && (
                  <a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-400 transition text-sm font-bold"
                    aria-label="Twitter"
                  >
                    t
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}