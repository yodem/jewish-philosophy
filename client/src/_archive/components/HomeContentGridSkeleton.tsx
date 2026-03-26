export default function HomeContentGridSkeleton() {
  return (
    <section className="p-8 md:p-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-border bg-muted/30 animate-pulse"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-muted" />
              <div className="h-6 w-32 rounded bg-muted" />
            </div>
            <div className="space-y-4 mb-8">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
            </div>
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}
