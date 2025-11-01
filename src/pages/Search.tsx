import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type MovieGenre, type MovieItem } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import Spinner from '@/components/Spinner';
import FiltersModal from '@/components/FiltersModal';
import { SearchIcon, FilterIcon, CloseIcon, ChevronUpIcon, ChevronDownIcon } from '@/components/Icons';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [genres, setGenres] = useState<MovieGenre[]>([]);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [genreId, setGenreId] = useState(searchParams.get('genreId') || '');
  const [yearFrom, setYearFrom] = useState(searchParams.get('yearFrom') || '');
  const [yearTo, setYearTo] = useState(searchParams.get('yearTo') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'popularity.desc');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [minimizeSearch, setMinimizeSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<MovieItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const enableInfiniteScroll = false;

  const currentYear = new Date().getFullYear();

  // Load genres on mount
  useEffect(() => {
    let alive = true;
    api.getGenres().then(r => { if (alive) setGenres(r.genres || []); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    const urlGenreId = searchParams.get('genreId') || '';
    const urlYearFrom = searchParams.get('yearFrom') || '';
    const urlYearTo = searchParams.get('yearTo') || '';
    const urlSortBy = searchParams.get('sortBy') || 'popularity.desc';
    
    setQuery(urlQuery);
    setGenreId(urlGenreId);
    setYearFrom(urlYearFrom);
    setYearTo(urlYearTo);
    setSortBy(urlSortBy);
  }, [searchParams]);

  // Reset when filters change
  useEffect(() => {
    setPage(1);
    setAllMovies([]);
    setHasMore(true);
  }, [query, genreId, yearFrom, yearTo, sortBy]);

  // Fetch movies with debounce for search
  useEffect(() => {
    let alive = true;
    const timeoutId = setTimeout(() => {
      setLoading(true);
      setError(null);
      api.getMovies({ 
        q: query.trim() || undefined, 
        genreId: genreId || undefined, 
        page
      })
        .then(res => {
          if (alive) {
            let newMovies = res.results || [];
            
            // Apply client-side filters for year range
            if (yearFrom || yearTo) {
              newMovies = newMovies.filter(movie => {
                if (!movie.year) return false;
                const movieYear = typeof movie.year === 'string' ? parseInt(movie.year) : movie.year;
                if (yearFrom && movieYear < parseInt(yearFrom)) return false;
                if (yearTo && movieYear > parseInt(yearTo)) return false;
                return true;
              });
            }

            // Apply client-side sorting
            if (sortBy && sortBy !== 'popularity.desc') {
              newMovies = [...newMovies].sort((a, b) => {
                switch (sortBy) {
                  case 'popularity.asc':
                    return (a.voteAverage || 0) - (b.voteAverage || 0);
                  case 'vote_average.desc':
                    return (b.voteAverage || 0) - (a.voteAverage || 0);
                  case 'vote_average.asc':
                    return (a.voteAverage || 0) - (b.voteAverage || 0);
                  case 'release_date.desc':
                    return String(b.year || '0').localeCompare(String(a.year || '0'));
                  case 'release_date.asc':
                    return String(a.year || '0').localeCompare(String(b.year || '0'));
                  case 'title.asc':
                    return a.title.localeCompare(b.title);
                  case 'title.desc':
                    return b.title.localeCompare(a.title);
                  default:
                    return 0;
                }
              });
            }
            
            setAllMovies(prev => page === 1 ? newMovies : [...prev, ...newMovies]);
            setHasMore(res.page < res.total_pages);
          }
        })
        .catch((e: any) => { if (alive) setError(e?.message || 'No se pudo cargar el catálogo'); })
        .finally(() => { if (alive) setLoading(false); });
    }, query && page === 1 ? 500 : 0);
    
    return () => { alive = false; clearTimeout(timeoutId); };
  }, [query, genreId, yearFrom, yearTo, sortBy, page]);

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll) return;
    if (!loadMoreRef.current || loading || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.5, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, enableInfiniteScroll]);

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSearchParams({ q: query });
  }

  function onChangeGenre(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setGenreId(value);
    updateSearchParams({ genreId: value });
  }

  function updateSearchParams(updates: Record<string, string>) {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  }

  function clearAllFilters() {
    setQuery('');
    setGenreId('');
    setYearFrom('');
    setYearTo('');
    setSortBy('popularity.desc');
    setSearchParams({});
  }

  const movieList: MovieItem[] = useMemo(() => allMovies, [allMovies]);
  const hasActiveFilters = query || genreId || yearFrom || yearTo || sortBy !== 'popularity.desc';
  const activeFiltersCount = [query, genreId, yearFrom, yearTo, sortBy !== 'popularity.desc'].filter(Boolean).length;

  return (
    <div className="search-page">
      {/* Search hero section - collapsible */}
      <section className={`search-hero ${minimizeSearch ? 'minimized' : ''}`}>
        <div className="container">
          {!minimizeSearch && <h1 className="search-title">Buscar</h1>}
          
          <div className="search-bar-wrapper">
            <form onSubmit={onSearchSubmit} className="search-form" role="search" aria-label="Buscar películas">
              <div className="search-input-container">
                <SearchIcon size={20} className="search-icon-svg" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar películas..."
                  aria-label="Buscar por nombre"
                  className="search-input-large"
                />
                {query && (
                  <button 
                    type="button" 
                    className="clear-search-btn" 
                    onClick={() => { setQuery(''); updateSearchParams({ q: '' }); }} 
                    aria-label="Limpiar búsqueda"
                  >
                    <CloseIcon size={20} />
                  </button>
                )}
              </div>
            </form>

            <div className="search-actions">
              <button 
                className={`filters-btn ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
                onClick={() => setShowFiltersModal(true)}
                aria-label="Abrir filtros"
              >
                <FilterIcon size={20} />
              </button>

              <button
                className="minimize-btn"
                onClick={() => setMinimizeSearch(!minimizeSearch)}
                aria-label={minimizeSearch ? "Expandir búsqueda" : "Minimizar búsqueda"}
              >
                {minimizeSearch ? <ChevronDownIcon size={20} /> : <ChevronUpIcon size={20} />}
              </button>
            </div>
          </div>

          {hasActiveFilters && !minimizeSearch && (
            <div className="active-filters-tags">
              {query && (
                <span className="filter-badge">
                  Búsqueda: "{query}"
                  <button onClick={() => { setQuery(''); updateSearchParams({ q: '' }); }} aria-label="Quitar filtro de búsqueda">
                    <CloseIcon size={14} />
                  </button>
                </span>
              )}
              {genreId && (
                <span className="filter-badge">
                  Género: {genres.find(g => String(g.id) === genreId)?.name}
                  <button onClick={() => { setGenreId(''); updateSearchParams({ genreId: '' }); }} aria-label="Quitar filtro de género">
                    <CloseIcon size={14} />
                  </button>
                </span>
              )}
              {yearFrom && (
                <span className="filter-badge">
                  Desde: {yearFrom}
                  <button onClick={() => { setYearFrom(''); updateSearchParams({ yearFrom: '' }); }} aria-label="Quitar filtro año desde">
                    <CloseIcon size={14} />
                  </button>
                </span>
              )}
              {yearTo && (
                <span className="filter-badge">
                  Hasta: {yearTo}
                  <button onClick={() => { setYearTo(''); updateSearchParams({ yearTo: '' }); }} aria-label="Quitar filtro año hasta">
                    <CloseIcon size={14} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results section */}
      <section className="search-results">
        <div className="container">
          {!loading && movieList.length > 0 && (
            <div className="results-header">
              <p className="results-count">{movieList.length} película{movieList.length !== 1 ? 's' : ''} encontrada{movieList.length !== 1 ? 's' : ''}</p>
            </div>
          )}

          {error && (
            <div className="card" role="alert" style={{padding:24, textAlign:'center', marginBottom:24}}>{error}</div>
          )}

          {movieList.length === 0 && !loading && !error && (
            <div className="empty-state">
              <div className="empty-icon">
                <SearchIcon size={64} />
              </div>
              <h2>No se encontraron resultados</h2>
              <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
            </div>
          )}

          {movieList.length > 0 && (
            <>
              <div className="catalog-grid">
                {movieList.map(m => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>

              {/* Load more button (no infinite scroll) */}
              <div style={{padding:'32px 0 12px', textAlign:'center'}}>
                {hasMore && !loading && (
                  <button onClick={() => setPage(p => p + 1)} className="btn-secondary" aria-label="Cargar más resultados">
                    Ver más
                  </button>
                )}
                {loading && (
                  <div style={{marginTop:12}}>
                    <Spinner /> <span style={{marginLeft:12}}>Cargando más películas...</span>
                  </div>
                )}
                {!hasMore && !loading && movieList.length > 0 && (
                  <p style={{color:'var(--text-secondary)', fontSize:14, marginTop:12}}>
                    ✓ Has llegado al final ({movieList.length} películas)
                  </p>
                )}
              </div>
            </>
          )}

          {loading && movieList.length === 0 && (
            <div style={{padding:80, textAlign:'center'}}>
              <Spinner size={40} /> 
              <p style={{marginTop:16, color:'var(--text-secondary)'}}>Buscando películas...</p>
            </div>
          )}
        </div>
      </section>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button 
          className="scroll-to-top" 
          onClick={scrollToTop}
          aria-label="Volver arriba"
        >
          <ChevronUpIcon size={24} />
        </button>
      )}

      {/* Filters Modal */}
      <FiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        genres={genres}
        genreId={genreId}
        yearFrom={yearFrom}
        yearTo={yearTo}
        sortBy={sortBy}
        onGenreChange={(value) => { setGenreId(value); updateSearchParams({ genreId: value }); }}
        onYearFromChange={(value) => { setYearFrom(value); updateSearchParams({ yearFrom: value }); }}
        onYearToChange={(value) => { setYearTo(value); updateSearchParams({ yearTo: value }); }}
        onSortByChange={(value) => { setSortBy(value); updateSearchParams({ sortBy: value }); }}
        onClearAll={clearAllFilters}
        currentYear={currentYear}
      />
    </div>
  );
}

