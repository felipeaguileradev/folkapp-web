import { Badge } from "@/shared/components/ui/badge";

interface ColorNorteBadgeProps {
  color: string;
}

export function ColorNorteBadge({ color }: ColorNorteBadgeProps) {
  return (
    <Badge variant="outline" className="gap-1.5 text-xs">
      <span
        className="h-3 w-3 rounded-full border"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      Color Norte: {color}
    </Badge>
  );
}
