function Toast({ type, message }) {
  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <div className="toast-accent" />
      <div>
        <strong>{type === 'success' ? 'Success' : 'Request issue'}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default Toast;
