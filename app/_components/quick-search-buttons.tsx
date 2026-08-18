import {
  Eye,
  Scissors,
  Sparkles,
  User,
  MirrorRound,
  Hand,
  Brush,
  SprayCan,
} from "lucide-react";
import Link from "next/link";
import { PageSectionScroller } from "./ui/page";

const QuickSearchButtons = () => {
  return (
    <PageSectionScroller>
      <Link
        href="/barbershops?search=acabamento"
        className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
      >
        <Brush className="size-4" />
        <span className="text-card-foreground text-sm font-medium">
          Acabamento
        </span>
      </Link>

      <Link
        href="/barbershops?search=barba"
        className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
      >
        <User className="size-4" />
        <span className="text-card-foreground text-sm font-medium">Barba</span>
      </Link>

      <Link
        href="/barbershops?search=cabelo"
        className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
      >
        <Scissors className="size-4" />
        <span className="text-card-foreground text-sm font-medium">Cabelo</span>
      </Link>

      <Link
        href="/barbershops?search=depilação"
        className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
      >
        <Sparkles className="size-4" />
        <span className="text-card-foreground text-sm font-medium">
          Depilação
        </span>
      </Link>

      <Link
        href="/barbershops?search=manicure"
        className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
      >
        <Hand className="size-4" />
        <span className="text-card-foreground text-sm font-medium">
          Manicure
        </span>
      </Link>

      <Link
        href="/barbershops?search=maquiagem"
        className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
      >
        <MirrorRound className="size-4" />
        <span className="text-card-foreground text-sm font-medium">
          Maquiagem
        </span>
      </Link>

      <Link
        href="/barbershops?search=sobrancelha"
        className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
      >
        <Eye className="size-4" />
        <span className="text-card-foreground text-sm font-medium">
          Sobrancelha
        </span>
      </Link>

      <Link
        href="/barbershops?search=progressiva"
        className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
      >
        <SprayCan className="size-4" />
        <span className="text-card-foreground text-sm font-medium">
          Progressiva
        </span>
      </Link>
    </PageSectionScroller>
  );
};

export default QuickSearchButtons;
