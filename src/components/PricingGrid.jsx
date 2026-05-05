import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const CATEGORIES_ORDER = [
  "consultation",
  "extraction",
  "implant",
  "greffe",
  "prothese",
  "pont",
  "couronne",
  "pivot",
  "divers",
  "materiaux",
];

const CAT_LABELS = {
  consultation: "Consultation & Imagerie",
  extraction:   "Extractions",
  implant:      "Chirurgie implantaire",
  greffe:       "Greffes & Régénération osseuse",
  prothese:     "Prothèses sur implants",
  pont:         "Ponts & All-on-X",
  couronne:     "Couronnes & Réhabilitation",
  pivot:        "Pivots",
  divers:       "Divers",
  materiaux:    "Matériaux chirurgicaux (C.M.)",
};

const CAT_ICONS = {
  consultation: "🔬",
  extraction:   "🦷",
  implant:      "🏥",
  greffe:       "🦴",
  prothese:     "👑",
  pont:         "🌉",
  couronne:     "💎",
  pivot:        "🔩",
  divers:       "🛡️",
  materiaux:    "🧪",
};

const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#0F1923",
    minHeight: "100vh",
    color: "#E2E8F0",
    padding: "32px",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 28,
  },
  title: { fontSize: 26, fontWeight: 700, color: "#F1F5F9", margin: 0, letterSpacing: "-0.5px" },
  subtitle: { fontSize: 13, color: "#475569", marginTop: 4 },
  searchBar: {
    display: "flex", gap: 12, marginBottom: 24, alignItems: "center", flexWrap: "wrap",
  },
  input: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#E2E8F0", padding: "10px 16px", fontSize: 14,
    outline: "none", flex: 1, minWidth: 220, fontFamily: "'DM Sans', sans-serif",
  },
  select: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#E2E8F0", padding: "10px 14px", fontSize: 14,
    outline: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  catBlock: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12, marginBottom: 16, overflow: "hidden",
  },
  catHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 20px", background: "rgba(255,255,255,0.04)",
    cursor: "pointer", userSelect: "none",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  catTitle: { fontSize: 14, fontWeight: 700, color: "#CBD5E1", display: "flex", gap: 10, alignItems: "center" },
  catCount: { fontSize: 12, color: "#475569", fontWeight: 500 },
  tableHead: {
    display: "grid", gridTemplateColumns: "1fr 130px 100px 1fr",
    padding: "8px 20px", gap: 12,
    fontSize: 11, fontWeight: 700, color: "#334155",
    letterSpacing: "0.8px", textTransform: "uppercase",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  tableRow: (editing) => ({
    display: "grid", gridTemplateColumns: "1fr 130px 100px 1fr",
    padding: "11px 20px", gap: 12, alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    background: editing ? "rgba(59,130,246,0.06)" : "transparent",
    transition: "background 0.15s",
  }),
  cellText: { fontSize: 13, color: "#CBD5E1" },
  cellCode: { fontSize: 12, color: "#64748B", fontFamily: "monospace" },
  cellPrice: { fontSize: 14, fontWeight: 700, color: "#F1F5F9" },
  cellNote: { fontSize: 12, color: "#475569", lineHeight: 1.4 },
  editInput: {
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(59,130,246,0.4)",
    borderRadius: 6, color: "#E2E8F0", padding: "5px 10px", fontSize: 13,
    outline: "none", width: "100%", fontFamily: "'DM Sans', sans-serif",
  },
  btn: (v = "primary") => ({
    background: v === "primary" ? "#3B82F6" : v === "success" ? "#22C55E" : "rgba(255,255,255,0.07)",
    color: v === "ghost" ? "#94A3B8" : "#fff",
    border: "none", borderRadius: 8, padding: "9px 18px",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
    display: "inline-flex", alignItems: "center", gap: 6,
  }),
  badge: {
    background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
    color: "#22C55E", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600,
  },
  notif: (t) => ({
    position: "fixed", bottom: 24, right: 24, zIndex: 9999,
    background: t === "success" ? "#22C55E" : "#EF4444",
    color: "#fff", padding: "12px 20px", borderRadius: 10,
    fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  }),
  statRow: {
    display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap",
  },
  statCard: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10, padding: "14px 20px", flex: 1, minWidth: 140,
  },
};

export default function PricingGrid({ session }) {
  const [tarifs, setTarifs]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("Toutes");
  const [editingId, setEditingId] = useState(null);
  const [editBuf, setEditBuf]     = useState({});
  const [expanded, setExpanded]   = useState({});
  const [saving, setSaving]       = useState(false);
  const [notif, setNotif]         = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("pricing_grid")
      .select("*")
      .order("categorie")
      .order("id");
    setTarifs(data || []);
    // Expand toutes les catégories par défaut
    const exp = {};
    (data || []).forEach(t => { exp[t.categorie] = true; });
    setExpanded(exp);
    setLoading(false);
  }

  function notify(msg, type = "success") {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);
  }

  function startEdit(t) {
    setEditingId(t.id);
    setEditBuf({ procedure: t.acte, code_acdq: t.code_acdq, prix_total: t.prix_total, notes: t.notes });
  }

  async function saveEdit(id) {
    setSaving(true);
    const { error } = await supabase.from("pricing_grid")
      .update({ ...editBuf, prix_total: parseFloat(editBuf.prix_total) || 0 })
      .eq("id", id);
    if (error) { notify("Erreur : " + error.message, "error"); }
    else {
      setTarifs(prev => prev.map(t => t.id === id ? { ...t, ...editBuf, prix_total: parseFloat(editBuf.prix_total) || 0 } : t));
      notify("Prix mis à jour ✓");
    }
    setEditingId(null);
    setSaving(false);
  }

  // Filtrage
  const filtered = tarifs.filter(t => {
    const matchSearch = !search ||
      t.acte.toLowerCase().includes(search.toLowerCase()) ||
      t.code_acdq?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "Toutes" || t.categorie === filterCat;
    return matchSearch && matchCat;
  });

  // Grouper par catégorie
  const grouped = {};
  CATEGORIES_ORDER.forEach(cat => { grouped[cat] = []; });
  filtered.forEach(t => {
    if (!grouped[t.categorie]) grouped[t.categorie] = [];
    grouped[t.categorie].push(t);
  });

  const cats = Object.keys(grouped).filter(c => grouped[c].length > 0 || filterCat === "Toutes");
  const totalActes = tarifs.filter(t => t.prix > 0).length;
  const maxPrix = Math.max(...tarifs.map(t => t.prix_total || 0));

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#475569" }}>Chargement de la grille tarifaire…</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .tarif-row:hover { background: rgba(255,255,255,0.03) !important; }
        .edit-btn { opacity: 0; transition: opacity 0.15s; }
        .tarif-row:hover .edit-btn { opacity: 1; }
        input:focus { border-color: rgba(59,130,246,0.6) !important; }
        select option { background: #1E293B; }
      `}</style>

      <div style={S.page}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>💰 Grille de tarifs</h1>
            <p style={S.subtitle}>Clinique Dr Chaussé · Dernière mise à jour : mai 2026 · Les services dentaires sont exempts de TPS/TVQ</p>
          </div>
          <span style={S.badge}>✓ Synchronisé depuis Notion</span>
        </div>

        {/* Stats */}
        <div style={S.statRow}>
          <div style={S.statCard}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 4 }}>ACTES TARIFÉS</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#F1F5F9" }}>{totalActes}</div>
          </div>
          <div style={S.statCard}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 4 }}>CATÉGORIES</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#F1F5F9" }}>{CATEGORIES_ORDER.length}</div>
          </div>
          <div style={S.statCard}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 4 }}>ACTE LE PLUS ÉLEVÉ</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#F1F5F9" }}>
              {maxPrix.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}
            </div>
          </div>
          <div style={S.statCard}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 4 }}>RÉSULTATS</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: filtered.length < tarifs.length ? "#F59E0B" : "#F1F5F9" }}>
              {filtered.length}
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div style={S.searchBar}>
          <input
            style={S.input}
            placeholder="🔍  Rechercher un acte ou un code ACDQ…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select style={S.select} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="Toutes">Toutes les catégories</option>
            {CATEGORIES_ORDER.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {CAT_LABELS[c]}</option>)}
          </select>
          {(search || filterCat !== "Toutes") && (
            <button style={S.btn("ghost")} onClick={() => { setSearch(""); setFilterCat("Toutes"); }}>
              ✕ Effacer
            </button>
          )}
        </div>

        {/* Catégories */}
        {CATEGORIES_ORDER.map(cat => {
          const rows = grouped[cat] || [];
          if (rows.length === 0) return null;
          const isExpanded = expanded[cat] !== false;

          return (
            <div key={CAT_LABELS[cat] || cat} style={S.catBlock}>
              <div style={S.catHeader} onClick={() => setExpanded(p => ({ ...p, [cat]: !isExpanded }))}>
                <span style={S.catTitle}>
                  <span>{CAT_ICONS[cat] || "📋"}</span>
                  {CAT_LABELS[cat] || cat}
                </span>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={S.catCount}>{rows.length} acte{rows.length > 1 ? "s" : ""}</span>
                  <span style={{ color: "#475569", fontSize: 12 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {isExpanded && (
                <>
                  <div style={S.tableHead}>
                    <span>Procédure</span>
                    <span>Code ACDQ</span>
                    <span style={{ textAlign: "right" }}>Prix</span>
                    <span>Notes</span>
                  </div>
                  {rows.map(t => {
                    const isEditing = editingId === t.id;
                    return (
                      <div key={t.id} className="tarif-row" style={S.tableRow(isEditing)}>
                        {/* Procédure */}
                        <div>
                          {isEditing ? (
                            <input className="edit-input" style={{ ...S.editInput, width: "95%" }}
                              value={editBuf.acte}
                              onChange={e => setEditBuf(p => ({ ...p, acte: e.target.value }))} />
                          ) : (
                            <span style={S.cellText}>{t.acte}</span>
                          )}
                        </div>

                        {/* Code */}
                        <div>
                          {isEditing ? (
                            <input className="edit-input" style={S.editInput}
                              value={editBuf.code_acdq || ""}
                              onChange={e => setEditBuf(p => ({ ...p, code_acdq: e.target.value }))} />
                          ) : (
                            <span style={S.cellCode}>{t.code_acdq || "—"}</span>
                          )}
                        </div>

                        {/* Prix */}
                        <div style={{ textAlign: "right" }}>
                          {isEditing ? (
                            <input className="edit-input" type="number" style={{ ...S.editInput, textAlign: "right", width: 90 }}
                              value={editBuf.prix_total}
                              onChange={e => setEditBuf(p => ({ ...p, prix_total: e.target.value }))} />
                          ) : (
                            <span style={{ ...S.cellPrice, color: t.prix_total === 0 ? "#475569" : "#F1F5F9" }}>
                              {t.prix_total === 0 ? "Inclus" : t.prix_total.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}
                            </span>
                          )}
                        </div>

                        {/* Notes + actions */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                          {isEditing ? (
                            <>
                              <input className="edit-input" style={{ ...S.editInput, flex: 1 }}
                                value={editBuf.notes || ""}
                                onChange={e => setEditBuf(p => ({ ...p, notes: e.target.value }))} />
                              <button style={{ ...S.btn("success"), padding: "5px 12px", fontSize: 12 }}
                                onClick={() => saveEdit(t.id)} disabled={saving}>✓</button>
                              <button style={{ ...S.btn("ghost"), padding: "5px 10px", fontSize: 12 }}
                                onClick={() => setEditingId(null)}>✕</button>
                            </>
                          ) : (
                            <>
                              <span style={S.cellNote}>{t.notes || ""}</span>
                              <button className="edit-btn" style={{ ...S.btn("ghost"), padding: "4px 10px", fontSize: 12, flexShrink: 0 }}
                                onClick={() => startEdit(t)}>✏️</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}

        {/* Modalités de paiement */}
        <div style={{ ...S.catBlock, marginTop: 8 }}>
          <div style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#CBD5E1", marginBottom: 10 }}>💳 Modalités de paiement</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["Acompte à la signature", "Avant chirurgie", "À la pose prothèse finale", "Comptant · Chèque · Carte · Financement"].map(m => (
                <span key={m} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#94A3B8" }}>{m}</span>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#334155", marginTop: 12 }}>⚠️ Les services dentaires sont exempts de TPS/TVQ</p>
          </div>
        </div>
      </div>

      {notif && <div style={S.notif(notif.type)}>{notif.msg}</div>}
    </>
  );
}
