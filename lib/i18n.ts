// ─────────────────────────────────────────────
// TRANSLATIONS — FR / EN
// ─────────────────────────────────────────────
export const translations = {
  fr: {
    nav: {
      home: 'Accueil',
      projects: 'Projets',
      experiences: 'Parcours',
      certifications: 'Preuves',
      contact: 'Contact',
    },
    hero: {
      cta_projects: 'Voir les projets',
      cta_contact: 'Discuter',
    },
    sections: {
      school_label: 'Scolaire',
      school_heading: 'Le premier modèle se forme : la structure, les bases, la méthode.',
      bank_label: 'Banque',
      bank_heading: 'Le réseau change de forme : plus d\'ordre, plus de signal métier.',
      arsenal_label: 'Arsenal',
      projects_label: 'Projets',
      projects_heading: 'Ce que les données deviennent.',
      projects_all: 'Tous les projets →',
      certifications_label: 'Certifications',
      finale_label: 'Alignement',
      finale_heading: 'Les trois modèles s\'allument. Le parcours devient un signal unique.',
      finale_cta: 'Démarrer une conversation',
    },
    project_card: {
      open: 'Voir le projet',
      drag_hint: '← glissez pour explorer →',
    },
    common: {
      current: 'En cours',
      back_to_projects: '← Retour aux projets',
      indicators: 'Indicateurs',
      context: 'Contexte',
      stack: 'Stack',
      screenshots: 'Captures d\'écran',
    },
    contact: {
      title: 'Prenons contact',
      subtitle: 'Dites-moi ce que vous construisez.',
    },
    phase: {
      school: 'Scolaire',
      bank: 'Banque',
      finale: 'Alignement',
      intro: 'Intro',
    },
  },
  en: {
    nav: {
      home: 'Home',
      projects: 'Projects',
      experiences: 'Journey',
      certifications: 'Proof',
      contact: 'Contact',
    },
    hero: {
      cta_projects: 'View projects',
      cta_contact: 'Let\'s talk',
    },
    sections: {
      school_label: 'Academic',
      school_heading: 'The first model takes shape: structure, foundations, methodology.',
      bank_label: 'Banking',
      bank_heading: 'The network reshapes: more order, more business signal.',
      arsenal_label: 'Arsenal',
      projects_label: 'Projects',
      projects_heading: 'What data becomes.',
      projects_all: 'All projects →',
      certifications_label: 'Certifications',
      finale_label: 'Alignment',
      finale_heading: 'All three models light up. The journey becomes one signal.',
      finale_cta: 'Start a conversation',
    },
    project_card: {
      open: 'View project',
      drag_hint: '← drag to explore →',
    },
    common: {
      current: 'Current',
      back_to_projects: '← Back to projects',
      indicators: 'Indicators',
      context: 'Context',
      stack: 'Stack',
      screenshots: 'Screenshots',
    },
    contact: {
      title: 'Let\'s connect',
      subtitle: 'Tell me what you\'re building.',
    },
    phase: {
      school: 'Academic',
      bank: 'Banking',
      finale: 'Alignment',
      intro: 'Intro',
    },
  },
} as const;

export type Lang = keyof typeof translations;
export type Translations = typeof translations.fr;
