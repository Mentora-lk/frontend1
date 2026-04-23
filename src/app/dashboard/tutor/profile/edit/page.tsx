"use client";

import React, { useState, ChangeEvent, DragEvent } from "react";

const DAYS: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS: string[] = [
  "6AM","7AM","8AM","9AM","10AM","11AM",
  "12PM","1PM","2PM","3PM","4PM","5PM",
  "6PM","7PM","8PM","9PM","10PM","11PM",
];
const LANGUAGES: string[] = ["English", "Sinhala", "Tamil"];

interface ProfileData {
  fullName: string;
  headline: string;
  bio: string;
  contact: string;
  subject: string;
  rate: string;
}

const EMPTY_PROFILE: ProfileData = {
  fullName: "", headline: "", bio: "", contact: "", subject: "", rate: "",
};

export default function EditProfilePage() {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [selectedLangs, setSelectedLangs] = useState<Set<string>>(new Set(["English"]));
  const [profileData, setProfileData] = useState<ProfileData>(EMPTY_PROFILE);
  const [bannerDragOver, setBannerDragOver] = useState<boolean>(false);
  const [profilePic, setProfilePic] = useState<string>("https://randomuser.me/api/portraits/men/32.jpg");
  const [bannerBg, setBannerBg] = useState<string | null>(null);
  const [saved, setSaved] = useState<boolean>(false);

  const toggleSlot = (key: string): void => {
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleLang = (lang: string): void => {
    setSelectedLangs((prev) => {
      const next = new Set(prev);
      next.has(lang) ? next.delete(lang) : next.add(lang);
      return next;
    });
  };

  const handleField = (field: keyof ProfileData, val: string): void =>
    setProfileData((p) => ({ ...p, [field]: val }));

  const handleSave = (): void => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleProfilePicUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) setProfilePic(URL.createObjectURL(file));
  };

  const handleBannerUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) setBannerBg(URL.createObjectURL(file));
  };

  const handleBannerDrop = (e: DragEvent<HTMLLabelElement>): void => {
    e.preventDefault();
    setBannerDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setBannerBg(URL.createObjectURL(file));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg:     #f0f7f2;
          --card:   #ffffff;
          --border: #c8e0ce;
          --ink:    #0d2018;
          --muted:  #6b8c75;
          --g1:     #1a7a45;
          --g2:     #25a35d;
          --g3:     #d4f0e0;
          --g4:     #0f5c34;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse at 0% 0%, rgba(26,122,69,0.13) 0%, transparent 50%),
            radial-gradient(ellipse at 100% 100%, rgba(37,163,93,0.10) 0%, transparent 50%);
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding-bottom: 80px;
        }

        .top-bar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(240,247,242,0.90);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          padding: 15px 48px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .top-bar-title {
          font-family: 'Fraunces', serif;
          font-size: 21px; color: var(--ink);
          display: flex; align-items: center; gap: 10px;
        }
        .top-bar-title .dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--g2); display: inline-block;
          box-shadow: 0 0 0 3px rgba(37,163,93,0.25);
        }
        .top-bar-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

        .btn-ghost {
          padding: 9px 22px; border: 1.5px solid var(--border);
          border-radius: 9px; background: transparent;
          color: var(--muted); font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .btn-ghost:hover { background: var(--g3); color: var(--g4); border-color: var(--g2); }

        .btn-primary {
          padding: 9px 26px; border: none; border-radius: 9px;
          background: linear-gradient(135deg, var(--g1), var(--g2));
          color: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer;
          box-shadow: 0 3px 14px rgba(26,122,69,0.30);
          transition: opacity 0.2s, transform 0.15s;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary.saving { background: linear-gradient(135deg, var(--g4), var(--g1)); }

        .btn-group { display: flex; gap: 10px; align-items: center; }

        .content {
          max-width: 860px; margin: 0 auto;
          padding: 36px 24px 0;
          display: flex; flex-direction: column; gap: 26px;
        }

        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px; padding: 30px 32px;
          box-shadow: 0 2px 18px rgba(15,92,52,0.06);
          position: relative; overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 4px; height: 100%;
          background: linear-gradient(180deg, var(--g2), var(--g1));
          border-radius: 4px 0 0 4px;
        }

        .card-header {
          display: flex; align-items: center; gap: 13px; margin-bottom: 22px;
        }
        .card-icon {
          width: 40px; height: 40px; border-radius: 11px;
          background: var(--g3); border: 1px solid rgba(26,122,69,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 19px; flex-shrink: 0;
        }
        .card-title {
          font-family: 'Fraunces', serif;
          font-size: 17px; color: var(--ink); font-weight: 700;
        }
        .card-subtitle { font-size: 12px; color: var(--muted); margin-top: 1px; }

        .field-group { display: grid; gap: 16px; }
        .field-group.cols-2 { grid-template-columns: 1fr 1fr; }

        .field label {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 6px;
        }
        .field input, .field textarea {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; color: var(--ink);
          background: var(--bg); outline: none; resize: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .field input:focus, .field textarea:focus {
          border-color: var(--g2);
          box-shadow: 0 0 0 3px rgba(37,163,93,0.15);
          background: #fff;
        }
        .field textarea { height: 110px; }

        .divider { height: 1px; background: var(--border); margin: 20px 0; }

        .banner-drop {
          height: 140px; border-radius: 13px;
          border: 2px dashed var(--border);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 7px;
          cursor: pointer; transition: all 0.2s;
          background-size: cover; background-position: center;
          position: relative; overflow: hidden;
        }
        .banner-drop.over { border-color: var(--g2); background-color: var(--g3); }
        .banner-drop-icon { font-size: 26px; }
        .banner-drop-text { font-size: 13px; color: var(--muted); font-weight: 500; }
        .banner-overlay {
          position: absolute; inset: 0;
          background: rgba(13,32,24,0.40);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 13px; font-weight: 600;
          opacity: 0; transition: opacity 0.2s;
        }
        .banner-drop:hover .banner-overlay { opacity: 1; }

        .avatar-row { display: flex; align-items: center; gap: 20px; margin-top: 16px; }
        .avatar-wrap { position: relative; flex-shrink: 0; }
        .avatar {
          width: 74px; height: 74px; border-radius: 50%;
          object-fit: cover; border: 3px solid var(--card);
          box-shadow: 0 0 0 2.5px var(--g2);
        }
        .avatar-badge {
          position: absolute; bottom: 0; right: 0;
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--g1); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; border: 2px solid var(--card); cursor: pointer;
        }
        .avatar-info h4 { font-size: 15px; font-weight: 600; color: var(--ink); }
        .avatar-info p  { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .avatar-btns    { display: flex; gap: 8px; margin-top: 10px; }

        .btn-sm-green {
          padding: 6px 16px; border-radius: 8px;
          background: linear-gradient(135deg, var(--g1), var(--g2));
          color: #fff; border: none; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: opacity 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-sm-green:hover { opacity: 0.85; }
        .btn-sm-ghost-sm {
          padding: 6px 16px; border-radius: 8px;
          background: transparent; color: var(--muted);
          border: 1.5px solid var(--border); font-size: 13px;
          cursor: pointer; transition: background 0.2s, color 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-sm-ghost-sm:hover { background: var(--g3); color: var(--g4); }

        .chips { display: flex; gap: 10px; flex-wrap: wrap; }
        .chip {
          padding: 7px 20px; border-radius: 100px;
          border: 1.5px solid var(--border);
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all 0.18s; background: var(--bg); color: var(--ink);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .chip.active {
          background: linear-gradient(135deg, var(--g1), var(--g2));
          color: #fff; border-color: transparent;
          box-shadow: 0 2px 10px rgba(26,122,69,0.25);
        }

        .schedule-scroll { overflow-x: auto; padding-bottom: 4px; }
        .schedule-grid {
          display: grid;
          grid-template-columns: 54px repeat(7, 1fr);
          gap: 4px; min-width: 580px;
        }
        .sched-corner { height: 30px; }
        .sched-day {
          text-align: center; font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--muted); padding: 6px 0;
        }
        .sched-time {
          font-size: 10px; color: var(--muted);
          text-align: right; padding-right: 8px;
          display: flex; align-items: center; justify-content: flex-end;
          height: 30px;
        }
        .sched-cell {
          height: 30px; border-radius: 6px;
          border: 1.5px solid var(--border);
          cursor: pointer; background: var(--bg);
          transition: background 0.15s, border-color 0.15s;
        }
        .sched-cell:hover { background: var(--g3); border-color: var(--g2); }
        .sched-cell.selected {
          background: linear-gradient(135deg, var(--g1), var(--g2));
          border-color: transparent;
        }

        .sched-legend { display: flex; gap: 16px; align-items: center; margin-top: 14px; }
        .sched-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
        .sched-dot { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
        .dot-free { background: var(--bg); border: 1.5px solid var(--border); }
        .dot-sel  { background: var(--g2); }

        .page-footer {
          max-width: 860px; margin: 30px auto 0;
          padding: 0 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-hint { font-size: 12px; color: var(--muted); }

        .toast {
          position: fixed; bottom: 32px; left: 50%;
          transform: translateX(-50%) translateY(80px);
          background: linear-gradient(135deg, var(--g4), var(--g1));
          color: #fff; padding: 12px 30px; border-radius: 100px;
          font-size: 14px; font-weight: 600;
          box-shadow: 0 8px 28px rgba(26,122,69,0.40);
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), opacity 0.35s;
          opacity: 0; pointer-events: none; z-index: 9999;
        }
        .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

        @media (max-width: 640px) {
          .top-bar { padding: 14px 20px; }
          .content { padding: 20px 16px 0; }
          .field-group.cols-2 { grid-template-columns: 1fr; }
          .page-footer { flex-direction: column; gap: 12px; align-items: flex-end; }
        }
      `}</style>

      <div className="page">

        {/* TOP BAR */}
        <div className="top-bar">
          <div>
            <div className="top-bar-title">
              <span className="dot" />
              Edit Profile
            </div>
            <div className="top-bar-sub">Update your professional information & availability</div>
          </div>
          <div className="btn-group">
            <button className="btn-ghost" onClick={() => setProfileData(EMPTY_PROFILE)}>
              Cancel
            </button>
            <button className={`btn-primary${saved ? " saving" : ""}`} onClick={handleSave}>
              {saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="content">

          {/* GENERAL INFO */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon">👤</div>
              <div>
                <div className="card-title">General Information</div>
                <div className="card-subtitle">Your public-facing identity</div>
              </div>
            </div>
            <div className="field-group cols-2">
              <div className="field">
                <label>Full Name</label>
                <input
                  placeholder="e.g. Kasun Perera"
                  value={profileData.fullName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleField("fullName", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Professional Headline</label>
                <input
                  placeholder="e.g. A/L Physics & Maths Tutor"
                  value={profileData.headline}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleField("headline", e.target.value)}
                />
              </div>
            </div>
            <div className="divider" />
            <div className="field-group">
              <div className="field">
                <label>Bio</label>
                <textarea
                  placeholder="Tell students about your experience, teaching style, and what makes you unique…"
                  value={profileData.bio}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleField("bio", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Contact Number</label>
                <input
                  placeholder="+94 77 000 0000"
                  value={profileData.contact}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleField("contact", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* MEDIA */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon">🖼️</div>
              <div>
                <div className="card-title">Media & Visuals</div>
                <div className="card-subtitle">Profile photo and banner image</div>
              </div>
            </div>
            <label
              className={`banner-drop${bannerDragOver ? " over" : ""}`}
              style={bannerBg ? { backgroundImage: `url(${bannerBg})` } : {}}
              onDragOver={(e: DragEvent<HTMLLabelElement>) => { e.preventDefault(); setBannerDragOver(true); }}
              onDragLeave={() => setBannerDragOver(false)}
              onDrop={handleBannerDrop}
            >
              {!bannerBg && (
                <>
                  <span className="banner-drop-icon">🏞️</span>
                  <span className="banner-drop-text">Click or drag to upload a banner image</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Recommended: 1200 × 300 px</span>
                </>
              )}
              <div className="banner-overlay">{bannerBg ? "Change Banner" : "Upload Banner"}</div>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleBannerUpload} />
            </label>
            <div className="avatar-row">
              <div className="avatar-wrap">
                <img src={profilePic} alt="Profile" className="avatar" />
                <label className="avatar-badge" title="Change photo">
                  ✎
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfilePicUpload} />
                </label>
              </div>
              <div className="avatar-info">
                <h4>{profileData.fullName || "Your Name"}</h4>
                <p>{profileData.headline || "Your headline will appear here"}</p>
                <div className="avatar-btns">
                  <label className="btn-sm-green">
                    Upload Photo
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfilePicUpload} />
                  </label>
                  <button
                    className="btn-sm-ghost-sm"
                    onClick={() => setProfilePic("https://randomuser.me/api/portraits/men/32.jpg")}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TEACHING DETAILS */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon">📚</div>
              <div>
                <div className="card-title">Teaching Details</div>
                <div className="card-subtitle">Subject, language & rate</div>
              </div>
            </div>
            <div className="field-group cols-2">
              <div className="field">
                <label>Primary Subject</label>
                <input
                  placeholder="e.g. Combined Mathematics"
                  value={profileData.subject}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleField("subject", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Hourly Rate (LKR)</label>
                <input
                  placeholder="e.g. 2500"
                  type="number"
                  value={profileData.rate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleField("rate", e.target.value)}
                />
              </div>
            </div>
            <div className="divider" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
                Teaching Medium
              </div>
              <div className="chips">
                {LANGUAGES.map((lang: string) => (
                  <button
                    key={lang}
                    className={`chip${selectedLangs.has(lang) ? " active" : ""}`}
                    onClick={() => toggleLang(lang)}
                  >
                    {selectedLangs.has(lang) ? "✓ " : ""}{lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SCHEDULE */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon">🗓️</div>
              <div>
                <div className="card-title">Availability Schedule</div>
                <div className="card-subtitle">Click cells to mark your available time slots</div>
              </div>
            </div>
            <div className="schedule-scroll">
              <div className="schedule-grid">
                <div className="sched-corner" />
                {DAYS.map((d: string) => (
                  <div key={d} className="sched-day">{d}</div>
                ))}
                {TIME_SLOTS.map((time: string) => (
                  <React.Fragment key={time}>
                    <div className="sched-time">{time}</div>
                    {DAYS.map((day: string) => {
                      const key = `${day}-${time}`;
                      return (
                        <div
                          key={key}
                          className={`sched-cell${selectedSlots.has(key) ? " selected" : ""}`}
                          onClick={() => toggleSlot(key)}
                          title={`${day} ${time}`}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="sched-legend">
              <div className="sched-legend-item">
                <div className="sched-dot dot-free" />
                Available
              </div>
              <div className="sched-legend-item">
                <div className="sched-dot dot-sel" />
                Selected ({selectedSlots.size} slot{selectedSlots.size !== 1 ? "s" : ""})
              </div>
              {selectedSlots.size > 0 && (
                <button
                  className="btn-sm-ghost-sm"
                  style={{ marginLeft: "auto", fontSize: 11, padding: "4px 12px" }}
                  onClick={() => setSelectedSlots(new Set())}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PAGE FOOTER */}
        <div className="page-footer">
          <span className="footer-hint">All changes are saved to your public profile.</span>
          <div className="btn-group">
            <button className="btn-ghost" onClick={() => setProfileData(EMPTY_PROFILE)}>
              Discard Changes
            </button>
            <button className={`btn-primary${saved ? " saving" : ""}`} onClick={handleSave}>
              {saved ? "✓ Profile Updated!" : "Update Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast${saved ? " show" : ""}`}>✓ Profile saved successfully</div>
    </>
  );
}