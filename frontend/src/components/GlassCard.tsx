interface Props {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "section";
}

/** Frosted-glass surface: translucent, blurred, softly bordered. */
export function GlassCard({ className = "", children, as = "div" }: Props) {
  const Comp = as;
  return (
    <Comp
      className={`bg-white/55 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 shadow-glass rounded-3xl ${className}`}
    >
      {children}
    </Comp>
  );
}
