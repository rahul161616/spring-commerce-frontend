function MetricField({ label, value }) {
  return (
    <div className="metric-field">
      <span>{label}</span>
      <div>{value}</div>
    </div>
  );
}

export default MetricField;
