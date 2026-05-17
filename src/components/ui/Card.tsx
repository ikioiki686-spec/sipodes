import { cn } from "@/lib/cn";

type CardProps = React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
  glow?: boolean;
};

export function Card({
  as: Component = "div",
  children,
  className,
  glow = true,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "glass-panel rounded-lg border border-slate-200 bg-white/82 shadow-sm dark:border-white/10 dark:bg-slate-950/72",
        glow && "interactive-card",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
