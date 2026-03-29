function EntityDetailsModal({ fields, onClose, subtitle, title }) {
  return (
    <div className="composer-backdrop" role="presentation" onClick={onClose}>
      <section
        className="composer-panel entity-details-panel"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">{subtitle}</p>
            <h3>{title}</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>Close</button>
        </div>

        <div className="detail-grid">
          {fields.map((field) => (
            <div key={field.label} className="detail-field">
              <span>{field.label}</span>
              <strong>{field.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default EntityDetailsModal;
