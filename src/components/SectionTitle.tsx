interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export const SectionTitle = ({ eyebrow, title, description }: SectionTitleProps) => (
  <div className="space-y-1">
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400 dark:text-[#8e8778]">{eyebrow}</p>
    <h2 className="text-base font-semibold text-ink-900 dark:text-[#f4f0e7]">{title}</h2>
    {description ? <p className="text-sm text-ink-500 dark:text-[#b9b1a3]">{description}</p> : null}
  </div>
);
