import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeft } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-transform duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "h-12 bg-brand px-5 text-ink shadow-glow",
        signal: "h-12 bg-signal px-5 text-ink",
        ghost: "h-12 border border-line bg-transparent px-4 text-foreground",
        soft: "h-11 border border-line bg-elevated px-4 text-foreground",
        text: "h-11 px-2 text-muted",
      },
      full: { true: "w-full" },
    },
    defaultVariants: { variant: "primary" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ className, variant, full, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles({ variant, full }), className)} {...props} />;
}

export function TopBar({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <header className="pt-safe flex items-center gap-2 px-3 pb-3 pt-4">
      {onBack ? (
        <button type="button" onClick={onBack} className="flex h-11 items-center gap-1 rounded-full pr-3 pl-1" aria-label="Back">
          <ChevronLeft className="size-5" />
          <span className="text-sm">Back</span>
        </button>
      ) : (
        <span className="w-11" />
      )}
      <h1 className="min-w-0 flex-1 truncate text-center font-display text-4xl leading-none">{title}</h1>
      <div className="flex min-w-11 justify-end">{action}</div>
    </header>
  );
}

export function GlowRule({ className }: { className?: string }) {
  return <div className={cn("glow-rule", className)} />;
}
