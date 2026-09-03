export default function ProductLoading() {
  return (
    <main className="product-page" aria-label="Loading product">
      <header className="site-header product-header">
        <span className="wordmark">
          <span className="wordmark-mark">E</span>
          easi<span>EMI</span>
        </span>
      </header>
      <section className="product-layout">
        <div className="gallery-main-image skeleton-block" />
        <div className="product-purchase-panel skeleton-panel">
          <div className="skeleton-block skeleton-line short" />
          <div className="skeleton-block skeleton-title" />
          <div className="skeleton-block skeleton-price" />
          <div className="skeleton-block skeleton-option" />
          <div className="skeleton-block skeleton-plan" />
        </div>
      </section>
    </main>
  );
}
