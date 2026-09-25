'use client';

import { RealtimeListener } from '@/app/components/RealtimeListener';
import { signOut } from '@/app/login/actions';
import { type AdminPayload, buildAdminPayload, isCrudTable, listToInput } from '@/lib/admin-payload';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { translateFrToEn } from '@/lib/translate';
import {
  Award,
  BarChart3,
  Briefcase,
  Edit3,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ConfirmModal } from '../components/admin/ConfirmModal';
import { ImageUploadPicker } from '../components/admin/ImageUploadPicker';
import { ToastContainer, ToastMessage, ToastType } from '../components/admin/ToastNotification';

/**
 * Cookie based client, shared with the server so that proxy.ts and
 * /api/revalidate can verify the same session (see lib/supabase/browser.ts).
 * Resolves to `null` during SSR and when Supabase is not configured.
 */
const supabase = getSupabaseBrowserClient();

type UserSession = {
  id: string;
  email?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'experiences' | 'education' | 'skills' | 'certifications' | 'metrics' | 'profile' | 'security'
  >('overview');

  // Security Credentials form state
  const [newLoginEmail, setNewLoginEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [secLoading, setSecLoading] = useState(false);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // General lists
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
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
      } catch {
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

  // The route guard lives in proxy.ts; this covers a session lost mid-visit.
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

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
        { data: metricsData },
      ] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('experiences').select('*').order('start_date', { ascending: false }),
        supabase.from('education').select('*').order('start_date', { ascending: false }),
        supabase.from('skills').select('*, categories ( id, name )').order('name', { ascending: true }),
        supabase.from('certifications').select('*').order('issue_date', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('metrics').select('*').order('created_at', { ascending: true }),
      ]);

      const projectsList = projectsData || [];
      const experiencesList = experiencesData || [];
      const educationList = educationData || [];
      const skillsList = skillsData || [];
      const certificationsList = certificationsData || [];
      const metricsList = metricsData || [];

      setProjects(projectsList);
      setExperiences(experiencesList);
      setEducation(educationList);
      setSkills(skillsList);
      setCertifications(certificationsList);
      setMetrics(metricsList);
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

  const handleLogout = async () => {
    // Server Action: clears the auth cookies, then redirects to /login.
    await signOut();
  };

  const triggerRevalidation = async () => {
    try {
      await fetch('/api/revalidate', { method: 'POST' });
    } catch {}
    router.refresh();
  };

  // Update Login Email
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    if (!newLoginEmail || newLoginEmail.trim() === '') {
      addToast('warning', 'Email requis', 'Veuillez saisir une adresse email valide.');
      return;
    }

    if (newLoginEmail === user.email) {
      addToast('info', 'Aucune modification', 'L’adresse email saisie est identique à votre email actuel.');
      return;
    }

    setSecLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ email: newLoginEmail });
      if (error) {
        addToast('error', 'Échec de mise à jour', error.message);
      } else {
        addToast(
          'success',
          'Email mis à jour',
          'Votre adresse email de connexion a été modifiée avec succès.'
        );
        if (data.user?.email) {
          setUser({ ...user, email: data.user.email });
        }
      }
    } catch (err: any) {
      addToast('error', 'Erreur', err.message || 'Impossible de mettre à jour l’email.');
    } finally {
      setSecLoading(false);
    }
  };

  // Update Login Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    if (!newPassword || newPassword.length < 6) {
      addToast('warning', 'Mot de passe trop court', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      addToast('error', 'Mots de passe non identiques', 'La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    setSecLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        addToast('error', 'Échec de mise à jour', error.message);
      } else {
        addToast('success', 'Mot de passe mis à jour !', 'Votre nouveau mot de passe de connexion a été enregistré.');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      addToast('error', 'Erreur', err.message || 'Impossible de mettre à jour le mot de passe.');
    } finally {
      setSecLoading(false);
    }
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
        triggerRevalidation();
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
    // Always reset media state so a previous project's images never leak into
    // the next create/edit form (uploads are stored outside the DOM form).
    setProjectMainImage(activeTab === 'projects' ? item?.image_url || '' : '');
    setScreenshotUrls(
      activeTab === 'projects' && Array.isArray(item?.screenshots) ? item.screenshots : []
    );
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
            triggerRevalidation();
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

    if (!isCrudTable(activeTab)) {
      setFormLoading(false);
      return;
    }

    // `buildAdminPayload` owns the form → database column mapping and validates
    // required fields; see lib/admin-payload.ts + supabase/schema.sql.
    let data: AdminPayload;
    try {
      data = buildAdminPayload(activeTab, new FormData(e.currentTarget), {
        imageUrl: projectMainImage,
        screenshots: screenshotUrls,
      });
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.message || 'Formulaire incomplet.');
      addToast('error', 'Champ obligatoire manquant', err.message);
      return;
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
        triggerRevalidation();
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

  // proxy.ts already redirects unauthenticated visitors to /login, so this
  // branch is only reached when the session expires while the dashboard is open.
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a14] px-4 text-cyan-400">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <div className="text-center font-mono space-y-4">
          <div className="w-8 h-8 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest font-semibold text-slate-400">
            Session expirée — redirection vers la connexion...
          </p>
          <Link href="/login" className="text-xs font-bold text-cyan-400 underline">
            Se reconnecter
          </Link>
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
      ed.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.field_of_study?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.degree?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSkills = skills.filter((s) => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredCertifications = certifications.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issuer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMetrics = metrics.filter(
    (m) =>
      m.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans pb-24">
      {/* Admin-only: refreshes every open dashboard when the database changes. */}
      <RealtimeListener />
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
            { id: 'metrics', label: 'Métriques & KPIs', count: metrics.length, Icon: BarChart3 },
            { id: 'profile', label: 'Profil', Icon: User },
            { id: 'security', label: 'Sécurité & Identifiants', Icon: KeyRound },
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
        {activeTab !== 'overview' && activeTab !== 'profile' && activeTab !== 'security' && (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <p className="text-[11px] text-slate-400 mt-0.5">Avec upload direct d'images</p>
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
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Éditer le profil</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Photo, bio et coordonnées</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 text-left hover:bg-slate-800/80 transition group flex items-start gap-3"
                >
                  <KeyRound className="w-5 h-5 text-slate-400 shrink-0 mt-0.5 group-hover:text-cyan-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Sécurité & Identifiants</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Email et mot de passe de connexion</p>
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
                    <p className="text-[11px] font-mono text-slate-400">
                      {e.start_date}
                      {e.end_date ? ` → ${e.end_date}` : e.is_current ? ' → Présent' : ''}
                    </p>
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
                        {ed.start_date}
                        {ed.end_date ? ` → ${ed.end_date}` : ed.is_current ? ' → Présent' : ''}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{ed.degree}</h3>
                      <p className="text-xs text-slate-300">{ed.school_name}</p>
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
                      {s.categories?.name && (
                        <p className="text-[10px] text-slate-400">{s.categories.name}</p>
                      )}
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
                          {c.issuer}
                        </span>
                        {c.issue_date && (
                          <span className="text-[10px] text-slate-400 font-mono">{c.issue_date}</span>
                        )}
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

        {/* METRICS & KPIS TAB */}
        {activeTab === 'metrics' && (
          <div className="space-y-4 animate-fadeIn">
            {filteredMetrics.length === 0 ? (
              <div className="text-center py-16 bg-[#0a0f1d] rounded-2xl border border-slate-800 space-y-3">
                <BarChart3 className="w-8 h-8 mx-auto text-slate-500" />
                <h3 className="text-sm font-bold text-white">Aucune métrique personnalisée</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Par défaut, les 4 métriques réelles calculées depuis votre base (projets, expériences, compétences, certifications) sont affichées sur votre portfolio. Ajoutez une métrique personnalisée ci-dessous pour surcharger l'affichage.
                </p>
                <button
                  onClick={() => openForm()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
                >
                  + Ajouter une métrique / KPI
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredMetrics.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {m.change || 'KPI Réel'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{m.icon_type || 'database'}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white font-mono mt-1">{m.value}</h3>
                      <p className="text-xs font-bold text-slate-200">{m.label}</p>
                      {m.description && (
                        <p className="text-[11px] text-slate-400 leading-relaxed">{m.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => openForm(m)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Éditer</span>
                      </button>
                      <button
                        onClick={() => requestDelete('metrics', m.id, m.label)}
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

        {/* SECURITY & CREDENTIALS TAB */}
        {activeTab === 'security' && (
          <div className="max-w-3xl mx-auto animate-fadeIn space-y-6">
            {/* EMAIL UPDATE CARD */}
            <div className="rounded-3xl border border-slate-800 bg-[#0a0f1d] p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Adresse Email de Connexion</h3>
                  <p className="text-xs text-slate-400">Modifiez l'adresse email d'accès au terminal d'administration</p>
                </div>
              </div>

              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                    Email Actuel
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/90 text-xs font-mono text-cyan-400 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{user?.email || 'Non défini'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                    Nouvelle Adresse Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newLoginEmail}
                    onChange={(e) => setNewLoginEmail(e.target.value)}
                    placeholder="nouvelle-adresse@exemple.com"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={secLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-md hover:from-cyan-500 hover:to-blue-500 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{secLoading ? 'Mise à jour...' : 'Mettre à jour l’email'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* PASSWORD UPDATE CARD */}
            <div className="rounded-3xl border border-slate-800 bg-[#0a0f1d] p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Mot de passe Administrateur</h3>
                  <p className="text-xs text-slate-400">Définissez un nouveau mot de passe sécurisé (minimum 6 caractères)</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                      Nouveau Mot de Passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                      Confirmer le Mot de Passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={secLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-md hover:from-cyan-500 hover:to-blue-500 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{secLoading ? 'Modification...' : 'Modifier le mot de passe'}</span>
                  </button>
                </div>
              </form>
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
                        Résumé (affiché sur la carte projet)
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
                        Contexte / Étude de cas (page détail)
                      </label>
                      <button
                        type="button"
                        onClick={(e) => handleTranslateField(e, '#project-content')}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Traduire 🇫🇷 ➔ 🇬🇧</span>
                      </button>
                    </div>
                    <textarea
                      id="project-content"
                      name="content"
                      rows={4}
                      defaultValue={editingItem?.content || ''}
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
                      defaultValue={listToInput(editingItem?.tech_details)}
                      placeholder="Python, SQL, PowerBI, Supabase"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Indicateurs & résultats (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      name="metrics"
                      defaultValue={listToInput(editingItem?.metrics)}
                      placeholder="+31% conversion, 4 sources unifiées"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Date de début *
                      </label>
                      <input
                        type="text"
                        name="start_date"
                        required
                        defaultValue={editingItem?.start_date || ''}
                        placeholder="2024-03 ou Mars 2024"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Date de fin
                      </label>
                      <input
                        type="text"
                        name="end_date"
                        defaultValue={editingItem?.end_date || ''}
                        placeholder="Laisser vide si poste actuel"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Slug (URL du parcours)
                      </label>
                      <input
                        type="text"
                        name="slug"
                        defaultValue={editingItem?.slug || ''}
                        placeholder="Généré automatiquement si vide"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="is_current"
                        name="is_current"
                        defaultChecked={editingItem ? !!editingItem.is_current : true}
                        className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                      />
                      <label htmlFor="is_current" className="text-xs font-bold text-slate-200">
                        Poste en cours
                      </label>
                    </div>
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
                      defaultValue={editingItem?.school_name || ''}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Domaine d'études
                    </label>
                    <input
                      type="text"
                      name="field_of_study"
                      defaultValue={editingItem?.field_of_study || ''}
                      placeholder="Data & Informatique"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Date de début *
                      </label>
                      <input
                        type="text"
                        name="start_date"
                        required
                        defaultValue={editingItem?.start_date || ''}
                        placeholder="2021-09"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Date de fin
                      </label>
                      <input
                        type="text"
                        name="end_date"
                        defaultValue={editingItem?.end_date || ''}
                        placeholder="2024-06"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edu_is_current"
                      name="is_current"
                      defaultChecked={editingItem ? !!editingItem.is_current : false}
                      className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                    />
                    <label htmlFor="edu_is_current" className="text-xs font-bold text-slate-200">
                      Formation en cours
                    </label>
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
                    <select
                      name="category_id"
                      defaultValue={editingItem?.category_id || ''}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="">— Aucune catégorie —</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <p className="mt-1 text-[11px] text-amber-400/80">
                        Aucune catégorie en base : créez-les dans la table <code>categories</code> pour les regrouper.
                      </p>
                    )}
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
                      defaultValue={editingItem?.issuer || ''}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Date d'obtention
                      </label>
                      <input
                        type="date"
                        name="issue_date"
                        defaultValue={editingItem?.issue_date || ''}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Durée / Validité
                      </label>
                      <input
                        type="text"
                        name="duration_label"
                        defaultValue={editingItem?.duration_label || ''}
                        placeholder="6 semaines"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Lien du certificat (vérification)
                    </label>
                    <input
                      type="text"
                      name="credential_url"
                      defaultValue={editingItem?.credential_url || ''}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingItem?.description || ''}
                      placeholder="Compétences validées, contenu de la formation..."
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_featured"
                      name="is_featured"
                      defaultChecked={editingItem ? !!editingItem.is_featured : true}
                      className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                    />
                    <label htmlFor="is_featured" className="text-xs font-bold text-slate-200">
                      Mettre en avant sur la page d'accueil
                    </label>
                  </div>
                </>
              )}

              {/* METRICS FORM FIELDS */}
              {activeTab === 'metrics' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Intitulé du KPI / Métrique *
                      </label>
                      <input
                        type="text"
                        name="label"
                        required
                        defaultValue={editingItem?.label || ''}
                        placeholder="ex: Projets Data Livrés"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Valeur / Chiffre Clé *
                      </label>
                      <input
                        type="text"
                        name="value"
                        required
                        defaultValue={editingItem?.value || ''}
                        placeholder="ex: 12 ou 98%"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Sous-titre / Tendance
                      </label>
                      <input
                        type="text"
                        name="change"
                        defaultValue={editingItem?.change || ''}
                        placeholder="ex: 100% Fonctionnels"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Type d'icône
                      </label>
                      <select
                        name="icon_type"
                        defaultValue={editingItem?.icon_type || 'database'}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="database">Database (Base de Données)</option>
                        <option value="hard-drive">HardDrive (Stockage & Expériences)</option>
                        <option value="zap">Zap (Arsenal & Outils)</option>
                        <option value="activity">Activity (Certifications & KPIs)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Ordre d'affichage
                    </label>
                    <input
                      type="number"
                      name="sort_order"
                      defaultValue={editingItem?.sort_order ?? 0}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Description explicative
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingItem?.description || ''}
                      placeholder="Contextualisation et détails de la métrique..."
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
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
