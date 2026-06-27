interface RankBadgeProps {
  rank: string;
}

export default function RankBadge({
  rank,
}: RankBadgeProps) {
  return (
    <span className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white">
      {rank}
    </span>
  );
}
