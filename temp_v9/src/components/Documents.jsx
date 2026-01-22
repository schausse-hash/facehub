import { useState } from 'react'

const Icons = {
  Document: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Printer: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
  X: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
}

const DOCUMENTS = {
  'historique-medical': { title: 'Historique Médical', desc: 'Formulaire d\'antécédents médicaux' },
  'consentement': { title: 'Consentement au Traitement', desc: 'Consentement toxine botulique' },
  'instructions-post-op': { title: 'Instructions Post-Traitement', desc: 'Instructions à remettre au patient' },
  'fiche-traitement': { title: 'Fiche de Traitement', desc: 'Suivi des traitements' },
  'autorisation-photos': { title: 'Autorisation Photos', desc: 'Autorisation utilisation photos' },
}

const getDocContent = (docId) => {
  const docs = {
    'historique-medical': `<h1>Historique Médical</h1>
<p><strong>Nom :</strong> <span class="field"></span> <strong>Date de naissance :</strong> <span class="field"></span> <strong>Sexe :</strong> <span class="checkbox"></span> M <span class="checkbox"></span> F</p>
<p><strong>Adresse :</strong> <span class="field" style="width:300px"></span> <strong>Ville :</strong> <span class="field"></span> <strong>Province :</strong> <span class="field"></span></p>
<p><strong>Code postal :</strong> <span class="field"></span> <strong>Courriel :</strong> <span class="field" style="width:250px"></span></p>
<p><strong>Téléphone :</strong> (Dom.) <span class="field"></span> (Trav.) <span class="field"></span> (Cell.) <span class="field"></span></p>
<h2>Comment avez-vous entendu parler de notre clinique ?</h2>
<p><span class="checkbox"></span> Référence médecin <span class="checkbox"></span> Ami/patient <span class="checkbox"></span> Site Web <span class="checkbox"></span> Magazine</p>
<h2>Je suis intéressé(e) par :</h2>
<p><span class="checkbox"></span> Botox Thérapeutique <span class="checkbox"></span> Botox Cosmétique <span class="checkbox"></span> Épilation <span class="checkbox"></span> Rajeunissement cutané <span class="checkbox"></span> Agents de comblement</p>
<h2>Antécédents médicaux - Encerclez les conditions traitées :</h2>
<table><tr><td>Acné</td><td>Herpès</td><td>Arthrite</td><td>Diabète</td></tr><tr><td>Épilepsie</td><td>Cancer</td><td>Maladie auto-immune</td><td>Psoriasis</td></tr><tr><td>Cicatrices chéloïdes</td><td>Mélanome</td><td>Vitiligo</td><td>Troubles sanguins</td></tr></table>
<p><strong>Écran solaire :</strong> <span class="checkbox"></span> Oui FPS: <span class="field"></span> <span class="checkbox"></span> Non</p>
<p><strong>Médecin :</strong> <span class="field"></span> <strong>Allergies :</strong> <span class="field"></span></p>
<p><strong>Maladies/chirurgies passées :</strong> <span class="field" style="width:100%"></span></p>
<p><strong>Médicaments actuels :</strong> <span class="field" style="width:100%"></span></p>
<p><strong>Fumeur :</strong> <span class="field"></span> <strong>Poids :</strong> <span class="field"></span> <strong>Taille :</strong> <span class="field"></span></p>
<p><strong>Traitements Botox passés :</strong> <span class="field" style="width:100%"></span></p>
<p><strong>Enceinte/allaitante :</strong> <span class="field" style="width:100%"></span></p>
<div class="signature">SIGNATURE PATIENT</div><p>Date : <span class="field"></span></p>`,

    'consentement': `<h1>Consentement au Traitement par Toxine Botulique</h1>
<p><strong>Nom du patient :</strong> <span class="field" style="width:300px"></span></p>
<ol>
<li>Je suis conscient(e) que lorsque de petites quantités de toxine botulique purifiée sont injectées dans un muscle, celui-ci s'affaiblit. Cet effet apparaît en 12 à 14 jours et dure généralement 3 à 4 mois.</li>
<li>Je comprends que ce traitement réduira ma capacité à froncer les sourcils et/ou produire des pattes d'oie pendant que l'injection est efficace.</li>
<li>Je comprends que je dois rester en position verticale et ne pas manipuler la zone d'injection pendant 4 heures. Je dois exercer les muscles traités pendant 2 heures.</li>
<li>Je m'engage à effectuer une visite de suivi 10 à 14 jours après mon traitement.</li>
<li>J'ai été informé(e) des méthodes alternatives de traitement.</li>
<li>Je suis conscient(e) que le traitement peut entraîner une légère chute temporaire d'une paupière (2% des cas). Engourdissement, ecchymoses, gonflement ou maux de tête peuvent survenir.</li>
<li>Je suis conscient(e) que chaque patient réagit différemment et que les résultats ne peuvent être garantis.</li>
<li>Je ne suis pas enceinte et je n'ai pas de maladie neurologique ou musculaire significative.</li>
<li>J'ai eu l'opportunité de poser des questions.</li>
<li>J'autorise la prise de photographies pour évaluer le traitement.</li>
<li>J'accepte les lois du Québec, Canada.</li>
<li>J'accepte les risques et je consens à l'injection sur mon visage et cou.</li>
</ol>
<div class="signature">Signature du patient</div><p>Date : <span class="field"></span></p>`,

    'instructions-post-op': `<h1>Instructions Post-Traitement - Toxine Botulique</h1>
<ol>
<li><strong>Exercez les muscles traités pendant 1-2 heures</strong> (froncer les sourcils, lever les sourcils, plisser les yeux).</li>
<li><strong>Ne frottez PAS les zones traitées pendant 4 heures.</strong> Pas d'exercices intenses, soins du visage ou saunas.</li>
<li><strong>Ne vous allongez PAS pendant 4 heures</strong> pour éviter toute pression.</li>
<li><strong>Les petites bosses disparaîtront en quelques heures.</strong></li>
<li><strong>Les résultats prennent jusqu'à 14 jours</strong> pour faire pleinement effet.</li>
<li><strong>Rendez-vous de suivi à 2 semaines :</strong> <span class="checkbox"></span> OUI <span class="checkbox"></span> NON<br>Date : <span class="field" style="width:200px"></span></li>
<li><strong>Procédure temporaire</strong> - effets de 3-4 mois initialement.</li>
<li><strong>Suivi recommandé entre 3 et 4 mois.</strong></li>
<li><strong>Prochain rendez-vous :</strong> <span class="field" style="width:200px"></span></li>
</ol>`,

    'fiche-traitement': `<h1>Fiche de Traitement - Toxine Botulique</h1>
<p><strong>Nom :</strong> <span class="field" style="width:250px"></span> <strong>N° Dossier :</strong> <span class="field"></span></p>
<p><span class="checkbox"></span> Enregistré FaceHub <span class="checkbox"></span> Document post-soins remis</p>
<table>
<tr><th>Traitement N°</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
<tr><td>Date</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Photos Avant</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Total unités</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>N° Lot</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
</table>
<h2>Zones de traitement (unités)</h2>
<table>
<tr><th>Zone</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
<tr><td>Glabelle</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Front</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Pattes d'oie G</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Pattes d'oie D</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Bunny lines</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Lèvre sup.</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>DAO</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Menton</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Masséter G</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Masséter D</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Platysma</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
</table>`,

    'autorisation-photos': `<h1>Formulaire d'Autorisation de Photographies</h1>
<p>J'ai consenti à ce que des photographies soient prises. Je comprends qu'elles peuvent être utilisées pour la documentation et l'illustration de mon traitement.</p>
<p>De plus, elles peuvent être utilisées (sans mon nom) pour illustrer une procédure ou une technique particulière à d'autres patients au sein du cabinet et sur le site Web.</p>
<div style="margin-top:3rem">
<p><strong>Nom du patient :</strong> <span class="field" style="width:300px"></span></p>
<div class="signature">Signature du patient</div>
<p>Date : <span class="field" style="width:200px"></span></p>
</div>
<div style="margin-top:2rem">
<p><strong>Nom du témoin :</strong> <span class="field" style="width:300px"></span></p>
<div class="signature">Signature du témoin</div>
<p>Date : <span class="field" style="width:200px"></span></p>
</div>`
  }
  return docs[docId] || ''
}

export default function Documents() {
  const [selectedDoc, setSelectedDoc] = useState(null)

  const handlePrint = () => {
    const content = getDocContent(selectedDoc)
    const w = window.open('', '_blank')
    w.document.write(`<!DOCTYPE html><html><head><title>${DOCUMENTS[selectedDoc]?.title}</title>
<style>
body{font-family:Georgia,serif;padding:2rem;line-height:1.8;max-width:800px;margin:0 auto}
h1{text-align:center;border-bottom:2px solid #000;padding-bottom:1rem;margin-bottom:2rem}
h2{margin-top:2rem;margin-bottom:1rem}
table{width:100%;border-collapse:collapse;margin:1rem 0}
th,td{border:1px solid #000;padding:0.5rem}
th{background:#f0f0f0}
.field{border-bottom:1px solid #000;min-width:150px;display:inline-block;margin:0 0.25rem}
.checkbox{display:inline-block;width:12px;height:12px;border:1px solid #000;margin-right:0.25rem}
.signature{margin-top:2rem;border-top:1px solid #000;width:250px;padding-top:0.5rem}
@media print{body{padding:1rem}}
</style></head><body>${content}</body></html>`)
    w.document.close()
    w.print()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Formulaires imprimables en français</p>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {Object.entries(DOCUMENTS).map(([id, doc]) => (
          <div 
            key={id} 
            className="card" 
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedDoc(id)}
          >
            <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'rgba(212, 165, 116, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--accent)'
              }}>
                <Icons.Document />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>{doc.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{doc.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Preview */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div 
            className="modal" 
            style={{ maxWidth: '900px', maxHeight: '95vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">{DOCUMENTS[selectedDoc]?.title}</h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary btn-sm" onClick={handlePrint}>
                  <Icons.Printer /> Imprimer
                </button>
                <button className="modal-close" onClick={() => setSelectedDoc(null)}>
                  <Icons.X />
                </button>
              </div>
            </div>
            <div 
              className="modal-body" 
              style={{ 
                background: '#fff', 
                color: '#000', 
                padding: '2rem', 
                fontFamily: 'Georgia, serif', 
                lineHeight: '1.8' 
              }}
              dangerouslySetInnerHTML={{ __html: getDocContent(selectedDoc) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
