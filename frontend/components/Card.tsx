export default function Card({
  title,
  subtitle,
  accentColor,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  accentColor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--surface)] border border-[var(--border)] p-5 ${className}`}
      style={accentColor ? { borderTop: `2px solid ${accentColor}` } : undefined}
    >
      {title && (
        <div className="font-mono text-[10px] tracking-[1px] text-[var(--muted)] uppercase mb-1">{title}</div>
      )}
      {subtitle && <div className="text-[10px] text-[var(--muted)] mb-4">{subtitle}</div>}
      {children}
    </div>
  );
}
