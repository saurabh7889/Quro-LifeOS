import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Star, Clock, CheckCircle2, X } from "lucide-react";
import * as api from "../api";
import { SmartContextMenu } from "./ui/SmartContextMenu";
import { useToast } from "./ui/Toast";
import { ConfirmDeleteDialog, LargeViewDialog } from "./ui/ItemActionDialogs";
import { useItemContextActions } from "./ui/useItemContextActions";

export function Entertainment() {
  const [movies, setMovies] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", year: "", genre: "", poster: "🎬", status: "watchlist" });
  const [pinnedIds, setPinnedIds] = useState<Record<string, boolean>>({});
  const [largeView, setLargeView] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const { showToast } = useToast();
  const buildActions = useItemContextActions();

  useEffect(() => {
    api.entertainment.getAll().then(setMovies);
  }, []);

  const createMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const movie = await api.entertainment.create({ ...form, year: parseInt(form.year) || null });
    setMovies([movie, ...movies]);
    setForm({ title: "", year: "", genre: "", poster: "🎬", status: "watchlist" });
    setShowForm(false);
  };

  const markAsWatched = async (id: number, rating: number) => {
    const updated = await api.entertainment.update(id, { status: "watched", rating });
    setMovies(movies.map((m) => (m.id === id ? updated : m)));
  };

  const togglePin = (key: string) => setPinnedIds((prev) => ({ ...prev, [key]: !prev[key] }));

  const duplicateMovie = async (movie: any) => {
    const copy = await api.entertainment.create({
      title: `${movie.title} (Copy)`,
      year: movie.year,
      genre: movie.genre,
      poster: movie.poster || "🎬",
      status: movie.status || "watchlist",
    });
    setMovies((prev) => [copy, ...prev]);
    showToast({ message: "Movie duplicated", type: "success" });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    const previous = movies;
    setMovies((prev) => prev.filter((m) => m.id !== target.id));
    try {
      await api.entertainment.delete(target.id);
      showToast({
        message: "Movie deleted",
        type: "warning",
        undoAction: () => setMovies(previous),
      });
    } catch {
      setMovies(previous);
      showToast({ message: "Could not delete movie", type: "error" });
    }
  };

  const watched = movies.filter((m) => m.status === "watched");
  const watchlist = movies.filter((m) => m.status === "watchlist");
  const avgRating = watched.length > 0 ? (watched.reduce((sum, m) => sum + (m.rating || 0), 0) / watched.length).toFixed(1) : "0";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="mb-1">Entertainment</h2><p className="text-sm text-muted-foreground">Track movies and shows you want to watch</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:glow transition-all flex items-center gap-2"><Plus className="w-4 h-4" />Add Movie</button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={createMovie} className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between"><h3>Add Movie</h3><button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button></div>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Movie title..." required className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none" />
          <div className="grid grid-cols-3 gap-4">
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Year" className="px-3 py-2 bg-input rounded-lg border border-border" />
            <input type="text" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="Genre" className="px-3 py-2 bg-input rounded-lg border border-border" />
            <input type="text" value={form.poster} onChange={(e) => setForm({ ...form, poster: e.target.value })} placeholder="Emoji" className="px-3 py-2 bg-input rounded-lg border border-border" />
          </div>
          <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:glow transition-all">Add to Watchlist</button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2"><CheckCircle2 className="w-5 h-5 text-green-500" /><p className="text-sm text-muted-foreground">Watched</p></div>
          <p className="text-3xl font-bold">{watched.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2"><Clock className="w-5 h-5 text-orange-500" /><p className="text-sm text-muted-foreground">Watchlist</p></div>
          <p className="text-3xl font-bold">{watchlist.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2"><Star className="w-5 h-5 text-yellow-500" /><p className="text-sm text-muted-foreground">Avg Rating</p></div>
          <p className="text-3xl font-bold">{avgRating}/10</p>
        </motion.div>
      </div>

      {watchlist.length > 0 && (
        <div>
          <h3 className="mb-4">Watchlist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((movie, index) => {
              const pinKey = `entertainment-movie-${movie.id}`;
              return (
                <SmartContextMenu
                  key={movie.id}
                  actions={buildActions({
                    section: "entertainment",
                    isPinned: !!pinnedIds[pinKey],
                    onOpenLargeView: () => setLargeView(movie),
                    onEdit: () => showToast({ message: "Movie editor coming soon", type: "default" }),
                    editLabel: "Edit Details",
                    aiEdit: true,
                    onDuplicate: () => duplicateMovie(movie),
                    onTogglePin: () => togglePin(pinKey),
                    onDelete: () => setDeleteTarget(movie),
                  })}
                >
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + index * 0.05 }} className="glass rounded-xl p-5 hover:glow-hover cursor-default">
                    <div className="flex justify-between items-start">
                      <div className="text-5xl mb-4">{movie.poster}</div>
                    </div>
                    <h4 className="mb-2">{movie.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{movie.year}</span>
                      <span className="px-2 py-1 rounded bg-primary/20 text-primary">{movie.genre}</span>
                    </div>
                    <button onClick={() => markAsWatched(movie.id, 8)} className="w-full px-3 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors text-sm">Mark as Watched</button>
                  </motion.div>
                </SmartContextMenu>
              );
            })}
          </div>
        </div>
      )}

      {watched.length > 0 && (
        <div>
          <h3 className="mb-4">Watched Movies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watched.map((movie, index) => {
              const pinKey = `entertainment-movie-${movie.id}`;
              return (
                <SmartContextMenu
                  key={movie.id}
                  actions={buildActions({
                    section: "entertainment",
                    isPinned: !!pinnedIds[pinKey],
                    onOpenLargeView: () => setLargeView(movie),
                    onDuplicate: () => duplicateMovie(movie),
                    onTogglePin: () => togglePin(pinKey),
                    onDelete: () => setDeleteTarget(movie),
                  })}
                >
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + index * 0.05 }} className="glass rounded-xl p-5 cursor-default">
                    <div className="text-5xl mb-4 text-center">{movie.poster}</div>
                    <h4 className="mb-2">{movie.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{movie.year}</span>
                      <span className="px-2 py-1 rounded bg-primary/20 text-primary">{movie.genre}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < (movie.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="ml-2 text-sm font-bold">{movie.rating}/10</span>
                    </div>
                  </motion.div>
                </SmartContextMenu>
              );
            })}
          </div>
        </div>
      )}

      <LargeViewDialog
        open={!!largeView}
        onOpenChange={(open) => !open && setLargeView(null)}
        title={largeView?.title || "Entertainment Detail"}
        description="Focused movie view with details, watch insights, and recommendation-ready context."
        details={largeView || {}}
        insight="AI suggestion: based on your recent ratings, similar titles in this genre are likely to score above your average."
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete movie?"
        description={`This action will remove ${deleteTarget?.title || "this movie"}. You can undo from the toast.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
