export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans animate-pulse">
      {/* Skeleton Header placeholder if needed, but usually layout handles it */}
      <div className="bg-muted/30 py-4">
        <div className="container mx-auto px-4">
          <div className="h-4 w-48 bg-muted rounded-md mb-2"></div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column: Product Media Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-muted rounded-2xl"></div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-24 h-24 bg-muted rounded-lg shrink-0"></div>
              ))}
            </div>
          </div>

          {/* Right Column: Product Info Skeleton */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="h-4 w-32 bg-muted rounded mb-4"></div>
              <div className="h-10 w-3/4 bg-muted rounded mb-6"></div>
              <div className="h-8 w-40 bg-muted rounded mb-8"></div>
              <div className="space-y-4 mb-8">
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-2/3 bg-muted rounded"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-32 bg-muted rounded-xl"></div>
                <div className="h-12 flex-1 bg-muted rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
