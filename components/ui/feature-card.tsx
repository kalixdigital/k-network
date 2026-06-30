import { ReactNode } from "react";

interface FeatureCardProps {
	  icon: ReactNode;
	    title: string;
	      description: string;
}

export default function FeatureCard({
	  icon,
	    title,
	      description,
}: FeatureCardProps) {
	  return (
		      <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10">
		            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-400">
			            {icon}
				          </div>

					        <h3 className="text-2xl font-bold text-white">
						        {title}
							      </h3>

							            <p className="mt-4 leading-relaxed text-slate-400">
								            {description}
									          </p>
										      </div>
										        );
}
