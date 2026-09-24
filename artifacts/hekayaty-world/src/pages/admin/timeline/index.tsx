import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Sparkles,
  Save,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface TimelineEra {
  id: string;
  name: string;
  arabic_name: string;
  description?: string | null;
  order_index: number;
}

interface TimelineEvent {
  id: string;
  era_id?: string | null;
  year_label?: string | null;
  title: string;
  arabic_title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  order_index: number;
  status: string;
}

export const AdminTimeline = () => {
  const { session, isPublisher } = useAuth();
  const [loading, setLoading] = useState(true);
  const [eras, setEras] = useState<TimelineEra[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  // Modals
  const [newEraModalOpen, setNewEraModalOpen] = useState(false);
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  // Era Form
  const [eraForm, setEraForm] = useState({
    name: "",
    arabic_name: "",
    description: "",
    order_index: 0,
  });

  // Event Form
  const [eventForm, setEventForm] = useState({
    era_id: "",
    year_label: "Year 0",
    title: "",
    arabic_title: "",
    subtitle: "",
    description: "",
    order_index: 0,
    status: "published",
  });

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/timeline`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEras(data.eras || []);
        setEvents(data.events || []);
        if (data.eras?.length > 0 && !eventForm.era_id) {
          setEventForm((prev) => ({ ...prev, era_id: data.eras[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading timeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTimeline();
    }
  }, [session]);

  const handleCreateEra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eraForm.name.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/timeline/eras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(eraForm),
      });

      if (!res.ok) throw new Error("Failed to create era");

      toast.success("Era registered!");
      setNewEraModalOpen(false);
      setEraForm({ name: "", arabic_name: "", description: "", order_index: eras.length + 1 });
      await fetchTimeline();
    } catch (err: any) {
      toast.error(err.message || "Error creating era");
    }
  };

  const handleCreateOrUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    try {
      const isEditing = Boolean(editingEvent);
      const url = isEditing
        ? `${API_BASE_URL}/api/admin/timeline/events/${editingEvent?.id}`
        : `${API_BASE_URL}/api/admin/timeline/events`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(eventForm),
      });

      if (!res.ok) throw new Error("Failed to save event");

      toast.success(isEditing ? "Event updated!" : "Event chronologized!");
      setNewEventModalOpen(false);
      setEditingEvent(null);
      setEventForm({
        era_id: eras[0]?.id || "",
        year_label: "Year 0",
        title: "",
        arabic_title: "",
        subtitle: "",
        description: "",
        order_index: events.length + 1,
        status: "published",
      });
      await fetchTimeline();
    } catch (err: any) {
      toast.error(err.message || "Error saving event");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Delete timeline event?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/timeline/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to delete event");

      toast.success("Event deleted");
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Error deleting event");
    }
  };

  const moveEvent = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= events.length) return;

    const reordered = [...events];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setEvents(reordered.map((ev, idx) => ({ ...ev, order_index: idx + 1 })));

    try {
      await Promise.all(
        reordered.map((ev, idx) =>
          fetch(`${API_BASE_URL}/api/admin/timeline/events/${ev.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ order_index: idx + 1 }),
          })
        )
      );
      toast.success("Chronological sequence saved!");
    } catch (err) {
      toast.error("Error updating sequence");
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              Universe Chronology & Timeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              {events.length} Historical Events
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Construct cosmic eras, cataclysms, ancient wars, and the chronological saga of Hekayaty.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setNewEraModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#16161c] hover:bg-[#202028] border border-[#333] text-xs font-bold text-[#e0e0e0] rounded-lg transition-colors"
          >
            <Layers className="w-4 h-4 text-[#d4af37]" />
            New Era
          </button>

          <button
            onClick={() => {
              setEditingEvent(null);
              setEventForm({
                era_id: eras[0]?.id || "",
                year_label: "Year 0",
                title: "",
                arabic_title: "",
                subtitle: "",
                description: "",
                order_index: events.length + 1,
                status: "published",
              });
              setNewEventModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Eras Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {eras.map((era) => {
          const eraEvents = events.filter((ev) => ev.era_id === era.id);
          return (
            <div
              key={era.id}
              className="p-4 bg-[#0a0a0d] border border-[#1f1f24] rounded-xl flex flex-col justify-between space-y-2"
            >
              <div>
                <span className="text-[10px] font-mono text-[#d4af37] font-bold uppercase">Era {era.order_index}</span>
                <h3 className="font-serif font-bold text-sm text-[#f0f0f0]">{era.name}</h3>
                <p className="text-xs text-[#888888]" dir="rtl">{era.arabic_name}</p>
              </div>
              <p className="text-[11px] font-mono text-[#666666]">{eraEvents.length} Events recorded</p>
            </div>
          );
        })}
      </div>

      {/* Timeline Stream Table */}
      <div className="bg-[#0a0a0d] border border-[#1f1f24] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center text-[#888888] font-mono text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
            Synchronizing universe timeline saga...
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center text-[#666666]">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-25" />
            <p className="text-sm font-medium">No timeline events recorded.</p>
            <button
              onClick={() => setNewEventModalOpen(true)}
              className="mt-3 text-xs text-[#d4af37] hover:underline font-bold uppercase tracking-wider"
            >
              + Chronologize the first event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121216] border-b border-[#1f1f24] text-[#888888] uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-6 py-3.5">Seq</th>
                  <th className="px-6 py-3.5">Temporal Marker</th>
                  <th className="px-6 py-3.5">Historical Event</th>
                  <th className="px-6 py-3.5">Era</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181f]">
                {events.map((ev, idx) => {
                  const era = eras.find((er) => er.id === ev.era_id);
                  return (
                    <tr key={ev.id} className="hover:bg-[#111116] transition-colors group">
                      <td className="px-6 py-4 font-mono text-[#d4af37] font-bold">
                        #{idx + 1}
                      </td>

                      <td className="px-6 py-4 font-mono text-[#f0f0f0] font-semibold">
                        {ev.year_label || "Unknown"}
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-serif font-bold text-sm text-[#f0f0f0] group-hover:text-[#d4af37] transition-colors">
                            {ev.title}
                          </p>
                          {ev.arabic_title && (
                            <p className="text-[11px] text-[#888888] font-sans" dir="rtl">
                              {ev.arabic_title}
                            </p>
                          )}
                          {ev.description && (
                            <p className="text-xs text-[#999999] line-clamp-1 mt-1 font-sans">
                              {ev.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-[#181822] text-[#c0c0c0] border border-[#2a2a38]">
                          {era?.name || "Global"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                          {ev.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveEvent(idx, "up")}
                            disabled={idx === 0}
                            className="p-1.5 bg-[#181820] hover:bg-[#252530] text-[#a0a0a0] hover:text-[#d4af37] rounded disabled:opacity-30 transition-colors"
                            title="Move earlier"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveEvent(idx, "down")}
                            disabled={idx === events.length - 1}
                            className="p-1.5 bg-[#181820] hover:bg-[#252530] text-[#a0a0a0] hover:text-[#d4af37] rounded disabled:opacity-30 transition-colors"
                            title="Move later"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEvent(ev);
                              setEventForm({
                                era_id: ev.era_id || eras[0]?.id || "",
                                year_label: ev.year_label || "",
                                title: ev.title || "",
                                arabic_title: ev.arabic_title || "",
                                subtitle: ev.subtitle || "",
                                description: ev.description || "",
                                order_index: ev.order_index || 0,
                                status: ev.status || "published",
                              });
                              setNewEventModalOpen(true);
                            }}
                            className="p-1.5 bg-[#181820] hover:bg-[#252530] text-[#a0a0a0] hover:text-[#d4af37] rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="p-1.5 bg-[#181820] hover:bg-red-500/20 text-[#888888] hover:text-red-400 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Era Modal */}
      {newEraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e0e12] border border-[#2c2c34] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-serif font-bold text-[#f0f0f0]">Create Historical Era</h2>
            <form onSubmit={handleCreateEra} className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-[#a0a0a0] mb-1">Era Name (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Age of First Light"
                  value={eraForm.name}
                  onChange={(e) => setEraForm({ ...eraForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-[#a0a0a0] mb-1">Arabic Name</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: عصر النور الأول"
                  value={eraForm.arabic_name}
                  onChange={(e) => setEraForm({ ...eraForm, arabic_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-[#a0a0a0] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={eraForm.description}
                  onChange={(e) => setEraForm({ ...eraForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewEraModalOpen(false)}
                  className="px-4 py-2 bg-[#181820] text-xs text-[#e0e0e0] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase rounded-lg"
                >
                  Save Era
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {newEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e0e12] border border-[#2c2c34] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-serif font-bold text-[#f0f0f0]">
              {editingEvent ? "Edit Timeline Event" : "Chronologize Event"}
            </h2>
            <form onSubmit={handleCreateOrUpdateEvent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-[#a0a0a0] mb-1">Assigned Era</label>
                  <select
                    value={eventForm.era_id}
                    onChange={(e) => setEventForm({ ...eventForm, era_id: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0]"
                  >
                    {eras.map((er) => (
                      <option key={er.id} value={er.id}>{er.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-[#a0a0a0] mb-1">Year / Time Marker</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Year 1045 BL"
                    value={eventForm.year_label}
                    onChange={(e) => setEventForm({ ...eventForm, year_label: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-[#a0a0a0] mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Fall of the Shadow Gates"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#a0a0a0] mb-1">Arabic Title</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: سقوط بوابات الظلال الكبرى"
                  value={eventForm.arabic_title}
                  onChange={(e) => setEventForm({ ...eventForm, arabic_title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#a0a0a0] mb-1">Chronicle Description</label>
                <textarea
                  rows={3}
                  placeholder="Historical context and consequences of this pivotal moment..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewEventModalOpen(false)}
                  className="px-4 py-2 bg-[#181820] text-xs text-[#e0e0e0] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase rounded-lg"
                >
                  Save Chronicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
