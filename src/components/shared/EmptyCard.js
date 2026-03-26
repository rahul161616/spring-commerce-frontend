function EmptyCard({ label }) {
  return (
    <article className="product-card loading-card">
      <div className="product-placeholder"><span>{label}</span></div>
    </article>
  );
}

export default EmptyCard;
