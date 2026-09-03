import Link from "next/link";

export default function NotFound() {
  return (
    <main className="product-page narrow-page">
      <div className="empty-state product-empty-state">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <Link className="primary-button" href="/">
          Browse all phones
        </Link>
      </div>
    </main>
  );
}
