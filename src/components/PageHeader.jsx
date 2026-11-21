export default function PageHeader({ title, description, accent = "" }) {
  return (
    <section className={`page-header ${accent}`.trim()}>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </section>
  );
}
