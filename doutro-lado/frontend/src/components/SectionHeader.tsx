export function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="stack-12" style={{ marginBottom: 24 }}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="h2">{title}</h2>
      {description ? <p className="body" style={{ maxWidth: 760 }}>{description}</p> : null}
    </div>
  );
}
