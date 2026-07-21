type CatalogSearchResult = {
  provider: string
  providerTitleId: string
  type: 'movie' | 'series'
  name: string
  releaseYear: number | null
  summary: string | null
}

type Props = {
  query: string
  results: CatalogSearchResult[]
  limitation: string | null
}

export default function CatalogSearch({ query, results, limitation }: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Catalog</p>
        <h1 className="text-3xl font-bold text-slate-950">Search titles</h1>
        <p className="text-slate-600">Find movies and series to add to your library.</p>
      </header>

      <form action="/app/catalog/search" method="get" className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="catalog-query" className="sr-only">
          Search the catalog
        </label>
        <input
          id="catalog-query"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search movies and series"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white"
        >
          Search
        </button>
      </form>

      {limitation && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          {limitation}
        </div>
      )}

      <section className="space-y-4" aria-label="Catalog search results">
        {results.map((result) => (
          <article
            key={`${result.provider}:${result.providerTitleId}`}
            className="rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-950">{result.name}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium uppercase text-slate-600">
                {result.type}
              </span>
              {result.releaseYear && (
                <span className="text-sm text-slate-500">{result.releaseYear}</span>
              )}
            </div>
            {result.summary && <p className="mt-2 text-slate-700">{result.summary}</p>}
          </article>
        ))}

        {query && !limitation && results.length === 0 && (
          <p className="text-slate-600">No movie or series titles found.</p>
        )}
      </section>
    </div>
  )
}
