"use client";

import React from "react";

export interface ClassItem {
  id: number;
  title: string;
  subject: string;
  tutor: string;
  price: number;
  rating: number;
  image: string;
  availability: string[];
}

interface ClassCardProps {
  cls: ClassItem;
  index: number;
}

const BADGE_CONFIG = [
  { label: "Top Pick", className: "cc-badge teal" },
  { label: "Popular",  className: "cc-badge amber" },
  { label: "New",      className: "cc-badge rose"  },
];

export default function ClassCard({ cls, index }: ClassCardProps) {
  const badge = BADGE_CONFIG[index % 3];

  return (
    <>
      <style>{`
        .cc-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e2eeec;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.35s ease,
                      border-color 0.3s;
          cursor: pointer;
          position: relative;
          animation: cc-enter 0.5s ease both;
        }
        .cc-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 24px 60px rgba(13,148,136,0.18), 0 6px 20px rgba(0,0,0,0.08);
          border-color: rgba(13,148,136,0.35);
        }

        @keyframes cc-enter {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        /* staggered delays for up to 9 cards */
        .cc-card:nth-child(1) { animation-delay: 0.05s; }
        .cc-card:nth-child(2) { animation-delay: 0.10s; }
        .cc-card:nth-child(3) { animation-delay: 0.15s; }
        .cc-card:nth-child(4) { animation-delay: 0.20s; }
        .cc-card:nth-child(5) { animation-delay: 0.25s; }
        .cc-card:nth-child(6) { animation-delay: 0.30s; }
        .cc-card:nth-child(7) { animation-delay: 0.35s; }
        .cc-card:nth-child(8) { animation-delay: 0.40s; }
        .cc-card:nth-child(9) { animation-delay: 0.45s; }

        /* ── IMAGE ── */
        .cc-img-wrap { position: relative; height: 155px; overflow: hidden; }
        .cc-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .cc-card:hover .cc-img-wrap img { transform: scale(1.09); }

        .cc-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .cc-card:hover .cc-img-overlay { opacity: 1; }

        /* ── BADGE ── */
        .cc-badge {
          position: absolute; top: 10px; left: 10px; z-index: 2;
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 3px 10px; border-radius: 100px;
          backdrop-filter: blur(6px); color: white;
        }
        .cc-badge.teal  { background: rgba(13,148,136,0.88); }
        .cc-badge.amber { background: rgba(245,158,11,0.9);  }
        .cc-badge.rose  { background: rgba(244,63,94,0.88);  }

        /* ── WISHLIST ── */
        .cc-wish {
          position: absolute; top: 10px; right: 10px; z-index: 2;
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,0.88); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.2s;
          opacity: 0;
        }
        .cc-card:hover .cc-wish  { opacity: 1; }
        .cc-wish:hover            { transform: scale(1.25); background: #fff; }

        /* ── BODY ── */
        .cc-body { padding: 16px; }

        .cc-subject {
          font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; color: #0d9488; margin-bottom: 4px;
          font-family: 'Outfit', sans-serif;
        }

        .cc-title {
          font-family: 'Fraunces', serif;
          font-size: 0.98rem; font-weight: 700; color: #0c1015;
          line-height: 1.3; margin-bottom: 4px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .cc-tutor {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.78rem; color: #64748b; margin-bottom: 12px;
          font-family: 'Outfit', sans-serif;
        }

        .cc-divider { height: 1px; background: #e2eeec; margin: 10px 0; }

        .cc-footer {
          display: flex; align-items: center; justify-content: space-between;
        }

        .cc-price {
          font-family: 'Fraunces', serif;
          font-size: 1.05rem; font-weight: 700; color: #0d9488;
        }
        .cc-price span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.7rem; color: #64748b; font-weight: 500;
        }

        .cc-rating {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.78rem; font-weight: 700;
          background: #fef3c7; color: #92400e;
          padding: 3px 9px; border-radius: 100px;
          font-family: 'Outfit', sans-serif;
        }

        /* ── BUTTON ── */
        .cc-btn {
          width: 100%; margin-top: 12px; padding: 10px;
          border: none; border-radius: 11px;
          background: linear-gradient(135deg, #0d9488, #0f766e);
          color: white; font-family: 'Outfit', sans-serif;
          font-weight: 700; font-size: 0.84rem;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cc-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .cc-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13,148,136,0.4);
        }
        .cc-btn:hover::after { opacity: 1; }
        .cc-btn:active { transform: translateY(0) scale(0.98); }
      `}</style>

      <div className="cc-card">
        {/* Image */}
        <div className="cc-img-wrap">
          <img src={cls.image} alt={cls.title} />
          <div className="cc-img-overlay" />

          {/* Badge */}
          <span className={badge.className}>{badge.label}</span>

          {/* Wishlist */}
          <button
            className="cc-wish"
            aria-label="Save to wishlist"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="#e11d48"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="cc-body">
          <p className="cc-subject">{cls.subject}</p>
          <h3 className="cc-title">{cls.title}</h3>

          <p className="cc-tutor">
            <svg
              width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {cls.tutor}
          </p>

          <div className="cc-divider" />

          <div className="cc-footer">
            <div className="cc-price">
              Rs.&nbsp;{cls.price.toLocaleString()} <span>/ hr</span>
            </div>
            <div className="cc-rating">⭐ {cls.rating}</div>
          </div>

          <button className="cc-btn">Book a Session →</button>
        </div>
      </div>
    </>
  );
}