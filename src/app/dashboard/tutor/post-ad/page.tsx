"use client";

import React, { useState, ChangeEvent, DragEvent } from "react";
import { classService } from "@/services/classService";
import { useRouter } from "next/navigation";

interface AdFormData {
  name: string;
  subject: string;
  grade: string;
  medium: string;
  mode: string;
  fees: string;
  description: string;
  schedule: string;
  banner: File | null;
}

const EMPTY_FORM: AdFormData = {
  name: "",
  subject: "",
  grade: "",
  medium: "",
  mode: "",
  fees: "",
  description: "",
  schedule: "",
  banner: null,
};

const GRADES: string[] = ["A/L", "O/L", "Grade 6-9", "University", "Professional"];
const MEDIUMS: string[] = ["English", "Sinhala", "Tamil"];
const MODES: { value: string; label: string }[] = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Physical" },
  { value: "both", label: "Both" },
];

export default function PostAdPage() {
  const router = useRouter();
  const [form, setForm] = useState<AdFormData>(EMPTY_FORM);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBannerFile = (file: File): void => {
    setForm((prev) => ({ ...prev, banner: file }));
    setBannerUrl(URL.createObjectURL(file));
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) handleBannerFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleBannerFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(true);
  };

  const removeBanner = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setForm((prev) => ({ ...prev, banner: null }));
    setBannerUrl(null);
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.name);
      formData.append("subject", form.subject);
      formData.append("grade", form.grade);
      formData.append("medium", form.medium);
      formData.append("fee", form.fees);
      formData.append("description", form.description);
      formData.append("schedule", form.schedule);
      formData.append("mode", form.mode || "both");

      if (form.banner) {
        formData.append("banner", form.banner);
      }

      await classService.createClass(formData);
      setSubmitted(true);
      setTimeout(() => {
        router.push('/dashboard/tutor/my-classes');
      }, 1500);
    } catch (err: any) {
      console.error("Failed to post ad", err);
      alert(err.response?.data?.message || err.message || "Failed to post ad. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (): void => {
    router.push('/dashboard/tutor/my-classes');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --bg:      #eef7f1;
          --card:    #ffffff;
          --border:  #c3deca;
          --ink:     #0c1f13;
          --muted:   #5f8a6d;
          --g1:      #166534;
          --g2:      #22c55e;
          --g3:      #bbf7d0;
          --g4:      #dcfce7;
          --g5:      #052e16;
          --shadow:  rgba(22,101,52,0.10);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse at 5% 10%,  rgba(34,197,94,0.12) 0%, transparent 45%),
            radial-gradient(ellipse at 95% 90%, rgba(22,101,52,0.10) 0%, transparent 45%);
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 0 0 80px;
        }

        /* ── Top bar ── */
        .topbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(238,247,241,0.92);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--border);
          padding: 16px 48px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .topbar-badge {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--g1), var(--g2));
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; box-shadow: 0 3px 10px rgba(22,101,52,0.25);
        }
        .topbar-title {
          font-family: 'Fraunces', serif;
          font-size: 20px; color: var(--ink); font-weight: 700;
        }
        .topbar-sub { font-size: 12px; color: var(--muted); margin-top: 1px; }

        /* ── Buttons ── */
        .btn-cancel {
          padding: 9px 22px;
          border: 1.5px solid var(--border); border-radius: 9px;
          background: transparent; color: var(--muted);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .btn-cancel:hover { background: var(--g4); color: var(--g1); border-color: var(--g2); }

        .btn-submit {
          padding: 10px 28px;
          border: none; border-radius: 9px;
          background: linear-gradient(135deg, var(--g1), #16a34a);
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 16px rgba(22,101,52,0.32);
          transition: opacity 0.2s, transform 0.15s;
          display: flex; align-items: center; gap: 7px;
        }
        .btn-submit:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-submit.done { background: linear-gradient(135deg, var(--g5), var(--g1)); }

        .btn-group { display: flex; gap: 10px; align-items: center; }

        /* ── Layout ── */
        .layout {
          max-width: 1100px; margin: 0 auto;
          padding: 36px 24px 0;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
          align-items: start;
        }

        /* ── Form card ── */
        .form-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 36px 36px;
          box-shadow: 0 4px 24px var(--shadow);
          position: relative; overflow: hidden;
        }
        .form-card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 4px;
          background: linear-gradient(90deg, var(--g1), var(--g2), var(--g1));
        }

        .section-title {
          font-family: 'Fraunces', serif;
          font-size: 15px; font-weight: 700; color: var(--ink);
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 18px;
        }
        .section-title .icon {
          width: 28px; height: 28px; border-radius: 7px;
          background: var(--g4); border: 1px solid var(--g3);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }

        /* ── Field ── */
        .field-row { display: grid; gap: 16px; margin-bottom: 16px; }
        .field-row.cols-2 { grid-template-columns: 1fr 1fr; }

        .field label {
          display: block;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 6px;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; color: var(--ink);
          background: var(--bg); outline: none; resize: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          appearance: none;
        }
        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: var(--g2);
          box-shadow: 0 0 0 3px rgba(34,197,94,0.15);
          background: #fff;
        }
        .field textarea { height: 90px; }
        .field select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235f8a6d' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }

        /* ── Chips ── */
        .chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .chip {
          padding: 7px 18px; border-radius: 100px;
          border: 1.5px solid var(--border);
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.18s; background: var(--bg); color: var(--ink);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .chip.active {
          background: linear-gradient(135deg, var(--g1), #16a34a);
          color: #fff; border-color: transparent;
          box-shadow: 0 2px 10px rgba(22,101,52,0.25);
        }

        /* ── Banner upload ── */
        .banner-zone {
          border: 2px dashed var(--border);
          border-radius: 14px; padding: 32px 24px;
          text-align: center; cursor: pointer;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .banner-zone.over { border-color: var(--g2); background: var(--g4); }
        .banner-zone:hover { border-color: #6ee7a0; background: var(--g4); }
        .banner-zone-icon { font-size: 32px; margin-bottom: 8px; }
        .banner-zone-title { font-size: 14px; font-weight: 600; color: var(--ink); }
        .banner-zone-sub   { font-size: 12px; color: var(--muted); margin-top: 4px; }
        .banner-zone-browse { color: var(--g1); font-weight: 700; }

        .banner-preview { position: relative; border-radius: 12px; overflow: hidden; }
        .banner-preview img { width: 100%; max-height: 200px; object-fit: cover; display: block; border-radius: 12px; }
        .banner-remove {
          position: absolute; top: 8px; right: 8px;
          background: rgba(12,31,19,0.75); color: #fff;
          border: none; border-radius: 7px;
          padding: 5px 12px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.2s;
        }
        .banner-remove:hover { background: #dc2626; }

        .divider { height: 1px; background: var(--border); margin: 24px 0; }

        /* ── Preview card ── */
        .preview-wrap {
          position: sticky; top: 88px;
        }
        .preview-label {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 12px;
          display: flex; align-items: center; gap: 6px;
        }
        .preview-label::before, .preview-label::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }

        .preview-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 6px 30px var(--shadow);
        }

        .preview-banner {
          height: 160px; background: var(--g3);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .preview-banner img { width: 100%; height: 100%; object-fit: cover; }
        .preview-banner-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 6px; color: var(--muted); font-size: 13px;
        }
        .preview-banner-empty span { font-size: 28px; }

        .preview-body { padding: 20px; }

        .preview-grade-badge {
          display: inline-flex; align-items: center;
          padding: 3px 12px; border-radius: 100px;
          background: var(--g4); color: var(--g1);
          font-size: 11px; font-weight: 700;
          border: 1px solid var(--g3);
          margin-bottom: 10px;
        }

        .preview-title {
          font-family: 'Fraunces', serif;
          font-size: 19px; font-weight: 700; color: var(--ink);
          line-height: 1.3; margin-bottom: 6px;
        }
        .preview-meta {
          font-size: 12px; color: var(--muted); margin-bottom: 12px;
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
        }
        .preview-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--border); }

        .preview-desc {
          font-size: 13px; color: var(--muted);
          line-height: 1.6; margin-bottom: 14px;
          min-height: 40px;
        }

        .preview-price-row {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--g4); border-radius: 12px;
          border: 1px solid var(--g3);
          margin-bottom: 14px;
        }
        .preview-price-label { font-size: 11px; color: var(--muted); font-weight: 600; }
        .preview-price-value {
          font-family: 'Fraunces', serif;
          font-size: 20px; font-weight: 700; color: var(--g1);
        }

        .preview-cta {
          width: 100%; padding: 12px;
          border: none; border-radius: 11px;
          background: linear-gradient(135deg, var(--g1), #16a34a);
          color: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700; cursor: pointer;
          box-shadow: 0 3px 14px rgba(22,101,52,0.28);
          transition: opacity 0.2s, transform 0.15s;
        }
        .preview-cta:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Toast ── */
        .toast {
          position: fixed; bottom: 32px; left: 50%;
          transform: translateX(-50%) translateY(80px);
          background: linear-gradient(135deg, var(--g5), var(--g1));
          color: #fff; padding: 13px 32px; border-radius: 100px;
          font-size: 14px; font-weight: 700;
          box-shadow: 0 10px 32px rgba(22,101,52,0.40);
          transition: transform 0.38s cubic-bezier(.22,1,.36,1), opacity 0.38s;
          opacity: 0; pointer-events: none; z-index: 9999;
        }
        .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

        @media (max-width: 820px) {
          .layout { grid-template-columns: 1fr; }
          .preview-wrap { position: static; }
          .topbar { padding: 14px 20px; }
          .form-card { padding: 24px 20px; }
        }
        @media (max-width: 520px) {
          .field-row.cols-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">

        {/* ── TOP BAR ── */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="topbar-badge">📢</div>
            <div>
              <div className="topbar-title">Create Class Ad</div>
              <div className="topbar-sub">Fill in the details — preview updates live</div>
            </div>
          </div>
          <div className="btn-group">
            <button className="btn-cancel" type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="layout">

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit}>
            <div className="form-card">

              {/* Class Info */}
              <div className="section-title">
                <span className="icon">📋</span> Class Information
              </div>

              <div className="field-row cols-2">
                <div className="field">
                  <label>Class Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. A/L ICT 2026"
                  />
                </div>
                <div className="field">
                  <label>Subject</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="e.g. ICT, Mathematics"
                  />
                </div>
              </div>

              <div className="field-row cols-2">
                <div className="field">
                  <label>Grade / Level</label>
                  <select name="grade" value={form.grade} onChange={handleChange}>
                    <option value="">Select grade</option>
                    {GRADES.map((g: string) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Monthly Fees (LKR)</label>
                  <input
                    name="fees"
                    value={form.fees}
                    onChange={handleChange}
                    placeholder="e.g. 2500"
                    type="number"
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Schedule / Timing</label>
                  <input
                    name="schedule"
                    value={form.schedule}
                    onChange={handleChange}
                    placeholder="e.g. Saturdays 9AM – 12PM"
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Tell students what this class covers, your teaching approach, resources provided…"
                  />
                </div>
              </div>

              <div className="divider" />

              {/* Medium */}
              <div className="section-title">
                <span className="icon">🌐</span> Teaching Medium
              </div>
              <div className="field-row" style={{ marginBottom: 0 }}>
                <div className="chips">
                  {MEDIUMS.map((m: string) => (
                    <button
                      key={m}
                      type="button"
                      className={`chip${form.medium === m ? " active" : ""}`}
                      onClick={() => setForm((prev) => ({ ...prev, medium: m }))}
                    >
                      {form.medium === m ? "✓ " : ""}{m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider" />

              {/* Mode */}
              <div className="section-title">
                <span className="icon">📍</span> Class Mode
              </div>
              <div className="field-row" style={{ marginBottom: 0 }}>
                <div className="chips">
                  {MODES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      className={`chip${form.mode === m.value ? " active" : ""}`}
                      onClick={() => setForm((prev) => ({ ...prev, mode: m.value }))}
                    >
                      {form.mode === m.value ? "✓ " : ""}{m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider" />

              {/* Banner */}
              <div className="section-title">
                <span className="icon">🖼️</span> Banner Image
              </div>

              <div
                className={`banner-zone${dragOver ? " over" : ""}`}
                onClick={() => document.getElementById("bannerInput")?.click()}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {bannerUrl ? (
                  <div className="banner-preview">
                    <img src={bannerUrl} alt="Banner preview" />
                    <button className="banner-remove" onClick={removeBanner}>✕ Remove</button>
                  </div>
                ) : (
                  <>
                    <div className="banner-zone-icon">📤</div>
                    <div className="banner-zone-title">
                      Drag & drop your banner image
                    </div>
                    <div className="banner-zone-sub">
                      or <span className="banner-zone-browse">browse files</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
                      Recommended: 1600 × 400 px · PNG, JPG
                    </div>
                  </>
                )}
              </div>
              <input
                id="bannerInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileInput}
              />

              <div className="divider" />

              {/* Submit */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button className="btn-cancel" type="button" onClick={handleCancel}>
                  Discard
                </button>
                <button className={`btn-submit${submitted ? " done" : ""}`} type="submit" disabled={loading}>
                  {loading ? "Posting..." : submitted ? "✓ Ad Posted!" : "🚀 Post Ad"}
                </button>
              </div>

            </div>
          </form>

          {/* ── LIVE PREVIEW ── */}
          <div className="preview-wrap">
            <div className="preview-label">Live Preview</div>
            <div className="preview-card">

              {/* Banner */}
              <div className="preview-banner">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="Preview banner" />
                ) : (
                  <div className="preview-banner-empty">
                    <span>🏫</span>
                    Banner will appear here
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="preview-body">
                {form.grade && (
                  <div className="preview-grade-badge">
                    {form.grade}{form.medium ? ` · ${form.medium}` : ""}
                  </div>
                )}

                <div className="preview-title">
                  {form.name || "Your Class Title"}
                </div>

                <div className="preview-meta">
                  {form.subject && <span>{form.subject}</span>}
                  {form.subject && form.schedule && <span className="preview-dot" />}
                  {form.schedule && <span>{form.schedule}</span>}
                  {!form.subject && !form.schedule && (
                    <span style={{ color: "var(--border)" }}>Subject · Schedule</span>
                  )}
                </div>

                <div className="preview-desc">
                  {form.description || (
                    <span style={{ color: "var(--border)" }}>
                      Your class description will appear here…
                    </span>
                  )}
                </div>

                <div className="preview-price-row">
                  <span className="preview-price-label">Monthly Fee</span>
                  <span className="preview-price-value">
                    {form.fees ? `LKR ${Number(form.fees).toLocaleString()}` : "—"}
                  </span>
                </div>

                <button className="preview-cta">View & Enroll →</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* TOAST */}
      <div className={`toast${submitted ? " show" : ""}`}>
        🎉 Your class ad has been posted!
      </div>
    </>
  );
}