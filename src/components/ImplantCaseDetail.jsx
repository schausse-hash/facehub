import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const PROTOCOLES = {
  posterieur: {
    label: "Implant Postérieur (≥15, ≥25)",
    phases: [
      { titre: "Chirurgie implantaire", etapes: ["Pose de l'implant (79951 + 99555) — 2 791 $","Sutures et soins post-opératoires remis","Prescription antibiotiques / anti-inflammatoires"] },
      { titre: "Ostéo-intégration (3 mois)", etapes: ["Contrôle cicatrisation (2 semaines)","Validation radiologique à 3 mois"] },
      { titre: "Prothèse définitive", etapes: ["Empreinte sur implant","Pose couronne définitive (27343) — 2 350 $","Contrôle occlusion"] },
    ],
  },
  anterieur: {
    label: "Implant Antérieur (11–14, 21–24)",
    phases: [
      { titre: "Chirurgie implantaire", etapes: ["Pose de l'implant (79951 + 99555) — 2 791 $","Sutures et soins post-opératoires remis","Prescription antibiotiques / anti-inflammatoires"] },
      { titre: "Ostéo-intégration (3–4 mois)", etapes: ["Contrôle cicatrisation (2 semaines)","Validation radiologique"] },
      { titre: "Couronne de transition (27345) — 797 $", etapes: ["Dégagement de l'implant","Pose couronne temporaire","Suivi formation papille gingivale"] },
      { titre: "Prothèse définitive", etapes: ["Empreinte finale sur implant","Mise en bouche et validation esthétique","Contrôle occlusion"] },
    ],
  },
  allon: {
    label: "All-on-X (4 / 6 / 8)",
    phases: [
      { titre: "Planification pré-chirurgicale", etapes: ["Scan CBCT double arcade","Photogrammétrie","Plan prothétique validé","Fabrication guide chirurgical"] },
      { titre: "Chirurgie implantaire", etapes: ["Extractions résiduelles si requis","Pose des implants","Mise en place prothèse transitoire PMMA","Validation occlusion immédiate"] },
      { titre: "Phase transitoire (4–6 mois)", etapes: ["Contrôle 2 semaines","Contrôle 6 semaines","Validation radiologique"] },
      { titre: "Prothèse définitive", etapes: ["Empreintes finales","Essayage structure zircone","Mise en bouche prothèse définitive","Instructions hygiène spécialisée"] },
    ],
  },
  sinuslift: {
    label: "Sinus Lift + Implant",
    phases: [
      { titre: "Élévation sinusale (79811) — 2 600 $", etapes: ["Chirurgie sinus lift avec greffe osseuse","Soins post-opératoires remis","Prescription antibiotiques / anti-inflammatoires"] },
      { titre: "Cicatrisation osseuse (4–6 mois)", etapes: ["Contrôle cicatrisation (2 semaines)","Scan CBCT de contrôle","Validation volume osseux"] },
      { titre: "Chirurgie implantaire", etapes: ["Pose de l'implant (79951 + 99555) — 2 791 $","Sutures et soins"] },
      { titre: "Ostéo-intégration (3 mois)", etapes: ["Validation radiologique"] },
      { titre: "Prothèse définitive", etapes: ["Empreinte sur implant","Pose couronne définitive (27343) — 2 350 $","Contrôle occlusion"] },
    ],
  },
};

const STATUTS = [
  { value:"consultation_initiale", label:"Consultation initiale", color:"#6B7280" },
  { value:"plan_traitement",       label:"Plan de traitement",    color:"#3B82F6" },
  { value:"en_attente_reponse",    label:"En attente réponse",    color:"#F59E0B" },
  { value:"chirurgie_programmee",  label:"Chirurgie programmée",  color:"#8B5CF6" },
  { value:"post_operatoire",       label:"Post-opératoire",       color:"#EC4899" },
  { value:"fabrication_labo",      label:"Fabrication labo",      color:"#14B8A6" },
  { value:"prothese_finale",       label:"Prothèse finale",       color:"#F97316" },
  { value:"termine",               label:"Terminé",               color:"#22C55E" },
  { value:"annule",                label:"Annulé",                color:"#EF4444" },
];

const S = {
  overlay: { position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",fontFamily:"'DM Sans',sans-serif" },
  panel:   { width:"min(780px,100vw)",height:"100vh",background:"#0F1923",overflowY:"auto",borderLeft:"1px solid rgba(255,255,255,0.07)" },
  header:  { background:"linear-gradient(135deg,#0F2744,#0F1923)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"28px 32px 20px",position:"sticky",top:0,zIndex:10 },
  content: { padding:"24px 32px",display:"flex",flexDirection:"column",gap:20 },
  section: { background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden" },
  secHead: { display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.02)" },
  secTitle:{ fontSize:12,fontWeight:700,color:"#CBD5E1",letterSpacing:"0.8px",textTransform:"uppercase" },
  secBody: { padding:"16px 18px" },
  badge:   (c)=>({ display:"inline-flex",alignItems:"center",gap:6,background:c+"22",border:"1px solid "+c+"44",color:c,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600 }),
  badgeGray:{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"#94A3B8",borderRadius:20,padding:"4px 12px",fontSize:12 },
  btn:     (v="primary")=>({ display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",border:"none",transition:"all 0.2s",background:v==="primary"?"#3B82F6":v==="success"?"#22C55E":v==="danger"?"#EF4444":"rgba(255,255,255,0.08)",color:v==="ghost"?"#94A3B8":"#fff",fontFamily:"'DM Sans',sans-serif" }),
  select:  { background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#E2E8F0",padding:"8px 12px",fontSize:13,cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif" },
  chk:     (c)=>({ width:18,height:18,borderRadius:5,flexShrink:0,border:c?"2px solid #22C55E":"2px solid rgba(255,255,255,0.2)",background:c?"#22C55E":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s" }),
  lbl:     (c)=>({ fontSize:13,color:c?"#64748B":"#CBD5E1",textDecoration:c?"line-through":"none" }),
  planGrid:{ display:"grid",gridTemplateColumns:"1fr 120px 90px 40px",gap:8,padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,0.05)",alignItems:"center" },
  planHead:{ display:"grid",gridTemplateColumns:"1fr 120px 90px 40px",gap:8,padding:"8px 14px",fontSize:11,fontWeight:700,color:"#475569",letterSpacing:"0.8px",textTransform:"uppercase" },
  notif:   (t)=>({ position:"fixed",bottom:24,right:24,zIndex:2000,background:t==="success"?"#22C55E":"#EF4444",color:"#fff",padding:"12px 20px",borderRadius:10,fontSize:13,fontWeight:600 }),
};

export default function ImplantCaseDetail({ caseId, onClose, onUpdated }) {
  const [cas, setCas]             = useState(null);
  const [phases, setPhases]       = useState([]);
  const [planLines, setPlanLines] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [notif, setNotif]         = useState(null);
  const [tab, setTab]             = useState("suivi");
  const [protocoleKey, setProtocoleKey] = useState("");
  const [newStatut, setNewStatut]       = useState("");
  const [expanded, setExpanded]         = useState({});
  const [patientForm, setPatientForm]   = useState(null);
  const [savingPatient, setSavingPatient] = useState(false);

  useEffect(() => { if (caseId) load(); }, [caseId]);

  async function load() {
    setLoading(true);
    const { data: casData } = await supabase.from("implant_cases")
      .select("*, patients(id,name), clinics(name)").eq("id", caseId).single();
    const { data: phasesData } = await supabase.from("case_phases")
      .select("*, case_steps(*)").eq("case_id", caseId).order("phase_num", { ascending: true });
    const { data: planData } = await supabase.from("treatment_plans")
      .select("*, treatment_lines(*)").eq("case_id", caseId).maybeSingle();

    setCas(casData);
    setNewStatut(casData?.statut || "");
    setPhases(phasesData || []);
    const lines = planData?.treatment_lines || [];
    setPlanLines(lines.sort((a,b) => (a.ordre||0)-(b.ordre||0)));
    const exp = {};
    (phasesData||[]).forEach(p => { exp[p.id] = true; });
    setExpanded(exp);
    // Patient form init
    if (casData?.patients) {
      const p = casData.patients;
      setPatientForm({
        name:               p.name || '',
        phone:              p.phone || '',
        email:              p.email || '',
        birthdate:          p.birthdate || '',
        medicaments:        p.medicaments || '',
        allergies_dentaires:p.allergies_dentaires || '',
        medecin_famille:    p.medecin_famille || '',
        fumeur:             p.fumeur || false,
        bisphosphonates:    p.bisphosphonates || false,
        radiation_tete_cou: p.radiation_tete_cou || false,
        conditions_medicales: p.conditions_medicales || [],
      });
    }
    setLoading(false);
  }

  function notify(msg, type="success") { setNotif({msg,type}); setTimeout(()=>setNotif(null),2500); }

  async function appliquerProtocole(key) {
    if (!key) return;
    if (!confirm(`Appliquer "${PROTOCOLES[key].label}" ? Les phases existantes seront remplacées.`)) return;
    setSaving(true);
    const ids = phases.map(p=>p.id);
    if (ids.length) {
      await supabase.from("case_steps").delete().in("phase_id", ids);
      await supabase.from("case_phases").delete().eq("case_id", caseId);
    }
    for (let i=0; i<PROTOCOLES[key].phases.length; i++) {
      const ph = PROTOCOLES[key].phases[i];
      const { data: np } = await supabase.from("case_phases")
        .insert({ case_id:caseId, phase_num:i+1, titre:ph.titre, statut:i===0?"en_cours":"en_attente" })
        .select().single();
      for (let j=0; j<ph.etapes.length; j++)
        await supabase.from("case_steps").insert({ phase_id:np.id, case_id:caseId, description:ph.etapes[j], ordre:j+1, completed:false });
    }
    await load(); setProtocoleKey(""); notify("Protocole appliqué ✓"); setSaving(false);
  }

  async function toggleStep(step) {
    const val = !step.completed;
    await supabase.from("case_steps").update({ completed:val, completed_at:val?new Date().toISOString():null }).eq("id",step.id);
    setPhases(prev=>prev.map(p=>({...p, case_steps:(p.case_steps||[]).map(s=>s.id===step.id?{...s,completed:val}:s)})));
  }

  async function changerStatut() {
    if (!newStatut || newStatut===cas.statut) return;
    await supabase.from("implant_cases").update({ statut:newStatut }).eq("id",caseId);
    setCas(p=>({...p,statut:newStatut})); onUpdated&&onUpdated(); notify("Statut mis à jour ✓");
  }

  function totalPlan() { return planLines.reduce((s,l)=>s+(parseFloat(l.prix_total)||0),0); }

  async function ajouterLigne() {
    let planId;
    const { data: ex } = await supabase.from("treatment_plans").select("id").eq("case_id",caseId).maybeSingle();
    if (ex) { planId=ex.id; }
    else { const {data:np}=await supabase.from("treatment_plans").insert({case_id:caseId}).select().single(); planId=np.id; }
    const {data:nl}=await supabase.from("treatment_lines").insert({plan_id:planId,acte:"Nouvel acte",code_acdq:"",prix_total:0,ordre:planLines.length+1}).select().single();
    setPlanLines(prev=>[...prev,nl]);
  }

  async function updateLigne(id,field,value) {
    setPlanLines(prev=>prev.map(l=>l.id===id?{...l,[field]:value}:l));
    await supabase.from("treatment_lines").update({[field]:value}).eq("id",id);
  }

  async function supprimerLigne(id) {
    await supabase.from("treatment_lines").delete().eq("id",id);
    setPlanLines(prev=>prev.filter(l=>l.id!==id));
  }

  const statut     = STATUTS.find(s=>s.value===cas?.statut)||STATUTS[0];
  const allSteps   = phases.flatMap(p=>p.case_steps||[]);
  const pTotal     = allSteps.length?Math.round(allSteps.filter(s=>s.completed).length/allSteps.length*100):0;
  const TEETH_UP   = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
  const TEETH_LO   = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
  const activeDents= (cas?.dents||[]).map(Number);

  async function savePatient() {
    if (!cas?.patients?.id || !patientForm) return;
    setSavingPatient(true);
    await supabase.from('patients').update({
      name:               patientForm.name,
      phone:              patientForm.phone || null,
      email:              patientForm.email || null,
      birthdate:          patientForm.birthdate || null,
      medicaments:        patientForm.medicaments || null,
      allergies_dentaires:patientForm.allergies_dentaires || null,
      medecin_famille:    patientForm.medecin_famille || null,
      fumeur:             patientForm.fumeur,
      bisphosphonates:    patientForm.bisphosphonates,
      radiation_tete_cou: patientForm.radiation_tete_cou,
      conditions_medicales: patientForm.conditions_medicales,
    }).eq('id', cas.patients.id);
    setCas(p => ({ ...p, patients: { ...p.patients, ...patientForm } }));
    setSavingPatient(false);
    notify('Patient mis à jour ✓');
  }

  if (loading) return (
    <div style={S.overlay}><div style={S.panel}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#475569"}}>Chargement…</div>
    </div></div>
  );

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
      .step-row:hover{background:rgba(255,255,255,0.04)!important}
      .tab-btn{border:none;cursor:pointer;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;transition:all 0.2s}
      .tab-active{background:#3B82F6;color:#fff}
      .tab-inactive{background:transparent;color:#64748B}
      .tab-inactive:hover{color:#94A3B8;background:rgba(255,255,255,0.05)}
      .pi{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#E2E8F0;padding:5px 8px;font-size:12px;font-family:'DM Sans',sans-serif;outline:none}
      .db{background:none;border:none;color:#475569;cursor:pointer;font-size:16px;padding:2px 6px;border-radius:4px}
      .db:hover{color:#EF4444}
      select option{background:#1E293B}
    `}</style>
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.panel}>

        {/* HEADER */}
        <div style={S.header}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <p style={{margin:"0 0 4px",fontSize:11,color:"#475569",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase"}}>Fiche implantaire</p>
              <h2 style={{fontSize:24,fontWeight:700,color:"#F1F5F9",margin:0}}>{cas?.patients?.name||"Patient"}</h2>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"#94A3B8",width:36,height:36,borderRadius:8,cursor:"pointer",fontSize:18}}>✕</button>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
            <span style={S.badge(statut.color)}><span style={{width:6,height:6,borderRadius:"50%",background:statut.color,display:"inline-block"}}/>{statut.label}</span>
            {cas?.clinics?.name&&<span style={S.badgeGray}>🏥 {cas.clinics.name}</span>}
            {activeDents.length>0&&<span style={S.badgeGray}>🦷 {activeDents.join(", ")}</span>}
            {cas?.type_traitement&&<span style={S.badgeGray}>{cas.type_traitement}</span>}
          </div>
          {phases.length>0&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:11,color:"#475569",fontWeight:600}}>PROGRESSION</span>
                <span style={{fontSize:11,fontWeight:700,color:pTotal===100?"#22C55E":"#3B82F6"}}>{pTotal}%</span>
              </div>
              <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:pTotal+"%",background:pTotal===100?"#22C55E":"linear-gradient(90deg,#3B82F6,#8B5CF6)",transition:"width 0.4s"}}/>
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:6,marginTop:14}}>
            {[["suivi","📋 Suivi"],["plan","💰 Plan"],["info","ℹ️ Infos"],["patient","👤 Patient"]].map(([k,l])=>(
              <button key={k} className={`tab-btn ${tab===k?"tab-active":"tab-inactive"}`} onClick={()=>setTab(k)}>{l}</button>
            ))}
          </div>
        </div>

        <div style={S.content}>

          {/* SUIVI */}
          {tab==="suivi"&&(<>
            <div style={S.section}>
              <div style={S.secHead}><span style={S.secTitle}>Protocole</span></div>
              <div style={{...S.secBody,display:"flex",gap:10,flexWrap:"wrap"}}>
                <select style={{...S.select,flex:1}} value={protocoleKey} onChange={e=>setProtocoleKey(e.target.value)}>
                  <option value="">— Choisir un gabarit —</option>
                  {Object.entries(PROTOCOLES).map(([k,p])=><option key={k} value={k}>{p.label}</option>)}
                </select>
                <button style={S.btn("primary")} onClick={()=>appliquerProtocole(protocoleKey)} disabled={!protocoleKey||saving}>{saving?"…":"Appliquer"}</button>
              </div>
            </div>

            {phases.length===0?(
              <div style={{textAlign:"center",padding:"40px",color:"#475569",fontSize:13}}>Aucune phase — appliquer un protocole ci-dessus.</div>
            ):(
              <div style={S.section}>
                <div style={S.secHead}>
                  <span style={S.secTitle}>Étapes</span>
                  <span style={{fontSize:12,color:"#475569"}}>{allSteps.filter(s=>s.completed).length} / {allSteps.length}</span>
                </div>
                <div style={{padding:"10px 8px"}}>
                  {phases.map(phase=>{
                    const steps=(phase.case_steps||[]).sort((a,b)=>(a.ordre||0)-(b.ordre||0));
                    const pct=steps.length?Math.round(steps.filter(s=>s.completed).length/steps.length*100):0;
                    const isExp=expanded[phase.id]!==false;
                    return (
                      <div key={phase.id} style={{marginBottom:12,borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",overflow:"hidden"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(255,255,255,0.04)",cursor:"pointer"}} onClick={()=>setExpanded(p=>({...p,[phase.id]:!isExp}))}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{width:22,height:22,borderRadius:"50%",background:pct===100?"#22C55E22":"rgba(255,255,255,0.06)",border:pct===100?"2px solid #22C55E":"2px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:pct===100?"#22C55E":"#475569"}}>{pct===100?"✓":""}</span>
                            <span style={{fontSize:13,fontWeight:600,color:"#E2E8F0"}}>{phase.titre}</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{fontSize:11,color:"#64748B"}}>{pct}%</span>
                            <span style={{color:"#475569",fontSize:12}}>{isExp?"▲":"▼"}</span>
                          </div>
                        </div>
                        <div style={{height:3,background:"rgba(255,255,255,0.05)"}}>
                          <div style={{height:"100%",width:pct+"%",background:pct===100?"#22C55E":"linear-gradient(90deg,#3B82F6,#8B5CF6)",transition:"width 0.4s"}}/>
                        </div>
                        {isExp&&steps.map(step=>(
                          <div key={step.id} className="step-row" style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderTop:"1px solid rgba(255,255,255,0.04)",cursor:"pointer"}} onClick={()=>toggleStep(step)}>
                            <div style={S.chk(step.completed)}>{step.completed&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}</div>
                            <span style={S.lbl(step.completed)}>{step.description}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>)}

          {/* PLAN */}
          {tab==="plan"&&(
            <div style={S.section}>
              <div style={S.secHead}>
                <span style={S.secTitle}>Plan de traitement</span>
                <button style={S.btn("ghost")} onClick={ajouterLigne}>+ Ajouter acte</button>
              </div>
              {planLines.length===0?(
                <div style={{textAlign:"center",padding:"36px",color:"#475569",fontSize:13}}>Aucun acte — cliquer "+ Ajouter acte".</div>
              ):(<>
                <div style={S.planHead}><span>Acte</span><span>Code ACDQ</span><span style={{textAlign:"right"}}>Prix</span><span/></div>
                {planLines.map(line=>(
                  <div key={line.id} style={S.planGrid}>
                    <input className="pi" style={{width:"100%"}} value={line.acte||""} onChange={e=>updateLigne(line.id,"acte",e.target.value)} placeholder="Description"/>
                    <input className="pi" value={line.code_acdq||""} onChange={e=>updateLigne(line.id,"code_acdq",e.target.value)} placeholder="Code"/>
                    <input className="pi" type="number" style={{textAlign:"right"}} value={line.prix_total||""} onChange={e=>updateLigne(line.id,"prix_total",e.target.value)} placeholder="0"/>
                    <button className="db" onClick={()=>supprimerLigne(line.id)}>×</button>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:12,padding:"14px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                  <span style={{fontSize:13,color:"#64748B",fontWeight:600}}>TOTAL ESTIMÉ</span>
                  <span style={{fontSize:22,fontWeight:700,color:"#F1F5F9"}}>{totalPlan().toLocaleString("fr-CA",{style:"currency",currency:"CAD",maximumFractionDigits:0})}</span>
                </div>
              </>)}
            </div>
          )}

          {/* INFOS */}
          {tab==="info"&&(<>
            <div style={S.section}>
              <div style={S.secHead}><span style={S.secTitle}>Statut du cas</span></div>
              <div style={{...S.secBody,display:"flex",gap:10,flexWrap:"wrap"}}>
                <select style={{...S.select,flex:1}} value={newStatut} onChange={e=>setNewStatut(e.target.value)}>
                  {STATUTS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <button style={S.btn(newStatut==="termine"?"success":newStatut==="annule"?"danger":"primary")} onClick={changerStatut} disabled={newStatut===cas?.statut}>Mettre à jour</button>
              </div>
            </div>

            <div style={S.section}>
              <div style={S.secHead}><span style={S.secTitle}>Sites implantaires</span></div>
              <div style={S.secBody}>
                <p style={{fontSize:11,color:"#475569",fontWeight:600,marginBottom:8}}>MAXILLAIRE (haut)</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:6,marginBottom:12}}>
                  {TEETH_UP.map(t=><div key={t} style={{background:activeDents.includes(t)?"#3B82F6":"rgba(255,255,255,0.06)",border:activeDents.includes(t)?"2px solid #3B82F6":"2px solid transparent",borderRadius:6,color:activeDents.includes(t)?"#fff":"#64748B",padding:"6px 4px",fontSize:11,fontWeight:600,textAlign:"center"}}>{t}</div>)}
                </div>
                <p style={{fontSize:11,color:"#475569",fontWeight:600,marginBottom:8}}>MANDIBULE (bas)</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:6}}>
                  {TEETH_LO.map(t=><div key={t} style={{background:activeDents.includes(t)?"#3B82F6":"rgba(255,255,255,0.06)",border:activeDents.includes(t)?"2px solid #3B82F6":"2px solid transparent",borderRadius:6,color:activeDents.includes(t)?"#fff":"#64748B",padding:"6px 4px",fontSize:11,fontWeight:600,textAlign:"center"}}>{t}</div>)}
                </div>
              </div>
            </div>

            <div style={S.section}>
              <div style={S.secHead}><span style={S.secTitle}>Dates</span></div>
              <div style={{...S.secBody,display:"flex",flexDirection:"column",gap:10}}>
                {[["Consultation",cas?.date_consultation],["Prochain RDV",cas?.date_rdv]].map(([label,val])=>val&&(
                  <div key={label} style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:13,color:"#64748B"}}>{label}</span>
                    <span style={{fontSize:13,color:"#E2E8F0",fontWeight:600}}>{new Date(val).toLocaleDateString("fr-CA",{year:"numeric",month:"long",day:"numeric"})}</span>
                  </div>
                ))}
              </div>
            </div>

            {cas?.notes&&(
              <div style={S.section}>
                <div style={S.secHead}><span style={S.secTitle}>Notes cliniques</span></div>
                <div style={S.secBody}><p style={{fontSize:13,color:"#94A3B8",lineHeight:1.6,margin:0,whiteSpace:"pre-line"}}>{cas.notes}</p></div>
              </div>
            )}
          </>)}
        </div>
      </div>
    </div>
    {notif&&<div style={S.notif(notif.type)}>{notif.msg}</div>}
  </>);
}
