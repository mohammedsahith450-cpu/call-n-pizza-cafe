import './SectionHeading.css';

export default function SectionHeading({ title, subtitle, centered = true }) {
  return (
    <div className={`section-heading ${centered ? 'section-heading--centered' : ''}`}>
      <h2 className="section-heading__title">{title}</h2>
      {subtitle && <p className="section-heading__subtitle">{subtitle}</p>}
      <div className="section-heading__line" />
    </div>
  );
}
