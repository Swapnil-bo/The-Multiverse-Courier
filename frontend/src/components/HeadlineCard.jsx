import { useState } from 'react'

const CATEGORY_STYLES = {
  POLITICS: { badge: 'badge-POLITICS', icon: '🏛️', label: 'Politics' },
  TECH:     { badge: 'badge-TECH',     icon: '💻', label: 'Technology' },
  SCIENCE:  { badge: 'badge-SCIENCE',  icon: '🔬', label: 'Science' },
  WORLD:    { badge: 'badge-WORLD',    icon: '🌍', label: 'World' },
  ECONOMY:  { badge: 'badge-ECONOMY',  icon: '📈', label: 'Economy' },
  CULTURE:  { badge: 'badge-CULTURE',  icon: '🎭', label: 'Culture' },
}

const DEFAULT_STYLE = { badge: 'badge-WORLD', icon: '📰', label: 'News' }

// FIX 3 — normalize combined categories like "SCIENCE | WORLD" → "SCIENCE"
const VALID_CATEGORIES = new Set(['POLITICS', 'TECH', 'SCIENCE', 'WORLD', 'ECONOMY', 'CULTURE'])

const normalizeCategory = (cat) => {
  if (!cat) return 'WORLD'
  const upper = cat.toUpperCase().trim()
  if (VALID_CATEGORIES.has(upper)) return upper
  for (const valid of VALID_CATEGORIES) {
    if (upper.includes(valid)) return valid
  }
  return 'WORLD'
}

const formatTime = () => {
  const mins = Math.floor(Math.random() * 59) + 1
  return `${mins}m ago`
}

const HeadlineCard = ({ headline, blurb, category, outlet, index = 0, featured = false }) => {
  const [expanded, setExpanded]     = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [copied, setCopied]         = useState(false)

  const normalizedCat = normalizeCategory(category)
  const style  = CATEGORY_STYLES[normalizedCat] || DEFAULT_STYLE
  const timeAgo = useState(() => formatTime())[0]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${headline}\n\n${blurb}\n\n— ${outlet}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    // FIX 1 — flex flex-col + h-full so all cards stretch to equal height
    <article
      className={`
        headline-card animate-fadeInUp flex flex-col h-full
        ${featured ? 'headline-card-featured' : ''}
      `}
      style={{ animationDelay: `${index * 0.07}s`, opacity: 0 }}
    >
      {/* ── Top row: badge + actions ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`category-badge ${style.badge}`}>
            {style.icon} {style.label}
          </span>
          {featured && (
            <span className="category-badge border-ink text-ink">
              ★ Lead Story
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setBookmarked(b => !b)}
            title={bookmarked ? 'Bookmarked' : 'Bookmark'}
            className="text-sm transition-transform hover:scale-125"
            aria-label="Bookmark article"
          >
            {bookmarked ? '🔖' : '📄'}
          </button>

          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="text-xs byline border border-gray-300 px-1.5 py-0.5 hover:bg-ink hover:text-newsprint transition-colors"
            aria-label="Copy headline"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* ── Headline ──────────────────────────────────────────────────── */}
      <h2
        className={`
          playfair font-black leading-tight mb-3 cursor-pointer
          hover:text-accent transition-colors duration-200
          ${featured ? 'headline-xl' : 'headline-lg'}
        `}
        onClick={() => setExpanded(e => !e)}
        title="Click to expand"
      >
        {headline}
      </h2>

      <hr className="section-rule-thin mb-3" />

      {/* ── Blurb — flex-1 pushes footer to bottom ────────────────────── */}
      <div className="flex-1">
        <p className={`blurb transition-all duration-300 ${expanded ? '' : 'line-clamp-3'}`}>
          {blurb}
        </p>

        {/* FIX 5 — READ MORE / SHOW LESS properly styled */}
        {blurb?.length > 180 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-2 text-xs font-semibold tracking-wide uppercase"
            style={{
              color: 'var(--accent)',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.08em',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {expanded ? '▲ Show less' : '▼ Read more'}
          </button>
        )}
      </div>

      {/* ── Footer — always pinned to bottom ──────────────────────────── */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {/* FIX 2 — Outlet avatar properly styled */}
          <div style={{
            width: '22px',
            height: '22px',
            minWidth: '22px',
            background: '#1a1a1a',
            color: '#f5f0e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '900',
            fontFamily: 'Inter, sans-serif',
            flexShrink: 0,
          }}>
            {outlet?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span
            style={{
              fontSize: '11px',
              color: '#6b6b6b',
              maxWidth: '130px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
            title={outlet}
          >
            {outlet}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="byline text-ink-muted text-xs">{timeAgo}</span>
          <span className="text-gray-300">·</span>
          <span className="byline text-xs" style={{ color: 'var(--accent)' }}>
            Alt. Timeline
          </span>
        </div>
      </div>
    </article>
  )
}

export default HeadlineCard