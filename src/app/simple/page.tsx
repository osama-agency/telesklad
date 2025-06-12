export default function SimplePage() {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Telesklad - Simple Page</h1>
      <p>This is a simple test page to verify the deployment works.</p>
      <p>If you can see this page, the Railway deployment is successful!</p>

      <div style={{ marginTop: '2rem' }}>
        <a
          href="/ru/products"
          style={{
            color: '#0070f3',
            textDecoration: 'none',
            margin: '0 1rem'
          }}
        >
          Go to Products (RU)
        </a>
        <a
          href="/ru/dashboard"
          style={{
            color: '#0070f3',
            textDecoration: 'none',
            margin: '0 1rem'
          }}
        >
          Go to Dashboard (RU)
        </a>
      </div>
    </div>
  )
}
