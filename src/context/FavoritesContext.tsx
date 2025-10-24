import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, type MovieItem } from '@/lib/api';
import { useAuth } from './AuthContext';

type FavoritesContextType = {
  favorites: MovieItem[];
  favoriteIds: Set<number>;
  loading: boolean;
  error: string | null;
  isFavorite: (movieId: number) => boolean;
  add: (movie: MovieItem | number) => Promise<void>;
  remove: (movieId: number) => Promise<void>;
  toggle: (movie: MovieItem) => Promise<void>;
  refresh: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const favoriteIds = useMemo(() => new Set(favorites.map(f => f.id)), [favorites]);

  const refresh = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFavorites();
      setFavorites(res.movies || []);
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar tus favoritos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  function isFavorite(movieId: number) {
    return favoriteIds.has(Number(movieId));
  }

  async function add(movie: MovieItem | number) {
    if (!user) throw new Error('Debes iniciar sesión');
    const movieId = typeof movie === 'number' ? movie : movie.id;
    // Optimistic update
    const rollback = favorites;
    if (!favoriteIds.has(movieId) && typeof movie !== 'number') {
      setFavorites(prev => [...prev, movie]);
    }
    try {
      await api.addFavorite(movieId);
      // Ensure unique after server response
      setFavorites(prev => {
        const map = new Map<number, MovieItem>();
        prev.forEach(m => map.set(m.id, m));
        return Array.from(map.values());
      });
    } catch (e: any) {
      // If duplicate key error, just ensure it stays favorited; otherwise rollback
      const msg = e?.message || '';
      if (!/duplicate key/i.test(msg) && !/E11000/i.test(msg)) {
        setFavorites(rollback);
        throw e;
      }
    }
  }

  async function remove(movieId: number) {
    if (!user) throw new Error('Debes iniciar sesión');
    const rollback = favorites;
    setFavorites(prev => prev.filter(m => m.id !== movieId));
    try {
      await api.removeFavorite(movieId);
    } catch (e) {
      // rollback on failure
      setFavorites(rollback);
      throw e;
    }
  }

  async function toggle(movie: MovieItem) {
    if (isFavorite(movie.id)) {
      await remove(movie.id);
    } else {
      await add(movie);
    }
  }

  const value = useMemo(() => ({
    favorites,
    favoriteIds,
    loading,
    error,
    isFavorite,
    add,
    remove,
    toggle,
    refresh,
  }), [favorites, favoriteIds, loading, error]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}


