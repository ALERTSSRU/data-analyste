'use client';

import { supabase } from '@/lib/portfolio';
import { translateFrToEn } from '@/lib/translate';
import {
  Award,
  Briefcase,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Lock,
  LogOut,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Wrench,
  Edit3,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConfirmModal } from '../components/admin/ConfirmModal';
import { ImageUploadPicker } from '../components/admin/ImageUploadPicker';
import { ToastContainer, ToastMessage, ToastType } from '../components/admin/ToastNotification';

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
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'experiences' | 'education' | 'skills' | 'certifications' | 'profile'
  >('overview');

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

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

  // Dynamic Image Upload States for forms
  const [projectMainImage, setProjectMainImage] = useState<string>('');
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string>('');

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Confirm Modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Stats / Counts
  const [counts, setCounts] = useState({
    projects: 0,
    experiences: 0,
    education: 0,
    skills: 0,
    certifications: 0,
  });

  // Translate text input field
  const handleTranslateField = async (e: React.MouseEvent, selector: string) => {
    e.preventDefault();
    const btn = e.currentTarget as HTMLButtonElement;
    const parent = btn.closest('div');
    const input = parent?.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    if (input && input.value) {
      const origText = btn.innerText;
      btn.innerText = 'Traduction...';
      btn.disabled = true;
      try {
        const trans = await translateFrToEn(input.value);
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
        addToast('success', 'Traduction réussie', 'Le texte a été traduis en anglais.');
      } catch (err) {
        addToast('error', 'Erreur de traduction', 'Le service de traduction est indisponible.');
      } finally {
        btn.innerText = origText;
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
        setProfileAvatarUrl(profileData.avatar_url || '');
      } else {
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
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      addToast('error', 'Erreur de chargement', err.message || 'Impossible de récupérer les données.');
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
        addToast('error', 'Échec de connexion', error.message);
      } else if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        addToast('success', 'Bienvenue !', 'Connexion au terminal administrateur réussie.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erreur d’authentification');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    addToast('info', 'Déconnexion', 'Vous avez été déconnecté de l’espace administrateur.');
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setFormLoading(true);
    setFormError('');

    try {
      const updatedProfile = {
        id: user.id,
        ...profile,
        avatar_url: profileAvatarUrl,
      };

      const { error } = await supabase.from('profiles').upsert(updatedProfile);

      if (error) {
        setFormError(error.message);
        addToast('error', 'Erreur de mise à jour', error.message);
      } else {
        addToast('success', 'Profil mis à jour', 'Vos informations ont été enregistrées.');
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
    if (activeTab === 'projects') {
      setProjectMainImage(item?.image_url || '');
      setScreenshotUrls(Array.isArray(item?.screenshots) ? item.screenshots : []);
    }
    setIsFormOpen(true);
  };

  // Trigger confirmation modal for deletion
  const requestDelete = (table: string, id: string, titleLabel: string) => {
    setConfirmState({
      isOpen: true,
      title: `Supprimer "${titleLabel}" ?`,
      message: 'Cette action est irréversible et retirera définitivement cet élément de votre portfolio.',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        if (!supabase) return;

        try {
          const { error } = await supabase.from(table).delete().eq('id', id);
          if (error) {
            addToast('error', 'Erreur de suppression', error.message);
          } else {
            addToast('success', 'Élément supprimé', 'La suppression a été effectuée.');
            fetchData();
          }
        } catch (err: any) {
          addToast('error', 'Erreur', err.message);
        }
      },
    });
  };

  // Submit handler for CRUD forms
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    setFormLoading(true);
    setFormError('');

    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key === 'is_published' || key === 'is_current' || key === 'is_featured') {
        data[key] = value === 'on' || value === 'true';
      } else {
        data[key] = value;
      }
    });

    if (activeTab === 'projects') {
      data.is_published = formData.get('is_published') === 'on';
      data.image_url = projectMainImage;
      data.screenshots = screenshotUrls.filter((u) => u && u.trim() !== '');

      const techDetailsStr = formData.get('tech_details') as string;
      data.tech_details = techDetailsStr ? techDetailsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];

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
        const { error: err } = await supabase
          .from(activeTab)
          .update(data)
          .eq('id', editingItem.id);
        error = err;
      } else {
        const { error: err } = await supabase.from(activeTab).insert([data]);
        error = err;
      }

      if (error) {
        setFormError(error.message);
        addToast('error', 'Erreur d’enregistrement', error.message);
      } else {
        setIsFormOpen(false);
        setEditingItem(null);
        addToast(
          'success',
          editingItem ? 'Modification enregistrée' : 'Création réussie',
          `L’élément a été sauvegardé avec succès.`
        );
        fetchData();
      }
    } catch (err: any) {
      setFormError(err.message || 'Une erreur est survenue lors de l’enregistrement.');
      addToast('error', 'Erreur', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a14] text-cyan-400">
        <div className="text-center font-mono space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest font-semibold text-slate-400">Chargement de la console admin...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show sleek professional login view
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060913] px-4 py-12">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-[#0a0f1d] p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mt-3">Terminal Administrateur</h1>
            <p className="text-xs text-slate-400 font-normal">Identifiez-vous pour gérer votre portfolio</p>
          </div>

          {authError && (

            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-300 text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                placeholder="admin@exemple.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 hover:from-cyan-500 hover:to-blue-500 transition duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{authLoading ? 'Authentification...' : 'Se connecter'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered lists based on search query
  const filteredProjects = projects.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExperiences = experiences.filter(
    (e) =>
      e.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEducation = education.filter(
    (ed) =>
      ed.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.degree?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSkills = skills.filter((s) => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredCertifications = certifications.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issuer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans pb-24">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Corporate Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#060913]/90 backdrop-blur-xl px-4 sm:px-8 py-3">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-900/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-tight">Console de Gestion</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                  PROD ● ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <span>Accéder au site</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tab Bar */}
      <div className="border-b border-slate-800/80 bg-[#080c19] px-4 sm:px-8 sticky top-[57px] z-30 overflow-x-auto">
        <div className="mx-auto max-w-7xl flex items-center gap-1.5 py-2 min-w-max">
          {[
            { id: 'overview', label: "Vue d'ensemble", Icon: LayoutDashboard },
            { id: 'projects', label: 'Projets', count: counts.projects, Icon: FolderKanban },
            { id: 'experiences', label: 'Expériences', count: counts.experiences, Icon: Briefcase },
            { id: 'education', label: 'Formations', count: counts.education, Icon: GraduationCap },
            { id: 'skills', label: 'Compétences', count: counts.skills, Icon: Wrench },
            { id: 'certifications', label: 'Certifications', count: counts.certifications, Icon: Award },
            { id: 'profile', label: 'Profil Administrateur', Icon: User },
          ].map((tab) => {
            const active = activeTab === tab.id;
            const IconComponent = tab.Icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      active ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-8 pt-8">
        {/* Search Bar for data lists */}
        {activeTab !== 'overview' && activeTab !== 'profile' && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-[#0a0f1d] p-3.5 rounded-2xl border border-slate-800/80">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Rechercher dans ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700/80 bg-slate-800/60 text-xs text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <button
              onClick={() => openForm()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-md hover:from-cyan-500 hover:to-blue-500 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="capitalize">Nouveau {activeTab.slice(0, -1)}</span>
            </button>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { title: 'Projets', count: counts.projects, Icon: FolderKanban, tab: 'projects' },
                { title: 'Expériences', count: counts.experiences, Icon: Briefcase, tab: 'experiences' },
                { title: 'Formations', count: counts.education, Icon: GraduationCap, tab: 'education' },
                { title: 'Compétences', count: counts.skills, Icon: Wrench, tab: 'skills' },
                { title: 'Certifications', count: counts.certifications, Icon: Award, tab: 'certifications' },
              ].map((card, i) => {
                const IconComp = card.Icon;
                return (
                  <div
                    key={i}
                    onClick={() => setActiveTab(card.tab as any)}
                    className="group cursor-pointer rounded-2xl border border-slate-800 bg-[#0a0f1d] p-4 hover:border-cyan-500/30 hover:bg-[#0c1224] transition shadow-md"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <IconComp className="w-5 h-5 text-cyan-400" />
                      <span className="text-[11px] text-cyan-400 opacity-0 group-hover:opacity-100 transition font-semibold">
                        Gérer ➔
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white font-mono">{card.count}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{card.title}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick action shortcuts */}
            <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Raccourcis d'administration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setActiveTab('projects');
                    openForm();
                  }}
                  className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-left hover:bg-cyan-500/10 transition group flex items-start gap-3"
                >
                  <FolderKanban className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Ajouter un projet</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Avec téléversement direct d'images</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('experiences');
                    openForm();
                  }}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 text-left hover:bg-slate-800/80 transition group flex items-start gap-3"
                >
                  <Briefcase className="w-5 h-5 text-slate-400 shrink-0 mt-0.5 group-hover:text-cyan-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Ajouter une expérience</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Poste, entreprise et missions</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 text-left hover:bg-slate-800/80 transition group flex items-start gap-3"
                >
                  <User className="w-5 h-5 text-slate-400 shrink-0 mt-0.5 group-hover:text-cyan-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Mettre à jour le profil</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Photo, bio et coordonnées</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-4 animate-fadeIn">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16 bg-[#0a0f1d] rounded-2xl border border-slate-800 space-y-3">
                <FolderKanban className="w-8 h-8 mx-auto text-slate-500" />
                <h3 className="text-sm font-bold text-white">Aucun projet trouvé</h3>
                <button
                  onClick={() => openForm()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
                >
                  + Ajouter un projet
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div className="space-y-3">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-full h-36 object-cover rounded-xl border border-slate-800 bg-slate-950"
                        />
                      ) : (
                        <div className="w-full h-36 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-600">
                          <FolderKanban className="w-8 h-8 opacity-40" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {p.category || 'Projet'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                            p.is_published ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {p.is_published ? '● Publié' : '○ Brouillon'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{p.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{p.summary}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-slate-800/80">
                      <button
                        onClick={() => openForm(p)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Éditer</span>
                      </button>
                      <button
                        onClick={() => requestDelete('projects', p.id, p.title)}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EXPERIENCES TAB */}
        {activeTab === 'experiences' && (
          <div className="space-y-3 animate-fadeIn">
            {filteredExperiences.length === 0 ? (
              <div className="text-center py-16 bg-[#0a0f1d] rounded-2xl border border-slate-800 space-y-3">
                <Briefcase className="w-8 h-8 mx-auto text-slate-500" />
                <h3 className="text-sm font-bold text-white">Aucune expérience enregistrée</h3>
              </div>
            ) : (
              filteredExperiences.map((e) => (
                <div
                  key={e.id}
                  className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{e.position}</h3>
                      <span className="text-cyan-400 font-semibold text-xs">@ {e.company}</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">{e.period || `${e.start_date} - ${e.end_date || 'Présent'}`}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openForm(e)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Éditer</span>
                    </button>
                    <button
                      onClick={() => requestDelete('experiences', e.id, `${e.position} @ ${e.company}`)}
                      className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* EDUCATION TAB */}
        {activeTab === 'education' && (
          <div className="space-y-4 animate-fadeIn">
            {filteredEducation.length === 0 ? (
              <div className="text-center py-16 bg-[#0a0f1d] rounded-2xl border border-slate-800 space-y-3">
                <GraduationCap className="w-8 h-8 mx-auto text-slate-500" />
                <h3 className="text-sm font-bold text-white">Aucune formation enregistrée</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEducation.map((ed) => (
                  <div
                    key={ed.id}
                    className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">
                        {ed.period || ed.start_date}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{ed.degree}</h3>
                      <p className="text-xs text-slate-300">{ed.institution || ed.school_name}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => openForm(ed)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Éditer</span>
                      </button>
                      <button
                        onClick={() => requestDelete('education', ed.id, ed.degree)}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-4 animate-fadeIn">
            {filteredSkills.length === 0 ? (
              <div className="text-center py-16 bg-[#0a0f1d] rounded-2xl border border-slate-800 space-y-3">
                <Wrench className="w-8 h-8 mx-auto text-slate-500" />
                <h3 className="text-sm font-bold text-white">Aucune compétence enregistrée</h3>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {filteredSkills.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-slate-800 bg-[#0a0f1d] px-3.5 py-2.5 flex items-center gap-3 shadow-sm"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{s.name}</p>
                      {s.category && <p className="text-[10px] text-slate-400">{s.category}</p>}
                    </div>
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={() => openForm(s)}
                        className="text-slate-400 hover:text-cyan-300 p-1"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => requestDelete('skills', s.id, s.name)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CERTIFICATIONS TAB */}
        {activeTab === 'certifications' && (
          <div className="space-y-4 animate-fadeIn">
            {filteredCertifications.length === 0 ? (
              <div className="text-center py-16 bg-[#0a0f1d] rounded-2xl border border-slate-800 space-y-3">
                <Award className="w-8 h-8 mx-auto text-slate-500" />
                <h3 className="text-sm font-bold text-white">Aucune certification enregistrée</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCertifications.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono">
                          {c.issuer || c.issuing_organization}
                        </span>
                        {c.date && <span className="text-[10px] text-slate-400 font-mono">{c.date}</span>}
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1">{c.title}</h3>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => openForm(c)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Éditer</span>
                      </button>
                      <button
                        onClick={() => requestDelete('certifications', c.id, c.title)}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && profile && (
          <div className="max-w-3xl mx-auto animate-fadeIn space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-[#0a0f1d] p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Profil Administrateur</h2>
                    <p className="text-xs text-slate-400">Informations publiques du portfolio</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-md hover:from-cyan-500 hover:to-blue-500 transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{formLoading ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>

              {/* Profile Avatar Upload Picker */}
              <ImageUploadPicker
                label="Photo de profil / Avatar"
                helperText="Sélectionnez une image de profil depuis vos fichiers"
                value={profileAvatarUrl}
                onChange={(url) => setProfileAvatarUrl(url)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Titre professionnel / Role
                  </label>
                  <input
                    type="text"
                    value={profile.role || profile.status_label || ''}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value, status_label: e.target.value })}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Slogan / Inroduction
                  </label>
                  <button
                    type="button"
                    onClick={(e) => handleTranslateField(e, '#profile-intro')}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Traduire 🇫🇷 ➔ 🇬🇧</span>
                  </button>
                </div>
                <input
                  id="profile-intro"
                  type="text"
                  value={profile.intro || ''}
                  onChange={(e) => setProfile({ ...profile, intro: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Biographie
                  </label>
                  <button
                    type="button"
                    onClick={(e) => handleTranslateField(e, '#profile-bio')}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Traduire 🇫🇷 ➔ 🇬🇧</span>
                  </button>
                </div>
                <textarea
                  id="profile-bio"
                  rows={4}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={profile.linkedin_url || ''}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="text"
                    value={profile.github_url || ''}
                    onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CRUD Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[9980] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#0a0f1d] p-6 sm:p-8 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white capitalize flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>{editingItem ? 'Modifier' : 'Ajouter un nouveau'} {activeTab.slice(0, -1)}</span>
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-bold text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* PROJECTS FORM FIELDS */}
              {activeTab === 'projects' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Titre du projet *
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        defaultValue={editingItem?.title || ''}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Slug (URL unique) *
                      </label>
                      <input
                        type="text"
                        name="slug"
                        required
                        defaultValue={editingItem?.slug || ''}
                        placeholder="mon-projet"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Catégorie
                      </label>
                      <input
                        type="text"
                        name="category"
                        defaultValue={editingItem?.category || 'Business Intelligence'}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="is_published"
                        name="is_published"
                        defaultChecked={editingItem ? editingItem.is_published : true}
                        className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                      />
                      <label htmlFor="is_published" className="text-xs font-bold text-slate-200">
                        Publier immédiatement sur le site
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        Résumé
                      </label>
                      <button
                        type="button"
                        onClick={(e) => handleTranslateField(e, '#project-summary')}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Traduire 🇫🇷 ➔ 🇬🇧</span>
                      </button>
                    </div>
                    <input
                      id="project-summary"
                      type="text"
                      name="summary"
                      defaultValue={editingItem?.summary || ''}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        Description
                      </label>
                      <button
                        type="button"
                        onClick={(e) => handleTranslateField(e, '#project-desc')}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Traduire 🇫🇷 ➔ 🇬🇧</span>
                      </button>
                    </div>
                    <textarea
                      id="project-desc"
                      name="description"
                      rows={3}
                      defaultValue={editingItem?.description || ''}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* MAIN IMAGE UPLOAD PICKER */}
                  <ImageUploadPicker
                    label="Image Principale de couverture"
                    helperText="Sélectionnez l'image d'illustration du projet depuis vos fichiers"
                    value={projectMainImage}
                    onChange={(url) => setProjectMainImage(url)}
                  />

                  {/* MULTIPLE SCREENSHOTS UPLOAD PICKER */}
                  <ImageUploadPicker
                    multiple
                    label="Captures d'écran & Galerie (Screenshots)"
                    helperText="Sélectionnez autant de captures d'écran que souhaité"
                    value={screenshotUrls}
                    onChange={(urls) => setScreenshotUrls(urls)}
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Technologies (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      name="tech_details"
                      defaultValue={
                        editingItem?.tech_details
                          ? Array.isArray(editingItem.tech_details)
                            ? editingItem.tech_details.join(', ')
                            : editingItem.tech_details
                          : ''
                      }
                      placeholder="Python, SQL, PowerBI, Supabase"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Lien GitHub
                      </label>
                      <input
                        type="text"
                        name="github_url"
                        defaultValue={editingItem?.github_url || ''}
                        placeholder="https://github.com/..."
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Lien Démo Live
                      </label>
                      <input
                        type="text"
                        name="live_url"
                        defaultValue={editingItem?.live_url || ''}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* EXPERIENCES FORM FIELDS */}
              {activeTab === 'experiences' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Entreprise *
                      </label>
                      <input
                        type="text"
                        name="company"
                        required
                        defaultValue={editingItem?.company || ''}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Poste / Intitulé *
                      </label>
                      <input
                        type="text"
                        name="position"
                        required
                        defaultValue={editingItem?.position || ''}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Période
                    </label>
                    <input
                      type="text"
                      name="period"
                      defaultValue={editingItem?.period || ''}
                      placeholder="2023 - Présent"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        Description
                      </label>
                      <button
                        type="button"
                        onClick={(e) => handleTranslateField(e, '#exp-desc')}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Traduire 🇫🇷 ➔ 🇬🇧</span>
                      </button>
                    </div>
                    <textarea
                      id="exp-desc"
                      name="description"
                      rows={4}
                      defaultValue={editingItem?.description || ''}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* EDUCATION FORM FIELDS */}
              {activeTab === 'education' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Diplôme / Formation *
                    </label>
                    <input
                      type="text"
                      name="degree"
                      required
                      defaultValue={editingItem?.degree || ''}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Établissement *
                    </label>
                    <input
                      type="text"
                      name="school_name"
                      required
                      defaultValue={editingItem?.school_name || editingItem?.institution || ''}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Période
                    </label>
                    <input
                      type="text"
                      name="period"
                      defaultValue={editingItem?.period || ''}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* SKILLS FORM FIELDS */}
              {activeTab === 'skills' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Compétence *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingItem?.name || ''}
                      placeholder="SQL, Python, PowerBI..."
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Catégorie
                    </label>
                    <input
                      type="text"
                      name="category"
                      defaultValue={editingItem?.category || 'Data Analysis'}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* CERTIFICATIONS FORM FIELDS */}
              {activeTab === 'certifications' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Titre de la certification *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={editingItem?.title || ''}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Organisme émetteur *
                    </label>
                    <input
                      type="text"
                      name="issuer"
                      required
                      defaultValue={editingItem?.issuer || editingItem?.issuing_organization || ''}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Date d'obtention
                      </label>
                      <input
                        type="text"
                        name="date"
                        defaultValue={editingItem?.date || editingItem?.issue_date || ''}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Durée / Validité
                      </label>
                      <input
                        type="text"
                        name="duration"
                        defaultValue={editingItem?.duration || ''}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700/80 bg-slate-800/60 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-md hover:from-cyan-500 hover:to-blue-500 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{formLoading ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
