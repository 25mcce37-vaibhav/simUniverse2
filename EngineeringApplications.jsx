/**
 * Reusable React/Next.js-ready Engineering Applications component.
 *
 * SimuVerse currently runs as a static browser app, so index.html uses the
 * vanilla renderer in engineeringApplications.js. This component mirrors that
 * contract for a future React route without altering the deployed stack.
 */
export default function EngineeringApplications({ topicName, topicIcon = '🏗️', applications = [], accent = '#00d4ff', onBack }) {
  return (
    <section className="engineering-page" style={{ '--engineering-accent': accent }}>
      <div className="engineering-hero">
        <div className="engineering-kicker">{topicIcon} ENGINEERING CONNECTIONS</div>
        <h1>{topicName} Engineering Applications</h1>
        <p>
          See how this physics topic moves from equations and simulations into devices,
          infrastructure, instrumentation, and design decisions used by working engineers.
        </p>
        {onBack && (
          <div className="engineering-actions">
            <button className="btn-back engineering-back" onClick={onBack}>← Back to Lesson</button>
          </div>
        )}
      </div>

      <div className="engineering-grid">
        {applications.map((item) => (
          <article className="engineering-card" key={item.title}>
            <div className="engineering-image-wrap">
              <img src={item.image} alt={item.imageAlt} loading="lazy" />
              <span className="engineering-field">{item.field}</span>
            </div>
            <div className="engineering-card-body">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <ul>
                {item.highlights.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
