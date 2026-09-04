'use client';

import { supabase } from '@/lib/portfolio';
import { translateFrToEn } from '@/lib/translate';
import { useEffect, useState } from 'react';

type UserSession = {
  id: string;
  email?: string;
};

export default function AdminPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Login form state
  const [email, setEmail] = useState('alimzato.admin@gmail.com');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'experiences' | 'education' | 'skills' | 'certifications' | 'profile'>('overview');

  // General lists
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  // Modal / Form state for CRUD
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Dynamic screenshot URL list for projects form
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>(['']);

  // Stats / Counts
  const [counts, setCounts] = useState({
    projects: 0,
    experiences: 0,
    education: 0,
    skills: 0,
    certifications: 0,
  });

  // Translate any text input field on the fly
  const handleTranslateField = async (e: React.MouseEvent, selector: string) => {
    e.preventDefault();
    const btn = e.currentTarget as HTMLButtonElement;
    const parent = btn.closest('div'); // find enclosing form-group container
    const input = parent?.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    if (input && input.value) {
      const orig = btn.innerHTML;
      btn.innerHTML = '⏳...';
      btn.disabled = true;
      try {
        const trans = await translateFrToEn(input.value);

        // programmatically update React controlled inputs
        const valueSetter = Object.getOwnPropertyDescriptor(input, 'value')?.set;
        const prototype = Object.getPrototypeOf(input);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
        if (prototypeValueSetter && prototypeValueSetter !== valueSetter) {
          prototypeValueSetter.call(input, trans);
        } else if (valueSetter) {
          valueSetter.call(input, trans);
        } else {
          input.value = trans;
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (err) {
        alert('Erreur lors de la traduction');
      } finally {
        btn.innerHTML = orig;
        btn.disabled = false;
      }
    }
  };

  // Check auth session
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch all dashboard data when user is authenticated
  useEffect(() => {
    if (user && supabase) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!supabase) return;
    try {
      const [
        { data: projectsData },
        { data: experiencesData },
        { data: educationData },
        { data: skillsData },
        { data: certificationsData },
        { data: categoriesData },
      ] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('experiences').select('*').order('start_date', { ascending: false }),
        supabase.from('education').select('*').order('start_date', { ascending: false }),
        supabase.from('skills').select('*').order('name', { ascending: true }),
        supabase.from('certifications').select('*').order('issue_date', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
      ]);

      const projectsList = projectsData || [];
      const experiencesList = experiencesData || [];
      const educationList = educationData || [];
      const skillsList = skillsData || [];
      const certificationsList = certificationsData || [];

      setProjects(projectsList);
      setExperiences(experiencesList);
      setEducation(educationList);
      setSkills(skillsList);
      setCertifications(certificationsList);
      setCategories(categoriesData || []);

      setCounts({
        projects: projectsList.length,
        experiences: experiencesList.length,
        education: educationList.length,
        skills: skillsList.length,
        certifications: certificationsList.length,
      });

      // Fetch profile for the specific admin UID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      } else {
        // Fallback profile object if row doesn't exist yet
        setProfile({
          full_name: '',
          status_label: '',
          motto: '',
          bio: '',
          email: user?.email || '',
          phone: '',
          location: '',
          linkedin_url: '',
          github_url: '',
          website_url: '',
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setAuthLoading(true);
    setAuthError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erreur d\'authentification');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setFormLoading(true);
    setFormError('');

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        ...profile,
      });

      if (error) {
        setFormError(error.message);
      } else {
        alert('Profil mis à jour avec succès !');
        fetchData();
      }
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la sauvegarde du profil');
    } finally {
      setFormLoading(false);
    }
  };

  // Open form modal for adding or editing
  const openForm = (item: any = null) => {
    setEditingItem(item);
    setFormError('');
    // Pre-populate screenshot URLs if editing
    if (item?.screenshots && Array.isArray(item.screenshots) && item.screenshots.length > 0) {
      setScreenshotUrls(item.screenshots);
    } else {
      setScreenshotUrls(['']);
    }
    setIsFormOpen(true);
  };

  // Delete handler
  const handleDelete = async (table: string, id: string) => {
    if (!supabase) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        alert('Erreur lors de la suppression : ' + error.message);
      } else {
        fetchData();
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  // Submit handler for forms
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    setFormLoading(true);
    setFormError('');

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      // Handle boolean checkboxes
      if (key === 'is_published' || key === 'is_current' || key === 'is_featured') {
        data[key] = value === 'on' || value === 'true';
      } else {
        data[key] = value;
      }
    });

    // Special parsing for array columns stored as jsonb
    if (activeTab === 'projects') {
      data.is_published = formData.get('is_published') === 'on';

      // tech_details from comma-separated input
      const techDetailsStr = formData.get('tech_details') as string;
      data.tech_details = techDetailsStr ? techDetailsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];

      // Screenshots come from the dynamic state (not FormData)
      data.screenshots = screenshotUrls.filter((u) => u.trim() !== '');

      const collaboratorsStr = formData.get('collaborators') as string;
      data.collaborators = collaboratorsStr ? collaboratorsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
    }

    if (activeTab === 'experiences' || activeTab === 'education') {
      data.is_current = formData.get('is_current') === 'on';
    }

    if (activeTab === 'certifications') {
      data.is_featured = formData.get('is_featured') === 'on';
      if (!data.platform_name) data.platform_name = null;
      if (!data.issue_date) data.issue_date = null;
      if (!data.expiry_date) data.expiry_date = null;
    }

    if (activeTab === 'skills') {
      if (!data.category_id) data.category_id = null;
    }

    try {
      let error;
      if (editingItem?.id) {
        // Edit mode
        const { error: err } = await supabase
          .from(activeTab)
          .update(data)
          .eq('id', editingItem.id);
        error = err;
      } else {
        // Add mode
        const { error: err } = await supabase.from(activeTab).insert([data]);
        error = err;
      }

      if (error) {
        setFormError(error.message);
      } else {
        setIsFormOpen(false);
        setEditingItem(null);
        fetchData();
      }
    } catch (err: any) {
      setFormError(err.message || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-cyan-300">
        <div className="text-center font-mono">
          <div className="mb-4 text-3xl animate-pulse">▲ CHARGEMENT DES SIGNAUX...</div>
          <p className="text-slate-500">Connexion sécurisée en cours</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show login view
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] px-6 py-12">
        <div className="glass-panel w-full max-w-md rounded-[28px] border border-cyan-500/25 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-widest text-cyan-300 font-mono">
              Terminal d'accès admin
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">CONNEXION</h1>
            <p className="text-sm text-slate-400 mt-2">Connectez-vous pour éditer le portfolio</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                Adresse Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                placeholder="nom@exemple.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                Mot de Passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 font-mono">
                ERREUR: {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-2xl bg-cyan-400 py-3.5 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50 transition"
            >
              {authLoading ? 'AUTHENTIFICATION EN COURS...' : 'S\'AUTHENTIFIER'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans pt-24 sm:pt-28" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Mobile top tab bar */}
      <div className="md:hidden border-b px-4 py-3 overflow-x-auto flex gap-2 shrink-0 scrollbar-none" style={{ borderColor: 'var(--panel-border)', background: 'var(--card-bg)' }}>
        {[
          { id: 'overview', label: 'Vue d\'ensemble' },
          { id: 'projects', label: 'Projets' },
          { id: 'experiences', label: 'Expériences' },
          { id: 'education', label: 'Éducation' },
          { id: 'certifications', label: 'Certifications' },
          { id: 'skills', label: 'Compétences' },
          { id: 'profile', label: 'Profil' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="whitespace-nowrap rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-300 ml-auto"
        >
          Déconnexion
        </button>
      </div>

      {/* Sidebar navigation for desktop */}
      <aside className="w-64 border-r px-4 py-6 hidden md:block shrink-0" style={{ borderColor: 'var(--panel-border)', background: 'var(--card-bg)' }}>
        <div className="mb-8 px-2">
          <p className="text-[10px] uppercase tracking-widest text-cyan-300 font-mono font-bold">Base Connectée</p>
          <p className="text-xs text-slate-400 mt-1 truncate">{user.email}</p>
        </div>

        <nav className="space-y-1">
          {[
            { id: 'overview', label: 'Vue d\'ensemble' },
            { id: 'projects', label: 'Projets' },
            { id: 'experiences', label: 'Expériences' },
            { id: 'education', label: 'Éducation' },
            { id: 'certifications', label: 'Certifications' },
            { id: 'skills', label: 'Compétences' },
            { id: 'profile', label: 'Profil Métadonnées' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25'
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-20 pt-6 border-t border-slate-800/80 px-2">
          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-center text-xs font-bold text-red-300 hover:bg-red-500/20 transition font-mono"
          >
            DÉCONNEXION
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto max-w-6xl">
        {/* Tab content renderer */}
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">VUE D'ENSEMBLE</h1>
            <p className="text-slate-400 text-sm mt-1">Résumé des signaux enregistrés dans Supabase</p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
              {[
                { label: 'Projets', val: counts.projects, color: 'text-cyan-300 border-cyan-500/20' },
                { label: 'Expériences', val: counts.experiences, color: 'text-emerald-300 border-emerald-500/20' },
                { label: 'Éducation', val: counts.education, color: 'text-yellow-300 border-yellow-500/20' },
                { label: 'Certifications', val: counts.certifications, color: 'text-violet-300 border-violet-500/20' },
                { label: 'Compétences', val: counts.skills, color: 'text-pink-300 border-pink-500/20' },
              ].map((c) => (
                <div key={c.label} className={`glass-panel rounded-2xl border p-5 text-center ${c.color}`}>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{c.label}</p>
                  <p className="text-4xl font-bold mt-2 font-mono">{c.val}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 glass-panel rounded-3xl border border-slate-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4 font-mono">STATUT DES DONNÉES</h2>
              <div className="space-y-3 text-sm text-slate-300">
                <p>✓ Projet connecté avec succès au cluster : <strong className="text-cyan-300">EngineerTerminal</strong></p>
                <p>✓ Vos modifications d'administration mettront à jour directement l'affichage des sections publiques du portfolio.</p>
                <p>💡 Cliquez sur les onglets de gauche (Projets, Expériences, Compétences...) pour ajouter, modifier ou supprimer des fiches.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab tab views (CRUD layouts) */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">PROJETS</h1>
                <p className="text-slate-400 text-sm mt-1">Visualisations de données, codes et cas d'étude</p>
              </div>
              <button
                onClick={() => openForm()}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 font-mono"
              >
                + NOUVEAU PROJET
              </button>
            </div>

            {/* List */}
            <div className="mt-8 space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="glass-panel rounded-2xl border border-slate-800 p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} className="h-12 w-16 object-cover rounded-lg border border-slate-700" />
                    ) : (
                      <div className="h-12 w-16 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-600">No Img</div>
                    )}
                    <div>
                      <h3 className="font-bold text-white text-lg">{project.title}</h3>
                      <p className="text-xs text-cyan-300 mt-0.5 tracking-wider font-mono uppercase">{project.slug} · {project.is_published ? 'Publié' : 'Brouillon'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openForm(project)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-900"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDelete('projects', project.id)}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'experiences' && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">EXPÉRIENCES</h1>
                <p className="text-slate-400 text-sm mt-1">Chronologie professionnelle et missions</p>
              </div>
              <button
                onClick={() => openForm()}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 font-mono"
              >
                + EXPÉRIENCE
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="glass-panel rounded-2xl border border-slate-800 p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{exp.position}</h3>
                    <p className="text-sm text-slate-300">{exp.company} · <span className="text-xs text-slate-500">{exp.start_date} — {exp.is_current ? 'Aujourd\'hui' : exp.end_date}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openForm(exp)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-900"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDelete('experiences', exp.id)}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">ÉDUCATION</h1>
                <p className="text-slate-400 text-sm mt-1">Formations, diplômes et études</p>
              </div>
              <button
                onClick={() => openForm()}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 font-mono"
              >
                + FORMATION
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="glass-panel rounded-2xl border border-slate-800 p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{edu.degree}</h3>
                    <p className="text-sm text-slate-300">{edu.school_name} · <span className="text-xs text-slate-500">{edu.start_date} — {edu.is_current ? 'Aujourd\'hui' : edu.end_date}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openForm(edu)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-900"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDelete('education', edu.id)}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'certifications' && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">CERTIFICATIONS</h1>
                <p className="text-slate-400 text-sm mt-1">Certifications, bootcamps et diplômes annexes</p>
              </div>
              <button
                onClick={() => openForm()}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 font-mono"
              >
                + CERTIFICATION
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="glass-panel rounded-2xl border border-slate-800 p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{cert.title}</h3>
                    <p className="text-sm text-slate-300">{cert.issuer} · <span className="text-xs text-slate-500">{cert.issue_date}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openForm(cert)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-900"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDelete('certifications', cert.id)}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">COMPÉTENCES</h1>
                <p className="text-slate-400 text-sm mt-1">Outils, langages, modélisations et tech catalog</p>
              </div>
              <button
                onClick={() => openForm()}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 font-mono"
              >
                + COMPÉTENCE
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => {
                const categoryName = categories.find((c) => c.id === skill.category_id)?.name || 'Aucune catégorie';
                return (
                  <div key={skill.id} className="glass-panel rounded-2xl border border-slate-800 p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white font-mono">{skill.name}</h4>
                      <p className="text-xs text-slate-400">{categoryName}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openForm(skill)}
                        className="rounded-lg border border-slate-700 p-1 text-xs text-slate-300 hover:bg-slate-900"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete('skills', skill.id)}
                        className="rounded-lg border border-red-500/20 bg-red-500/5 p-1 text-xs text-red-300 hover:bg-red-500/20"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'profile' && profile && (
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">PROFIL & MÉTADONNÉES</h1>
            <p className="text-slate-400 text-sm mt-1">Texte d'introduction, devise, email et liens sociaux</p>

            <form onSubmit={handleSaveProfile} className="mt-8 space-y-6 max-w-2xl">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                      Nom Complet
                    </label>
                    <button onClick={(e) => handleTranslateField(e, 'input')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                  </div>
                  <input
                    type="text"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-slate-100 focus:border-cyan-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                      Poste / Titre
                    </label>
                    <button onClick={(e) => handleTranslateField(e, 'input')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                  </div>
                  <input
                    type="text"
                    value={profile.status_label || ''}
                    onChange={(e) => setProfile({ ...profile, status_label: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-slate-100 focus:border-cyan-400 focus:outline-hidden"
                    placeholder="ex: Data Analyst • Full Stack Developer"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    Slogan d'introduction (Intro)
                  </label>
                  <button onClick={(e) => handleTranslateField(e, 'textarea')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                </div>
                <textarea
                  value={profile.motto || ''}
                  onChange={(e) => setProfile({ ...profile, motto: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-slate-100 focus:border-cyan-400 focus:outline-hidden h-20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    Biographie (Bio finale)
                  </label>
                  <button onClick={(e) => handleTranslateField(e, 'textarea')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                </div>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-slate-100 focus:border-cyan-400 focus:outline-hidden h-32"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-slate-100 focus:border-cyan-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-slate-100 focus:border-cyan-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    Lien LinkedIn
                  </label>
                  <input
                    type="text"
                    value={profile.linkedin_url || ''}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-slate-100 focus:border-cyan-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    Lien GitHub
                  </label>
                  <input
                    type="text"
                    value={profile.github_url || ''}
                    onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-slate-100 focus:border-cyan-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    Lien Site Web / Contact
                  </label>
                  <input
                    type="text"
                    value={profile.website_url || ''}
                    onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-slate-100 focus:border-cyan-400 focus:outline-hidden"
                    placeholder="https://mon-contact-web.com"
                  />
                </div>
              </div>

              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 font-mono">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50 transition font-mono"
              >
                {formLoading ? 'ENREGISTREMENT...' : 'SAUVEGARDER LE PROFIL'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* CRUD Overlay Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-xs">
          <div className="glass-panel w-full max-w-2xl rounded-4xl border border-cyan-500/25 p-8 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white font-mono">
                {editingItem ? 'MODIFIER' : 'AJOUTER'} - {activeTab.toUpperCase()}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-mono border border-slate-800 rounded-lg px-2.5 py-1"
              >
                FERMER
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {activeTab === 'projects' && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Titre du Projet</label>
                        <button onClick={(e) => handleTranslateField(e, 'input[name="title"]')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                      </div>
                      <input type="text" name="title" required defaultValue={editingItem?.title || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Slug unique (URL)</label>
                      <input type="text" name="slug" required defaultValue={editingItem?.slug || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 font-mono" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description courte (Résumé)</label>
                      <button onClick={(e) => handleTranslateField(e, 'textarea[name="description"]')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                    </div>
                    <textarea name="description" required defaultValue={editingItem?.description || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 h-20" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Contenu détaillé (Contexte/Story)</label>
                      <button onClick={(e) => handleTranslateField(e, 'textarea[name="content"]')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                    </div>
                    <textarea name="content" defaultValue={editingItem?.content || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 h-32" />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">URL Image de couverture</label>
                      <input type="text" name="image_url" defaultValue={editingItem?.image_url || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">URL Dépôt GitHub</label>
                      <input type="text" name="github_url" defaultValue={editingItem?.github_url || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">URL Démo en direct</label>
                    <input type="text" name="live_url" defaultValue={editingItem?.live_url || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Indicateurs clés / Metrics (séparés par des virgules)</label>
                    <input type="text" name="tech_details" defaultValue={editingItem?.tech_details?.join(', ') || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" placeholder="ex: +31% conversion, 4 sources unifiées" />
                  </div>

                  {/* Dynamic screenshot URL editor */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Captures d'écran (URLs)</label>
                      <button
                        type="button"
                        onClick={() => setScreenshotUrls((prev) => [...prev, ''])}
                        className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20 font-mono"
                      >
                        + Ajouter
                      </button>
                    </div>
                    <div className="space-y-3">
                      {screenshotUrls.map((url, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-1.5">
                            <input
                              type="text"
                              value={url}
                              onChange={(e) => {
                                const updated = [...screenshotUrls];
                                updated[idx] = e.target.value;
                                setScreenshotUrls(updated);
                              }}
                              placeholder="https://exemple.com/capture.png"
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 text-sm"
                            />
                            {/* Live thumbnail preview */}
                            {url.trim() && (
                              <div className="relative h-16 w-28 overflow-hidden rounded-lg border border-slate-700">
                                <img
                                  src={url.trim()}
                                  alt="aperçu"
                                  className="h-full w-full object-cover"
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setScreenshotUrls((prev) => prev.filter((_, i) => i !== idx))}
                            className="mt-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-2 text-xs text-red-400 hover:bg-red-500/20"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {screenshotUrls.length === 0 && (
                        <p className="text-xs text-slate-600 italic">Aucune capture — cliquez sur + Ajouter</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="is_published" defaultChecked={!!editingItem?.is_published} className="h-5 w-5 rounded-md border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0" />
                    <label className="text-sm font-semibold text-slate-200">Publier le projet (rendre visible sur le portfolio)</label>
                  </div>
                </>
              )}

              {activeTab === 'experiences' && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Entreprise</label>
                      <input type="text" name="company" required defaultValue={editingItem?.company || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Poste occupé</label>
                        <button onClick={(e) => handleTranslateField(e, 'input[name="position"]')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                      </div>
                      <input type="text" name="position" required defaultValue={editingItem?.position || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Date de début</label>
                      <input type="text" name="start_date" required defaultValue={editingItem?.start_date || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" placeholder="ex: 2024" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Date de fin</label>
                      <input type="text" name="end_date" defaultValue={editingItem?.end_date || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" placeholder="ex: 2026 (laisser vide si en cours)" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Slug unique (ex: banque-data-analyst)</label>
                    <input type="text" name="slug" required defaultValue={editingItem?.slug || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 font-mono" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                      <button onClick={(e) => handleTranslateField(e, 'textarea[name="description"]')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                    </div>
                    <textarea name="description" required defaultValue={editingItem?.description || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 h-28" />
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="is_current" defaultChecked={!!editingItem?.is_current} className="h-5 w-5 rounded-md border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0" />
                    <label className="text-sm font-semibold text-slate-200">Poste en cours d'activité</label>
                  </div>
                </>
              )}

              {activeTab === 'education' && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">École / Université</label>
                      <input type="text" name="school_name" required defaultValue={editingItem?.school_name || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Diplôme / Degré</label>
                        <button onClick={(e) => handleTranslateField(e, 'input[name="degree"]')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                      </div>
                      <input type="text" name="degree" required defaultValue={editingItem?.degree || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Date de début</label>
                      <input type="text" name="start_date" required defaultValue={editingItem?.start_date || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Date de fin</label>
                      <input type="text" name="end_date" defaultValue={editingItem?.end_date || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Domaine d'études</label>
                      <button onClick={(e) => handleTranslateField(e, 'input[name="field_of_study"]')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                    </div>
                    <input type="text" name="field_of_study" defaultValue={editingItem?.field_of_study || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" placeholder="ex: Data Science et Informatique" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                      <button onClick={(e) => handleTranslateField(e, 'textarea[name="description"]')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                    </div>
                    <textarea name="description" defaultValue={editingItem?.description || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 h-28" />
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="is_current" defaultChecked={!!editingItem?.is_current} className="h-5 w-5 rounded-md border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0" />
                    <label className="text-sm font-semibold text-slate-200">Études en cours</label>
                  </div>
                </>
              )}

              {activeTab === 'certifications' && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Titre de la Certification</label>
                        <button onClick={(e) => handleTranslateField(e, 'input[name="title"]')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                      </div>
                      <input type="text" name="title" required defaultValue={editingItem?.title || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Organisme Émetteur</label>
                        <button onClick={(e) => handleTranslateField(e, 'input[name="issuer"]')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                      </div>
                      <input type="text" name="issuer" required defaultValue={editingItem?.issuer || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Date d'obtention (AAAA-MM-JJ)</label>
                      <input type="date" name="issue_date" defaultValue={editingItem?.issue_date || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Date d'expiration (optionnel)</label>
                      <input type="date" name="expiry_date" defaultValue={editingItem?.expiry_date || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Durée (ex: 6 semaines)</label>
                      <input type="text" name="duration_label" defaultValue={editingItem?.duration_label || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">ID du justificatif / Credential ID</label>
                      <input type="text" name="credential_id" defaultValue={editingItem?.credential_id || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">URL de validation (LinkedIn/Organisme)</label>
                    <input type="text" name="credential_url" defaultValue={editingItem?.credential_url || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">URL Image du diplôme / certificat</label>
                    <input type="text" name="certificate_image_url" defaultValue={editingItem?.certificate_image_url || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                      <button onClick={(e) => handleTranslateField(e, 'textarea[name="description"]')} className="text-[10px] text-cyan-400 hover:underline">✨ Traduire en EN</button>
                    </div>
                    <textarea name="description" defaultValue={editingItem?.description || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 h-20" />
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="is_featured" defaultChecked={!!editingItem?.is_featured} className="h-5 w-5 rounded-md border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0" />
                    <label className="text-sm font-semibold text-slate-200">Mettre en avant sur la page d'accueil</label>
                  </div>
                </>
              )}

              {activeTab === 'skills' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">Nom de la compétence</label>
                    <input type="text" name="name" required defaultValue={editingItem?.name || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 font-bold font-mono" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">Catégorie associée</label>
                    <select name="category_id" defaultValue={editingItem?.category_id || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100">
                      <option value="">Sélectionner une catégorie...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">URL Icône (optionnel)</label>
                    <input type="text" name="icon_url" defaultValue={editingItem?.icon_url || ''} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 font-mono" />
                  </div>
                </>
              )}

              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 font-mono">
                  {formError}
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-xl bg-cyan-400 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50 transition"
                >
                  {formLoading ? 'ENREGISTREMENT...' : 'SAUVEGARDER'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-700 bg-transparent px-6 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900"
                >
                  ANNULER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
