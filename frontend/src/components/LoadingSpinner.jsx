const SkeletonLine = ({ width = 'w-full', height = 'h-4' }) => (
    <div className={`skeleton ${width} ${height} rounded-sm`} />
  )
  
  const SkeletonCard = ({ featured = false }) => (
    <div className={`headline-card animate-fadeInUp ${featured ? 'headline-card-featured' : ''}`}>
      {/* Category badge skeleton */}
      <SkeletonLine width="w-16" height="h-3" />
      <div className="mt-3 space-y-2">
        {/* Headline skeleton — 2 lines */}
        <SkeletonLine width="w-full" height="h-5" />
        <SkeletonLine width="w-4/5" height="h-5" />
      </div>
      <div className="mt-4 space-y-2">
        {/* Blurb skeleton — 3 lines */}
        <SkeletonLine width="w-full" height="h-3" />
        <SkeletonLine width="w-full" height="h-3" />
        <SkeletonLine width="w-3/5" height="h-3" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        {/* Outlet skeleton */}
        <SkeletonLine width="w-24" height="h-3" />
        <SkeletonLine width="w-16" height="h-3" />
      </div>
    </div>
  )
  
  const LoadingSpinner = () => {
    return (
      <div className="animate-fadeIn">
  
        {/* Status bar */}
        <div className="flex items-center justify-center gap-3 my-8">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="inline-block w-1.5 h-1.5 bg-ink rounded-full"
                style={{
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                }}
              />
            ))}
          </div>
          <p className="byline text-ink-muted tracking-widest">
            Scanning alternate timelines
          </p>
        </div>
  
        {/* Skeleton grid — mirrors the real layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Featured card takes full width on top */}
          <div className="md:col-span-2 lg:col-span-3">
            <SkeletonCard featured />
          </div>
          {/* Regular cards */}
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
  
        {/* Flavor text */}
        <p className="text-center byline text-ink-muted mt-8 tracking-widest">
          ✦ consulting the multiverse archives ✦
        </p>
  
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0);    opacity: 0.4; }
            50%       { transform: translateY(-6px); opacity: 1;   }
          }
        `}</style>
      </div>
    )
  }
  
  export default LoadingSpinner
