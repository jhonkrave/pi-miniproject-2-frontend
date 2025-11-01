import { CloseIcon, FilterIcon } from './Icons';
import { type MovieGenre } from '@/lib/api';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  genres: MovieGenre[];
  genreId: string;
  yearFrom: string;
  yearTo: string;
  sortBy: string;
  onGenreChange: (value: string) => void;
  onYearFromChange: (value: string) => void;
  onYearToChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onClearAll: () => void;
  currentYear: number;
};

export default function FiltersModal({
  isOpen,
  onClose,
  genres,
  genreId,
  yearFrom,
  yearTo,
  sortBy,
  onGenreChange,
  onYearFromChange,
  onYearToChange,
  onSortByChange,
  onClearAll,
  currentYear,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="filters-modal-title">
      <div 
        id="filters-modal"
        className="modal-content filters-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <FilterIcon size={24} />
            <h2 id="filters-modal-title">Filtros de búsqueda</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar filtros">
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="modal-genre">Género</label>
              <select
                id="modal-genre"
                value={genreId}
                onChange={(e) => onGenreChange(e.target.value)}
                className="filter-input"
              >
                <option value="">Todos los géneros</option>
                {genres.map((g) => (
                  <option key={g.id} value={String(g.id)}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="modal-year-from">Año desde</label>
              <input
                id="modal-year-from"
                type="number"
                value={yearFrom}
                onChange={(e) => onYearFromChange(e.target.value)}
                placeholder="1900"
                min="1900"
                max={currentYear}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="modal-year-to">Año hasta</label>
              <input
                id="modal-year-to"
                type="number"
                value={yearTo}
                onChange={(e) => onYearToChange(e.target.value)}
                placeholder={String(currentYear)}
                min="1900"
                max={currentYear}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="modal-sort">Ordenar por</label>
              <select
                id="modal-sort"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="filter-input"
              >
                <option value="popularity.desc">Más popular</option>
                <option value="popularity.asc">Menos popular</option>
                <option value="vote_average.desc">Mejor calificación</option>
                <option value="vote_average.asc">Peor calificación</option>
                <option value="release_date.desc">Más reciente</option>
                <option value="release_date.asc">Más antigua</option>
                <option value="title.asc">Título (A-Z)</option>
                <option value="title.desc">Título (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClearAll} className="btn-secondary">
            Limpiar filtros
          </button>
          <button onClick={onClose} className="btn-primary">
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}

