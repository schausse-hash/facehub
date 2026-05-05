import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

// ── PROTOCOLES PAR GABARIT ─────────────────────────────────────────────────
const PROTOCOLES = {
  posterieur: {
    label: "Implant Postérieur (≥15, ≥25)",
    phases: [
      {
        titre: "Chirurgie implantaire",
        etapes: [
          "Pose de l'implant",
          "Sutures et soins post-opératoires remis",
          "Prescription antibiotiques / anti-inflammatoires",
        ],
      },
      {
        titre: "Ostéo-intégration (3 mois)",
        etapes: [
          "Contrôle cicatrisation (2 semaines)",
          "Validation radiologique à 3 mois",
        ],
      },
      {
        titre: "Prothèse définitive",
        etapes: [
          "Empreinte sur implant",
          "Essayage couronne",
          "Mise en bouche couronne définitive",
          "Contrôle occlusion",
        ],
      },
    ],
  },
  anterieur: {
    label: "Implant Antérieur (11–14, 21–24)",
    phases: [
      {
        titre: "Chirurgie implantaire",
        etapes: [
          "Pose de l'implant",
          "Sutures et soins post-opératoires remis",
          "Prescription antibiotiques / anti-inflammatoires",
        ],
      },
      {
        titre: "Ostéo-intégration (3–4 mois)",
        etapes: [
          "Contrôle cicatrisation (2 semaines)",
          "Validation radiologique",
        ],
      },
      {
        titre: "Couronne de transition",
        etapes: [
          "Dégagement de l'implant",
          "Pose couronne temporaire",
          "Suivi formation papille gingivale",
        ],
      },
      {
        titre: "Prothèse définitive",
        etapes: [
          "Empreinte finale sur implant",
          "Essayage couronne définitive",
          "Mise en bouche et validation esthétique",
          "Contrôle occlusion",
        ],
      },
    ],
  },
  allon: {
    label: "All-on-X (4 / 6 / 8)",
    phases: [
      {
        titre: "Planification pré-chirurgicale",
        etapes: [
          "Scan CBCT double arcade",
          "Photogrammétrie",
          "Plan prothétique validé",
          "Fabrication guide chirurgical",
        ],
      },
      {
        titre: "Chirurgie implantaire",
        etapes: [
          "Extractions résiduelles si requis",
          "Pose des implants (4 / 6 / 8)",
          "Mise en place prothèse transitoire PMMA",
          "Validation occlusion immédiate",
        ],
      },
      {
        titre: "Phase transitoire (4–6 mois)",
        etapes: [
          "Contrôle 2 semaines",
          "Contrôle 6 semaines",
          "Validation radiologique à 4–6 mois",
        ],
      },
      {
        titre: "Prothèse définitive",
        etapes: [
          "Empreintes finales",
          "Essayage structure zircone",
          "Mise en bouche prothèse définitive",
          "Instructions hygiène spécialisée",
        ],
      },
    ],
  },
  sinuslift: {
    label: "Sinus Lift + Implant",
    phases: [
      {
        titre: "Élévation sinusale",
        etapes: [
          "Chirurgie sinus lift avec greffe osseuse",
          "Soins post-opératoires remis",
          "Prescription antibiotiques / anti-inflammatoires",
        ],
      },
      {
        titre: "Cicatrisation osseuse (4–6 mois)",
        etapes: [
          "Contrôle cicatrisation (2 semaines)",
          "Scan CBCT de contrôle",
          "Validation volume osseux",
        ],
      },
      {
        titre: "Chirurgie implantaire",
        etapes: [
          "Pose de l'implant",
          "Sutures et soins",
        ],
      },
      {
        titre: "Ostéo-intégration (3 mois)",
        etapes: ["Validation radiologique"],
      },
      {
        titre: "Prothèse définitive",
        etapes: [
          "Empreinte sur implant",
          "Mise en bouche couronne définitive",
          "Contrôle occlusion",
        ],
      },
    ],
  },
};

const STATUTS = [
  { value: "consultation_initiale", label: "Consultation initiale", color: "#6B7280" },
  { value: "plan_traitement", label: "Plan de traitement", color: "#3B82F6" },
  { value: "en_attente_reponse", label: "En attente réponse", color: "#F59E0B" },
  { value: "chirurgie_programmee", label: "Chirurgie programmée", color: "#8B5CF6" },
  { value: "post_operatoire", label: "Post-opératoire", color: "#EC4899" },
  { value: "fabrication_labo", label: "Fabrication labo", color: "#14B8A6" },
  { value: "prothese_finale", label: "Prothèse finale", color: "#F97316" },
  { value: "termine", label: "Terminé", color: "#22C55E" },
  { value: "annule", label: "Annulé", color: "#EF4444" },
];

// ── STYLES ─────────────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
    zIndex: 1000, display: "flex", alignItems: "flex-start",
    justifyContent: "flex-end", fontFamily: "'DM Sans', sans-serif",
  },
  panel: {
    width: "min(780px, 100vw)", height: "100vh", background: "#0F1923",
    overflowY: "auto", display: "flex", flexDirection: "column",
    borderLeft: "1px solid rgba(255,255,255,0.07)",
  },
  header: {
    background: "linear-gradient(135deg, #0F2744 0%, #0F1923 100%)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    padding: "28px 32px 24px",
    position: "sticky", top: 0, zIndex: 10,
  },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  patientName: { fontSize: 26, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.5px", margin: 0 },
  closeBtn: {
    background: "rgba(255,255,255,0.08)", border: "none", color: "#94A3B8",
    width: 36, height: 36, borderRadius: 8, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, flexShrink: 0, transition: "all 0.2s",
  },
  metaRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  badge: (color) => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    background: color + "22", border: "1px solid " + color + "44",
    color: color, borderRadius: 20, padding: "4px 12px",
    fontSize: 12, fontWeight: 600, letterSpacing: "0.3px",
  }),
  badgeGray: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#94A3B8", borderRadius: 20, padding: "4px 12px", fontSize: 12,
  },
  content: { padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 },
  section: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12, overflow: "hidden",
  },
  sectionHead: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
  },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#CBD5E1", letterSpacing: "0.8px", textTransform: "uppercase" },
  sectionBody: { padding: "16px 18px" },
  phase: {
    marginBottom: 16, borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
  },
  phaseHead: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 14px", background: "rgba(255,255,255,0.04)",
    cursor: "pointer",
  },
  phaseTitle: { fontSize: 13, fontWeight: 600, color: "#E2E8F0" },
  phaseProgress: { fontSize: 11, color: "#64748B", fontWeight: 500 },
  progressBar: (pct) => ({
    height: 3, background: "rgba(255,255,255,0.06)",
    borderRadius: 2, margin: "0 14px 0",
    position: "relative", overflow: "hidden",
  }),
  progressFill: (pct) => ({
    position: "absolute", left: 0, top: 0, height: "100%",
    width: pct + "%",
    background: pct === 100 ? "#22C55E" : "linear-gradient(90deg, #3B82F6, #8B5CF6)",
    borderRadius: 2, transition: "width 0.4s ease",
  }),
  stepRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 14px", borderTop: "1px solid rgba(255,255,255,0.04)",
    cursor: "pointer", transition: "background 0.15s",
  },
  checkbox: (checked) => ({
    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
    border: checked ? "2px solid #22C55E" : "2px solid rgba(255,255,255,0.2)",
    background: checked ? "#22C55E" : "transparent",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  }),
  stepLabel: (checked) => ({
    fontSize: 13, color: checked ? "#64748B" : "#CBD5E1",
    textDecoration: checked ? "line-through" : "none",
    transition: "all 0.2s",
  }),
  btn: (variant = "primary") => ({
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: "pointer", border: "none", transition: "all 0.2s",
    background: variant === "primary" ? "#3B82F6"
      : variant === "success" ? "#22C55E"
      : variant === "danger" ? "#EF4444"
      : "rgba(255,255,255,0.08)",
    color: variant === "ghost" ? "#94A3B8" : "#fff",
  }),
  select: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, color: "#E2E8F0", padding: "8px 12px", fontSize: 13,
    cursor: "pointer", outline: "none",
  },
  planLine: {
    display: "grid", gridTemplateColumns: "1fr 120px 90px 90px",
    gap: 8, padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  planHeader: {
    display: "grid", gridTemplateColumns: "1fr 120px 90px 90px",
    gap: 8, padding: "8px 14px",
    fontSize: 11, fontWeight: 700, color: "#475569",
    letterSpacing: "0.8px", textTransform: "uppercase",
  },
  planTotal: {
    display: "flex", justifyContent: "flex-end", alignItems: "center",
    gap: 12, padding: "14px 14px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 4,
  },
  input: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6, color: "#E2E8F0", padding: "6px 10px", fontSize: 13,
    outline: "none", width: "100%",
  },
  toothGrid: {
    display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6,
    marginBottom: 8,
  },
  toothBtn: (active) => ({
    background: active ? "#3B82F6" : "rgba(255,255,255,0.06)",
    border: active ? "2px solid #3B82F6" : "2px solid transparent",
    borderRadius: 6, color: active ? "#fff" : "#64748B",
    padding: "6px 4px", fontSize: 11, fontWeight: 600,
    cursor: "pointer", textAlign: "center", transition: "all 0.15s",
  }),
  notif: (type) => ({
    position: "fixed", bottom: 24, right: 24, zIndex: 2000,
    background: type === "success" ? "#22C55E" : "#EF4444",
    color: "#fff", padding: "12px 20px", borderRadius: 10,
    fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    animation: "slideUp 0.3s ease",
  }),
};

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────
export default function ImplantCaseDetail({ caseId, onClose, onUpdated }) {
  const [cas, setCas]           = useState(null);
  const [phases, setPhases]     = useState([]);
  const [planLines, setPlanLines] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [notif, setNotif]       = useState(null);
  const [activeTab, setActiveTab] = useState("suivi"); // suivi | plan | info
  const [protocoleKey, setProtocoleKey] = useState("");
  const [newStatut, setNewStatut] = useState("");
  const [expandedPhases, setExpandedPhases] = useState({});

  // ── CHARGEMENT ──────────────────────────────────────────────────────────
  useEffect(() => { if (caseId) load(); }, [caseId]);

  async function load() {
    setLoading(true);
    try {
      // Cas principal
      const { data: casData } = await supabase
        .from("implant_cases")
        .select(`*, patients(id, first_name, last_name, date_of_birth), clinics(name)`)
        .eq("id", caseId)
        .single();

      // Phases + étapes
      const { data: phasesData } = await supabase
        .from("case_phases")
        .select(`*, case_steps(*)`)
        .eq("case_id", caseId)
        .order("position", { ascending: true });

      // Plan de traitement
      const { data: planData } = await supabase
        .from("treatment_plans")
        .select(`*, treatment_lines(*)`)
        .eq("case_id", caseId)
        .maybeSingle();

      setCas(casData);
      setNewStatut(casData?.status || "");
      setPhases(phasesData || []);
      setPlanLines(planData?.treatment_lines || []);

      // Expand toutes les phases par défaut
      const expanded = {};
      (phasesData || []).forEach(p => { expanded[p.id] = true; });
      setExpandedPhases(expanded);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  // ── NOTIFICATION ────────────────────────────────────────────────────────
  function notify(msg, type = "success") {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);
  }

  // ── APPLIQUER PROTOCOLE ─────────────────────────────────────────────────
  async function appliquerProtocole(key) {
    if (!key) return;
    const proto = PROTOCOLES[key];
    if (!confirm(`Appliquer le protocole "${proto.label}" ? Les phases existantes seront remplacées.`)) return;
    setSaving(true);

    // Supprimer anciennes phases/étapes
    await supabase.from("case_steps").delete().in(
      "phase_id",
      phases.map(p => p.id)
    );
    await supabase.from("case_phases").delete().eq("case_id", caseId);

    // Créer nouvelles phases
    for (let i = 0; i < proto.phases.length; i++) {
      const phase = proto.phases[i];
      const { data: newPhase } = await supabase
        .from("case_phases")
        .insert({ case_id: caseId, titre: phase.titre, position: i + 1, completed: false })
        .select().single();

      for (let j = 0; j < phase.etapes.length; j++) {
        await supabase.from("case_steps").insert({
          phase_id: newPhase.id,
          titre: phase.etapes[j],
          position: j + 1,
          completed: false,
        });
      }
    }

    await load();
    setProtocoleKey("");
    notify(`Protocole "${proto.label}" appliqué ✓`);
    setSaving(false);
  }

  // ── COCHER / DÉCOCHER UNE ÉTAPE ─────────────────────────────────────────
  async function toggleStep(step) {
    const newVal = !step.completed;
    await supabase.from("case_steps").update({ completed: newVal }).eq("id", step.id);

    setPhases(prev => prev.map(p => ({
      ...p,
      case_steps: p.case_steps.map(s =>
        s.id === step.id ? { ...s, completed: newVal } : s
      ),
    })));
  }

  // ── CHANGER STATUT ───────────────────────────────────────────────────────
  async function changerStatut() {
    if (!newStatut || newStatut === cas.status) return;
    await supabase.from("implant_cases").update({ status: newStatut }).eq("id", caseId);
    setCas(prev => ({ ...prev, status: newStatut }));
    onUpdated && onUpdated();
    notify("Statut mis à jour ✓");
  }

  // ── PLAN DE TRAITEMENT ───────────────────────────────────────────────────
  function totalPlan() {
    return planLines.reduce((s, l) => s + (parseFloat(l.montant) || 0), 0);
  }

  async function ajouterLigne() {
    // S'assurer qu'un treatment_plan existe
    let planId;
    const { data: existing } = await supabase
      .from("treatment_plans")
      .select("id").eq("case_id", caseId).maybeSingle();

    if (existing) {
      planId = existing.id;
    } else {
      const { data: newPlan } = await supabase
        .from("treatment_plans")
        .insert({ case_id: caseId, status: "draft" })
        .select().single();
      planId = newPlan.id;
    }

    const { data: newLine } = await supabase
      .from("treatment_lines")
      .insert({ plan_id: planId, description: "Nouvel acte", code_acdq: "", montant: 0, position: planLines.length + 1 })
      .select().single();

    setPlanLines(prev => [...prev, newLine]);
  }

  async function updateLigne(id, field, value) {
    setPlanLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
    await supabase.from("treatment_lines").update({ [field]: value }).eq("id", id);
  }

  async function supprimerLigne(id) {
    await supabase.from("treatment_lines").delete().eq("id", id);
    setPlanLines(prev => prev.filter(l => l.id !== id));
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────
  function getStatut(val) {
    return STATUTS.find(s => s.value === val) || STATUTS[0];
  }

  function nomPatient() {
    if (!cas?.patients) return "Patient inconnu";
    return `${cas.patients.first_name} ${cas.patients.last_name}`;
  }

  function progressPhase(phase) {
    const steps = phase.case_steps || [];
    if (!steps.length) return 0;
    return Math.round((steps.filter(s => s.completed).length / steps.length) * 100);
  }

  function progressTotal() {
    const allSteps = phases.flatMap(p => p.case_steps || []);
    if (!allSteps.length) return 0;
    return Math.round((allSteps.filter(s => s.completed).length / allSteps.length) * 100);
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={S.overlay}>
      <div style={S.panel}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#475569", fontSize: 14 }}>
          Chargement…
        </div>
      </div>
    </div>
  );

  const statut = getStatut(cas?.status);
  const pTotal = progressTotal();

  const TEETH_UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
  const TEETH_LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
  const activeDents = (cas?.dents || []).map(Number);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .step-row:hover { background: rgba(255,255,255,0.04) !important; }
        .close-btn:hover { background: rgba(255,255,255,0.15) !important; color: #fff !important; }
        .tab-btn { border: none; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .tab-btn.active { background: #3B82F6; color: #fff; }
        .tab-btn.inactive { background: transparent; color: #64748B; }
        .tab-btn.inactive:hover { color: #94A3B8; background: rgba(255,255,255,0.05); }
        input:focus, select:focus { border-color: rgba(59,130,246,0.5) !important; }
        .plan-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; color: #E2E8F0; padding: 5px 8px; font-size: 12px; font-family: 'DM Sans', sans-serif; outline: none; }
        .plan-input:focus { border-color: rgba(59,130,246,0.5); }
        .del-btn { background: none; border: none; color: #475569; cursor: pointer; font-size: 16px; padding: 2px 6px; border-radius: 4px; transition: color 0.15s; }
        .del-btn:hover { color: #EF4444; }
      `}</style>

      <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={S.panel}>

          {/* ── HEADER ── */}
          <div style={S.header}>
            <div style={S.headerTop}>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 11, color: "#475569", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
                  Fiche de cas implantaire
                </p>
                <h2 style={S.patientName}>{nomPatient()}</h2>
              </div>
              <button className="close-btn" style={S.closeBtn} onClick={onClose}>✕</button>
            </div>

            <div style={S.metaRow}>
              <span style={S.badge(statut.color)}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: statut.color, display: "inline-block" }} />
                {statut.label}
              </span>
              {cas?.clinics?.name && <span style={S.badgeGray}>🏥 {cas.clinics.name}</span>}
              {activeDents.length > 0 && (
                <span style={S.badgeGray}>🦷 {activeDents.join(", ")}</span>
              )}
              {cas?.type_traitement && <span style={S.badgeGray}>{cas.type_traitement}</span>}
            </div>

            {/* Barre de progression globale */}
            {phases.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>PROGRESSION GLOBALE</span>
                  <span style={{ fontSize: 11, color: pTotal === 100 ? "#22C55E" : "#3B82F6", fontWeight: 700 }}>{pTotal}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: pTotal + "%", background: pTotal === 100 ? "#22C55E" : "linear-gradient(90deg,#3B82F6,#8B5CF6)", borderRadius: 3, transition: "width 0.4s" }} />
                </div>
              </div>
            )}

            {/* Onglets */}
            <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
              {[["suivi","📋 Suivi"], ["plan","💰 Plan"], ["info","ℹ️ Infos"]].map(([key, label]) => (
                <button key={key} className={`tab-btn ${activeTab === key ? "active" : "inactive"}`}
                  onClick={() => setActiveTab(key)}>{label}</button>
              ))}
            </div>
          </div>

          {/* ── CONTENU ── */}
          <div style={S.content}>

            {/* ════ TAB : SUIVI ════ */}
            {activeTab === "suivi" && (
              <>
                {/* Protocole */}
                <div style={S.section}>
                  <div style={S.sectionHead}>
                    <span style={S.sectionTitle}>Protocole</span>
                  </div>
                  <div style={{ ...S.sectionBody, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <select style={{ ...S.select, flex: 1 }} value={protocoleKey}
                      onChange={e => setProtocoleKey(e.target.value)}>
                      <option value="">— Choisir un gabarit de protocole —</option>
                      {Object.entries(PROTOCOLES).map(([k, p]) => (
                        <option key={k} value={k}>{p.label}</option>
                      ))}
                    </select>
                    <button style={S.btn("primary")} onClick={() => appliquerProtocole(protocoleKey)}
                      disabled={!protocoleKey || saving}>
                      {saving ? "…" : "Appliquer"}
                    </button>
                  </div>
                </div>

                {/* Phases */}
                {phases.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569", fontSize: 13 }}>
                    Aucune phase — appliquer un protocole ci-dessus pour commencer.
                  </div>
                ) : (
                  <div style={S.section}>
                    <div style={S.sectionHead}>
                      <span style={S.sectionTitle}>Étapes de traitement</span>
                      <span style={{ fontSize: 12, color: "#475569" }}>
                        {phases.flatMap(p => p.case_steps || []).filter(s => s.completed).length} /&nbsp;
                        {phases.flatMap(p => p.case_steps || []).length} complétées
                      </span>
                    </div>
                    <div style={{ padding: "12px 8px" }}>
                      {phases.map((phase) => {
                        const pct = progressPhase(phase);
                        const expanded = expandedPhases[phase.id] !== false;
                        return (
                          <div key={phase.id} style={S.phase}>
                            <div style={S.phaseHead}
                              onClick={() => setExpandedPhases(prev => ({ ...prev, [phase.id]: !expanded }))}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{
                                  width: 22, height: 22, borderRadius: "50%",
                                  background: pct === 100 ? "#22C55E22" : "rgba(255,255,255,0.06)",
                                  border: pct === 100 ? "2px solid #22C55E" : "2px solid rgba(255,255,255,0.12)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 10, color: pct === 100 ? "#22C55E" : "#475569",
                                }}>
                                  {pct === 100 ? "✓" : ""}
                                </span>
                                <span style={S.phaseTitle}>{phase.titre}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={S.phaseProgress}>{pct}%</span>
                                <span style={{ color: "#475569", fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
                              </div>
                            </div>
                            <div style={{ height: 3, background: "rgba(255,255,255,0.05)", margin: "0" }}>
                              <div style={{ height: "100%", width: pct + "%", background: pct === 100 ? "#22C55E" : "linear-gradient(90deg,#3B82F6,#8B5CF6)", transition: "width 0.4s" }} />
                            </div>
                            {expanded && (phase.case_steps || []).map(step => (
                              <div key={step.id} className="step-row" style={S.stepRow}
                                onClick={() => toggleStep(step)}>
                                <div style={S.checkbox(step.completed)}>
                                  {step.completed && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                                </div>
                                <span style={S.stepLabel(step.completed)}>{step.titre}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ════ TAB : PLAN DE TRAITEMENT ════ */}
            {activeTab === "plan" && (
              <div style={S.section}>
                <div style={S.sectionHead}>
                  <span style={S.sectionTitle}>Plan de traitement</span>
                  <button style={S.btn("ghost")} onClick={ajouterLigne}>+ Ajouter acte</button>
                </div>
                <div>
                  {planLines.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "36px 20px", color: "#475569", fontSize: 13 }}>
                      Aucun acte — cliquer "+ Ajouter acte" pour commencer.
                    </div>
                  ) : (
                    <>
                      <div style={S.planHeader}>
                        <span>Description</span>
                        <span>Code ACDQ</span>
                        <span style={{ textAlign: "right" }}>Honoraires</span>
                        <span />
                      </div>
                      {planLines.map(line => (
                        <div key={line.id} style={S.planLine}>
                          <input className="plan-input" style={{ width: "100%" }}
                            value={line.description || ""}
                            onChange={e => updateLigne(line.id, "description", e.target.value)}
                            placeholder="Description de l'acte" />
                          <input className="plan-input"
                            value={line.code_acdq || ""}
                            onChange={e => updateLigne(line.id, "code_acdq", e.target.value)}
                            placeholder="Code" />
                          <input className="plan-input" type="number" style={{ textAlign: "right" }}
                            value={line.montant || ""}
                            onChange={e => updateLigne(line.id, "montant", e.target.value)}
                            placeholder="0" />
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button className="del-btn" onClick={() => supprimerLigne(line.id)}>×</button>
                          </div>
                        </div>
                      ))}
                      <div style={S.planTotal}>
                        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>TOTAL ESTIMÉ</span>
                        <span style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.5px" }}>
                          {totalPlan().toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div style={{ padding: "12px 14px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button style={S.btn("ghost")}>🖨 Imprimer le plan</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ════ TAB : INFOS ════ */}
            {activeTab === "info" && (
              <>
                {/* Changer statut */}
                <div style={S.section}>
                  <div style={S.sectionHead}>
                    <span style={S.sectionTitle}>Statut du cas</span>
                  </div>
                  <div style={{ ...S.sectionBody, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <select style={{ ...S.select, flex: 1 }} value={newStatut}
                      onChange={e => setNewStatut(e.target.value)}>
                      {STATUTS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button style={S.btn(newStatut === "termine" ? "success" : newStatut === "annule" ? "danger" : "primary")}
                      onClick={changerStatut} disabled={newStatut === cas?.status}>
                      Mettre à jour
                    </button>
                  </div>
                </div>

                {/* Dents */}
                <div style={S.section}>
                  <div style={S.sectionHead}>
                    <span style={S.sectionTitle}>Sites implantaires</span>
                  </div>
                  <div style={S.sectionBody}>
                    <p style={{ fontSize: 11, color: "#475569", marginBottom: 8, fontWeight: 600 }}>MAXILLAIRE (haut)</p>
                    <div style={S.toothGrid}>
                      {TEETH_UPPER.map(t => (
                        <div key={t} style={S.toothBtn(activeDents.includes(t))}>{t}</div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: "#475569", marginBottom: 8, marginTop: 12, fontWeight: 600 }}>MANDIBULE (bas)</p>
                    <div style={S.toothGrid}>
                      {TEETH_LOWER.map(t => (
                        <div key={t} style={S.toothBtn(activeDents.includes(t))}>{t}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div style={S.section}>
                  <div style={S.sectionHead}>
                    <span style={S.sectionTitle}>Dates</span>
                  </div>
                  <div style={{ ...S.sectionBody, display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Consultation", cas?.date_consultation],
                      ["Prochain RDV", cas?.date_rdv],
                      ["Chirurgie", cas?.date_chirurgie],
                    ].map(([label, val]) => val && (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "#64748B" }}>{label}</span>
                        <span style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600 }}>
                          {new Date(val).toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {cas?.notes_cliniques && (
                  <div style={S.section}>
                    <div style={S.sectionHead}>
                      <span style={S.sectionTitle}>Notes cliniques</span>
                    </div>
                    <div style={S.sectionBody}>
                      <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>
                        {cas.notes_cliniques}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {notif && (
        <div style={S.notif(notif.type)}>{notif.msg}</div>
      )}
    </>
  );
}
