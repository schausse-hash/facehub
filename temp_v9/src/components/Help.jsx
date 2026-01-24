import { useState } from 'react'

const Icons = {
  Book: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  User: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Calendar: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Mic: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  Camera: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Heart: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Document: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Shield: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  ChevronDown: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>,
  ChevronUp: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>,
  Play: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Lightbulb: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
}

const HelpSection = ({ icon: Icon, title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="help-section">
      <button className="help-section-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="help-section-title">
          <span className="help-section-icon"><Icon /></span>
          <h3>{title}</h3>
        </div>
        <span className="help-section-chevron">
          {isOpen ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
        </span>
      </button>
      {isOpen && (
        <div className="help-section-content">
          {children}
        </div>
      )}
    </div>
  )
}

const Step = ({ number, title, children }) => (
  <div className="help-step">
    <div className="help-step-number">{number}</div>
    <div className="help-step-content">
      <h4>{title}</h4>
      <p>{children}</p>
    </div>
  </div>
)

const Tip = ({ children }) => (
  <div className="help-tip">
    <span className="help-tip-icon"><Icons.Lightbulb /></span>
    <p>{children}</p>
  </div>
)

export default function Help() {
  return (
    <div className="help-container">
      <div className="help-header">
        <h1 className="page-title">
          <span style={{ width: 32, height: 32, display: 'inline-block', verticalAlign: 'middle', marginRight: 12 }}>
            <Icons.Book />
          </span>
          Centre d'aide FaceHub
        </h1>
        <p className="page-subtitle">Apprenez à utiliser toutes les fonctionnalités de FaceHub</p>
      </div>

      {/* Quick Start */}
      <div className="help-quick-start">
        <h2>🚀 Démarrage rapide</h2>
        <div className="help-quick-grid">
          <div className="help-quick-card">
            <span className="help-quick-number">1</span>
            <p>Ajoutez votre premier patient</p>
          </div>
          <div className="help-quick-card">
            <span className="help-quick-number">2</span>
            <p>Créez une visite de consultation</p>
          </div>
          <div className="help-quick-card">
            <span className="help-quick-number">3</span>
            <p>Prenez les photos du protocole</p>
          </div>
          <div className="help-quick-card">
            <span className="help-quick-number">4</span>
            <p>Documentez avec la dictée vocale</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="help-sections">
        
        <HelpSection icon={Icons.Play} title="Guide de démarrage" defaultOpen={true}>
          <p>Bienvenue dans FaceHub ! Cette application vous permet de gérer vos patients, documenter les traitements esthétiques, et suivre leur évolution avec des photos.</p>
          
          <h4>Première connexion</h4>
          <Step number="1" title="Demander l'accès">
            Si vous êtes nouveau, cliquez sur "Demander l'accès" sur la page de connexion. Un administrateur devra approuver votre demande.
          </Step>
          <Step number="2" title="Se connecter">
            Une fois approuvé, connectez-vous avec votre email et mot de passe.
          </Step>
          <Step number="3" title="Explorer le tableau de bord">
            Le tableau de bord affiche vos statistiques : nombre de patients, visites du mois, et unités de Botox utilisées.
          </Step>

          <Tip>
            Utilisez Chrome pour une meilleure expérience, notamment pour la dictée vocale.
          </Tip>
        </HelpSection>

        <HelpSection icon={Icons.User} title="Ajouter un patient">
          <p>La gestion des patients est au cœur de FaceHub.</p>
          
          <Step number="1" title="Cliquez sur 'Nouveau patient'">
            Depuis le tableau de bord ou la liste des patients, cliquez sur le bouton doré "Nouveau patient".
          </Step>
          <Step number="2" title="Remplissez les informations">
            Entrez le nom, prénom, email et téléphone du patient. Seul le nom est obligatoire.
          </Step>
          <Step number="3" title="Enregistrez">
            Cliquez sur "Enregistrer" pour créer le dossier patient.
          </Step>

          <Tip>
            Vous pouvez rechercher un patient existant en tapant son nom dans la barre de recherche.
          </Tip>
        </HelpSection>

        <HelpSection icon={Icons.Calendar} title="Créer une visite">
          <p>Chaque consultation ou traitement est enregistré comme une "visite".</p>
          
          <h4>Types de visites</h4>
          <ul>
            <li><strong>Consultation initiale</strong> : Premier rendez-vous d'évaluation</li>
            <li><strong>Traitement</strong> : Injection de Botox ou filler</li>
            <li><strong>Suivi</strong> : Contrôle post-traitement</li>
            <li><strong>Retouche</strong> : Ajustement après traitement</li>
          </ul>

          <Step number="1" title="Ouvrez le dossier patient">
            Cliquez sur un patient dans la liste pour voir son dossier.
          </Step>
          <Step number="2" title="Cliquez sur 'Nouvelle visite'">
            Le bouton se trouve en haut à droite du dossier patient.
          </Step>
          <Step number="3" title="Sélectionnez le type de visite">
            Choisissez parmi : Consultation, Traitement, Suivi, ou Retouche.
          </Step>
          <Step number="4" title="Sélectionnez les zones traitées">
            Pour un traitement Botox, cliquez sur les zones injectées (Front, Glabelle, Pattes d'oie, etc.). Ajustez le nombre d'unités si nécessaire.
          </Step>
          <Step number="5" title="Ajoutez des notes">
            Utilisez le champ texte ou la dictée vocale (🎤) pour documenter la visite.
          </Step>

          <Tip>
            Le total d'unités est calculé automatiquement en fonction des zones sélectionnées.
          </Tip>
        </HelpSection>

        <HelpSection icon={Icons.Mic} title="Utiliser la dictée vocale">
          <p>La dictée vocale vous permet de documenter rapidement vos observations sans taper.</p>
          
          <h4>Navigateurs compatibles</h4>
          <ul>
            <li>✅ <strong>Chrome</strong> : Recommandé</li>
            <li>✅ <strong>Edge</strong> : Fonctionne bien</li>
            <li>⚠️ <strong>Safari</strong> : Support partiel</li>
            <li>❌ <strong>Firefox</strong> : Non supporté</li>
          </ul>

          <Step number="1" title="Cliquez sur '🎤 Dicter'">
            Le bouton se trouve à côté du champ "Notes" lors de la création d'une visite.
          </Step>
          <Step number="2" title="Autorisez le microphone">
            Votre navigateur demandera la permission d'utiliser le micro. Cliquez sur "Autoriser".
          </Step>
          <Step number="3" title="Parlez clairement">
            Cliquez sur le gros bouton micro (cercle rouge) et parlez. Le texte apparaît en temps réel.
          </Step>
          <Step number="4" title="Corrigez et formatez">
            Cliquez sur "Corriger et formater" pour que l'IA améliore et structure votre texte.
          </Step>
          <Step number="5" title="Insérez dans la note">
            Cliquez sur "Insérer dans la note" pour ajouter le texte au dossier.
          </Step>

          <h4>Formats disponibles</h4>
          <ul>
            <li><strong>SOAP</strong> : Format médical standard (Subjectif, Objectif, Analyse, Plan)</li>
            <li><strong>Consultation</strong> : Format adapté aux consultations esthétiques</li>
            <li><strong>Traitement</strong> : Format pour les notes d'injection</li>
            <li><strong>Suivi</strong> : Format pour les contrôles post-traitement</li>
            <li><strong>Libre</strong> : Correction grammaticale seulement</li>
          </ul>

          <Tip>
            Cliquez sur l'icône ⚙️ (paramètres) pour changer le format de note avant de formater.
          </Tip>
        </HelpSection>

        <HelpSection icon={Icons.Camera} title="Prendre des photos">
          <p>FaceHub inclut des protocoles photos standardisés pour documenter les traitements.</p>
          
          <h4>Protocoles disponibles</h4>
          <ul>
            <li><strong>29 photos</strong> : Consultation initiale complète (visage sous tous les angles)</li>
            <li><strong>10 photos</strong> : Traitement Botox (zones ciblées)</li>
          </ul>

          <Step number="1" title="Ouvrez une visite">
            Depuis le dossier patient, cliquez sur "Photos" à côté d'une visite.
          </Step>
          <Step number="2" title="Choisissez le protocole">
            Sélectionnez le protocole 29 photos ou 10 photos selon le type de visite.
          </Step>
          <Step number="3" title="Prenez les photos">
            Suivez les instructions pour chaque angle. Vous pouvez utiliser la caméra de votre appareil ou importer depuis la galerie.
          </Step>
          <Step number="4" title="Comparez avant/après">
            Utilisez la fonction de comparaison pour voir l'évolution entre les visites.
          </Step>

          <Tip>
            Sur iPhone, utilisez Safari pour un meilleur accès à la caméra.
          </Tip>
        </HelpSection>

        <HelpSection icon={Icons.Heart} title="Dossier médical">
          <p>Chaque patient a un dossier médical complet pour stocker ses informations de santé.</p>
          
          <h4>Informations stockées</h4>
          <ul>
            <li>Conditions médicales</li>
            <li>Allergies</li>
            <li>Médicaments actuels</li>
            <li>Chirurgies antérieures</li>
            <li>Conditions cutanées</li>
            <li>Contre-indications</li>
            <li>Groupe sanguin</li>
            <li>Contact d'urgence</li>
          </ul>

          <Step number="1" title="Accédez au dossier médical">
            Depuis le dossier patient, cliquez sur l'onglet "Dossier médical".
          </Step>
          <Step number="2" title="Remplissez les champs">
            Entrez toutes les informations pertinentes. Utilisez la dictée vocale (🎤) pour les notes.
          </Step>
          <Step number="3" title="Sauvegardez">
            Cliquez sur "Sauvegarder" pour enregistrer les modifications.
          </Step>

          <Tip>
            Vérifiez les contre-indications avant chaque traitement !
          </Tip>
        </HelpSection>

        <HelpSection icon={Icons.Document} title="Gérer les documents">
          <p>Vous pouvez téléverser et organiser des documents pour chaque patient.</p>
          
          <h4>Types de documents</h4>
          <ul>
            <li>Consentements signés</li>
            <li>Formulaires médicaux</li>
            <li>Plans de traitement</li>
            <li>Prescriptions</li>
            <li>Factures</li>
            <li>Consentement photos</li>
          </ul>

          <Step number="1" title="Accédez aux documents">
            Depuis le dossier patient, cliquez sur l'onglet "Documents".
          </Step>
          <Step number="2" title="Sélectionnez le type">
            Choisissez le type de document dans la liste déroulante.
          </Step>
          <Step number="3" title="Téléversez le fichier">
            Cliquez sur "Choisir un fichier" et sélectionnez le document (PDF, Word, image).
          </Step>

          <Tip>
            Numérisez les consentements signés et téléversez-les pour avoir un dossier complet.
          </Tip>
        </HelpSection>

        <HelpSection icon={Icons.Shield} title="Section Administration">
          <p>Les administrateurs ont accès à des fonctions supplémentaires.</p>
          
          <h4>Rôles d'utilisateurs</h4>
          <ul>
            <li><strong>👤 Utilisateur</strong> : Accès de base aux patients et visites</li>
            <li><strong>👥 Collaborateur</strong> : Peut approuver les demandes d'accès</li>
            <li><strong>⭐ Super Admin</strong> : Accès total + gestion des rôles</li>
          </ul>

          <h4>Fonctions admin</h4>
          <Step number="1" title="Approuver les demandes">
            Les nouvelles demandes d'accès apparaissent dans la section Admin. Cliquez sur "Approuver" ou "Rejeter".
          </Step>
          <Step number="2" title="Gérer l'équipe">
            Modifiez les rôles des utilisateurs, leurs profils, ou supprimez des comptes.
          </Step>
          <Step number="3" title="Ajouter des emails autorisés">
            Pré-autorisez des emails pour qu'ils puissent s'inscrire directement.
          </Step>

          <Tip>
            Seuls les Super Admins peuvent modifier les rôles des autres utilisateurs.
          </Tip>
        </HelpSection>

      </div>

      {/* FAQ */}
      <div className="help-faq">
        <h2>❓ Questions fréquentes</h2>
        
        <div className="help-faq-item">
          <h4>La dictée vocale ne fonctionne pas</h4>
          <p>Assurez-vous d'utiliser Chrome, d'avoir autorisé le microphone, et d'avoir une connexion internet stable. La reconnaissance vocale nécessite une connexion aux serveurs de Google.</p>
        </div>
        
        <div className="help-faq-item">
          <h4>Je ne peux pas prendre de photos sur iPhone</h4>
          <p>Utilisez Safari au lieu de Chrome sur iPhone. Apple restreint l'accès à la caméra dans les autres navigateurs.</p>
        </div>
        
        <div className="help-faq-item">
          <h4>Comment exporter les données d'un patient ?</h4>
          <p>Depuis la galerie photos, vous pouvez exporter un PDF avec les photos. Pour les autres données, contactez un administrateur.</p>
        </div>
        
        <div className="help-faq-item">
          <h4>J'ai oublié mon mot de passe</h4>
          <p>Sur la page de connexion, cliquez sur "Mot de passe oublié" et suivez les instructions envoyées par email.</p>
        </div>
      </div>

      {/* Contact */}
      <div className="help-contact">
        <h2>📞 Besoin d'aide supplémentaire ?</h2>
        <p>Contactez l'administrateur de votre clinique ou envoyez un email à support.</p>
      </div>

      <style>{`
        .help-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .help-header {
          margin-bottom: 2rem;
        }

        .help-header .page-title {
          display: flex;
          align-items: center;
        }

        .help-quick-start {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .help-quick-start h2 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
        }

        .help-quick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .help-quick-card {
          background: var(--bg-dark);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
        }

        .help-quick-number {
          width: 32px;
          height: 32px;
          background: var(--accent);
          color: var(--primary);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .help-quick-card p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .help-sections {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .help-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .help-section-header {
          width: 100%;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-primary);
          font-family: inherit;
        }

        .help-section-header:hover {
          background: var(--bg-card-hover);
        }

        .help-section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .help-section-icon {
          width: 24px;
          height: 24px;
          color: var(--accent);
        }

        .help-section-title h3 {
          margin: 0;
          font-size: 1.1rem;
          font-family: 'Cormorant Garamond', serif;
        }

        .help-section-chevron {
          width: 20px;
          height: 20px;
          color: var(--text-muted);
        }

        .help-section-content {
          padding: 0 1.5rem 1.5rem;
          border-top: 1px solid var(--border);
        }

        .help-section-content h4 {
          margin: 1.5rem 0 0.75rem;
          font-size: 1rem;
          color: var(--accent);
        }

        .help-section-content p {
          margin: 0.75rem 0;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .help-section-content ul {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
          color: var(--text-secondary);
        }

        .help-section-content li {
          margin: 0.5rem 0;
          line-height: 1.5;
        }

        .help-step {
          display: flex;
          gap: 1rem;
          margin: 1rem 0;
        }

        .help-step-number {
          width: 28px;
          height: 28px;
          min-width: 28px;
          background: var(--accent);
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .help-step-content h4 {
          margin: 0 0 0.25rem 0 !important;
          font-size: 0.95rem !important;
          color: var(--text-primary) !important;
        }

        .help-step-content p {
          margin: 0 !important;
          font-size: 0.9rem;
        }

        .help-tip {
          display: flex;
          gap: 0.75rem;
          background: rgba(212, 165, 116, 0.1);
          border: 1px solid rgba(212, 165, 116, 0.3);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin: 1rem 0;
        }

        .help-tip-icon {
          width: 20px;
          height: 20px;
          color: var(--accent);
          flex-shrink: 0;
        }

        .help-tip p {
          margin: 0 !important;
          font-size: 0.9rem;
          color: var(--text-primary) !important;
        }

        .help-faq {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .help-faq h2 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
        }

        .help-faq-item {
          padding: 1rem 0;
          border-bottom: 1px solid var(--border);
        }

        .help-faq-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .help-faq-item h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .help-faq-item p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .help-contact {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .help-contact h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
        }

        .help-contact p {
          margin: 0;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .help-quick-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
