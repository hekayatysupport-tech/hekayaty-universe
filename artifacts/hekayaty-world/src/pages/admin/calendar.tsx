import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Plus, CheckCircle, AlertCircle, Globe, Sparkles, Filter } from "lucide-react";
import { motion } from "framer-motion";

export function AdminReleaseCalendar() {
  const [schedules, setSchedules] = useState<any[]>([
    {
      id: "sched-1",
      title: "The Crossers — Chapter 4: The Solar Temple",
      contentType: "story_chapter",
      scheduledFor: "2026-09-22T18:00:00Z",
      timezone: "Cairo (UTC+3)",
      status: "scheduled",
      releaseNotes: "Includes Saqr's solar magic awakening scene.",
      notifySubscribers: true,
    },
    {
      id: "sched-2",
      title: "Dawn of the Veil — Issue #2 (Subscriber Exclusive)",
      contentType: "comic_issue",
      scheduledFor: "2026-09-25T12:00:00Z",
      timezone: "Cairo (UTC+3)",
      status: "scheduled",
      releaseNotes: "Full-color 32 page comic release.",
      notifySubscribers: true,
    },
    {
      id: "sched-3",
      title: "Veil Chronicles Novel — Chapter 12",
      contentType: "novel_chapter",
      scheduledFor: "2026-09-18T10:00:00Z",
      timezone: "Cairo (UTC+3)",
      status: "published",
      releaseNotes: "Published automatically.",
      notifySubscribers: true,
    },
  ]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [targetTitle, setTargetTitle] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [releaseTime, setReleaseTime] = useState("18:00");
  const [releaseNotes, setReleaseNotes] = useState("");

  useEffect(() => {
    fetch("/api/admin/schedules")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.schedules && data.schedules.length > 0) {
          setSchedules(data.schedules);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTitle || !releaseDate) return;
    try {
      const scheduledFor = new Date(`${releaseDate}T${releaseTime}:00Z`).toISOString();
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledFor,
          releaseNotes,
        }),
      });

      if (res.ok) {
        setShowScheduleModal(false);
        setSchedules((prev) => [
          {
            id: `sched-${Date.now()}`,
            title: targetTitle,
            contentType: "story_chapter",
            scheduledFor,
            timezone: "Cairo (UTC+3)",
            status: "scheduled",
            releaseNotes,
            notifySubscribers: true,
          },
          ...prev,
        ]);
        setTargetTitle("");
        setReleaseNotes("");
      }
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f24]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37] uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" /> Automated Publishing Workflow
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#f0f0f0]">Release Calendar & Publishing Schedule</h1>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-5 py-2.5 bg-[#d4af37] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" /> Schedule New Release
        </button>
      </div>

      {/* Release Timeline List */}
      <div className="grid grid-cols-1 gap-4">
        {schedules.map((item) => {
          const isPublished = item.status === "published";
          const dateObj = new Date(item.scheduledFor);

          return (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                isPublished
                  ? "bg-[#0e0e12] border-[#222228]"
                  : "bg-[#14141c] border-[#d4af37]/40 shadow-[0_0_20px_rgba(212,175,55,0.08)]"
              }`}
            >
              {/* Left Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      isPublished
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {isPublished ? "Published" : "Scheduled Release"}
                  </span>
                  <span className="text-xs text-[#888888] font-mono">{item.timezone}</span>
                </div>

                <h3 className="text-lg font-serif font-bold text-[#f0f0f0]">{item.title}</h3>
                {item.releaseNotes && <p className="text-xs text-[#8a8a92]">{item.releaseNotes}</p>}
              </div>

              {/* Right Countdown / Date */}
              <div className="flex items-center gap-4 text-right">
                <div className="space-y-0.5">
                  <div className="text-sm font-extrabold text-[#d4af37]">
                    {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-xs font-mono text-[#888888]">
                    {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-[#181820] border border-[#26262e] flex items-center justify-center text-[#d4af37]">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e12] border border-[#2a2a30] rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
            <h3 className="text-xl font-serif font-bold text-[#f0f0f0]">Schedule Release</h3>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">Target Title / Chapter</label>
                <input
                  type="text"
                  required
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  placeholder="e.g. The Crossers - Chapter 5"
                  className="w-full px-4 py-2.5 bg-[#14141a] border border-[#26262e] rounded-lg text-xs text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">Release Date</label>
                  <input
                    type="date"
                    required
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14141a] border border-[#26262e] rounded-lg text-xs text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">Release Time</label>
                  <input
                    type="time"
                    required
                    value={releaseTime}
                    onChange={(e) => setReleaseTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14141a] border border-[#26262e] rounded-lg text-xs text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">Release Notes</label>
                <textarea
                  rows={3}
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="Notes for subscribers & community announcement..."
                  className="w-full px-4 py-2.5 bg-[#14141a] border border-[#26262e] rounded-lg text-xs text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1f1f24]">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-xs font-bold uppercase text-[#888888]">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#d4af37] text-black font-extrabold uppercase text-xs rounded-lg">Schedule Publication</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
