export default function SkipNav() {
  return (
    <a
    
      href="#main-content"
      style={{
        position: 'absolute',
        top: '-100px',
        left: '0',
        background: '#4361ee',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '0 0 8px 0',
        fontWeight: '600',
        fontSize: '14px',
        zIndex: 9999,
        textDecoration: 'none',
        transition: 'top 0.2s'
      }}
      onFocus={e => e.target.style.top = '0'}
      onBlur={e => e.target.style.top = '-100px'}
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  )
}