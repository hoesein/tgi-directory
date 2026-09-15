export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>Directory API</h1>
      <p>Backend is running. API endpoints:</p>
      <ul>
        <li><code>GET /api/health</code> — Health check</li>
        <li><code>POST /api/auth/register</code> — Register user</li>
        <li><code>POST /api/auth/login</code> — Login user</li>
        <li><code>GET /api/auth/me</code> — Get current user (protected)</li>
        <li><code>GET /api/listings</code> — Get all listings</li>
        <li><code>POST /api/listings</code> — Create listing (protected)</li>
        <li><code>GET /api/listings/:id</code> — Get single listing</li>
        <li><code>PUT /api/listings/:id</code> — Update listing (protected)</li>
        <li><code>DELETE /api/listings/:id</code> — Delete listing (protected)</li>
        <li><code>GET /api/categories</code> — Get all categories</li>
        <li><code>POST /api/categories</code> — Create category (admin only)</li>
      </ul>
    </div>
  );
}
