import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Type, 
  FileText, 
  Heading, 
  Settings, 
  LayoutDashboard,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Mail,
  User as UserIcon,
  Save,
  Loader2
} from 'lucide-react';
import { supabase } from './lib/supabase';
import Swal from 'sweetalert2';

import { Footer } from './components/Footer';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  type: 'free' | 'paid';
  createdAt: any;
  authorUid: string;
}

interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  profile_image: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  tiktok_url: string;
  linkedin_url: string;
  email_contact: string;
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'settings'>('projects');
  
  // Project Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState<'free' | 'paid'>('free');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<SiteSettings>({
    hero_title: '',
    hero_subtitle: '',
    profile_image: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    tiktok_url: '',
    linkedin_url: '',
    email_contact: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const ADMIN_EMAIL = "kpbgalimka@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching projects from Supabase: ", error);
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Project[];
          setProjects(projectsData);
        });
        return () => unsubscribe();
      } else {
        const mappedData = data.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            imageUrl: p.image_url,
            link: p.link,
            type: p.type,
            createdAt: p.created_at,
            authorUid: p.author_uid
        })) as Project[];
        setProjects(mappedData);
      }
    };

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('content')
        .eq('id', 'site_config')
        .single();
      
      if (data) {
        setSettings(data.content);
      }
    };

    fetchProjects();
    fetchSettings();

    const channel = supabase
      .channel('admin-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchProjects())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, () => fetchSettings())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Pastikan popup tidak diblokir oleh browser Anda.',
        confirmButtonColor: '#3B82F6'
      });
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const projectDataSupabase = {
      title,
      description,
      image_url: imageUrl,
      link,
      type,
      author_uid: user.uid,
    };

    const projectDataFirebase = {
      title,
      description,
      imageUrl,
      link,
      type,
      authorUid: user.uid,
    };

    try {
      if (editingId) {
        const { error: supabaseError } = await supabase
          .from('projects')
          .update(projectDataSupabase)
          .eq('id', editingId);

        if (supabaseError) {
          await updateDoc(doc(db, 'projects', editingId), projectDataFirebase);
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil diperbarui!',
          text: 'Proyek telah berhasil diubah.',
          timer: 2000,
          showConfirmButton: false
        });
        setEditingId(null);
      } else {
        const { error: supabaseError } = await supabase
          .from('projects')
          .insert([projectDataSupabase]);

        if (supabaseError) {
          await addDoc(collection(db, 'projects'), {
            ...projectDataFirebase,
            createdAt: serverTimestamp(),
          });
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil ditambahkan!',
          text: 'Proyek baru telah dipublikasikan.',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setTitle('');
      setDescription('');
      setImageUrl('');
      setLink('');
      setType('free');
    } catch (error) {
      console.error("Error saving project:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: 'Terjadi kesalahan sistem.'
      });
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({ content: settings })
        .eq('id', 'site_config');

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Pengaturan Disimpan',
        text: 'Informasi situs telah berhasil diperbarui.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal memperbarui pengaturan situs.'
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleEdit = (project: Project) => {
    setTitle(project.title);
    setDescription(project.description);
    setImageUrl(project.imageUrl);
    setLink(project.link);
    setType(project.type);
    setEditingId(project.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Proyek?',
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const { error: supabaseError } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (supabaseError) {
          await deleteDoc(doc(db, 'projects', id));
        }

        Swal.fire(
          'Terhapus!',
          'Proyek telah dihapus.',
          'success'
        );
      } catch (error) {
        console.error("Error deleting project:", error);
        Swal.fire('Error', 'Gagal menghapus proyek.', 'error');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">Memuat...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-outline-variant/10">
          <h1 className="text-2xl font-bold text-on-surface mb-6">Login Admin</h1>
          <p className="text-on-surface-variant mb-8">Silakan login menggunakan akun Google Anda untuk mengelola portofolio.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Login dengan Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-outline-variant/10">
          <h1 className="text-2xl font-bold text-error mb-4">Akses Ditolak</h1>
          <p className="text-on-surface-variant mb-8">Akun {user.email} tidak memiliki akses admin.</p>
          <button 
            onClick={handleLogout}
            className="bg-surface-container text-on-surface py-2 px-6 rounded-xl font-bold hover:bg-surface-container-high transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Admin Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-on-surface">Admin Panel</h1>
              <p className="text-xs text-on-surface-variant">{user.email}</p>
            </div>
            <div className="h-8 w-px bg-outline-variant/20 hidden md:block mx-2"></div>
            <nav className="flex gap-1 bg-surface-container p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <LayoutDashboard size={16} /> Proyek
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <Settings size={16} /> Situs
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors">Lihat Website</a>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold text-error hover:bg-error/10 px-4 py-2 rounded-xl transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        {activeTab === 'projects' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-1">
              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10 sticky top-24">
                <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                  {editingId ? <Edit2 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
                  {editingId ? 'Edit Proyek' : 'Tambah Proyek Baru'}
                </h2>
                
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Judul Proyek</label>
                    <div className="relative">
                      <Heading size={16} className="absolute left-3 top-3 text-on-surface-variant/50" />
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Contoh: Modul Ajar AI"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Deskripsi Singkat</label>
                    <div className="relative">
                      <FileText size={16} className="absolute left-3 top-3 text-on-surface-variant/50" />
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={3}
                        className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Deskripsi singkat..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Link Gambar (URL)</label>
                    <div className="relative">
                      <ImageIcon size={16} className="absolute left-3 top-3 text-on-surface-variant/50" />
                      <input 
                        type="url" 
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        required
                        className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Link Tujuan (URL)</label>
                    <div className="relative">
                      <LinkIcon size={16} className="absolute left-3 top-3 text-on-surface-variant/50" />
                      <input 
                        type="url" 
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        required
                        className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tipe Proyek</label>
                    <div className="relative">
                      <Type size={16} className="absolute left-3 top-3 text-on-surface-variant/50" />
                      <select 
                        value={type}
                        onChange={(e) => setType(e.target.value as 'free' | 'paid')}
                        className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                      >
                        <option value="free">Gratis (Free)</option>
                        <option value="paid">Berbayar (Paid)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button 
                      type="submit"
                      className="flex-1 bg-primary text-on-primary py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                      {editingId ? 'Simpan Perubahan' : 'Tambah Proyek'}
                    </button>
                    {editingId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setTitle('');
                          setDescription('');
                          setImageUrl('');
                          setLink('');
                          setType('free');
                        }}
                        className="px-4 bg-surface-container text-on-surface py-2.5 rounded-xl font-bold text-sm hover:bg-surface-container-high transition-colors"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center justify-between">
                Daftar Proyek Aktif
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">{projects.length} Unit</span>
              </h2>
              
              {projects.length === 0 ? (
                <div className="bg-surface-container-lowest p-12 rounded-3xl text-center border border-outline-variant/10 border-dashed">
                  <div className="bg-surface-container w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
                    <LayoutDashboard size={32} />
                  </div>
                  <p className="text-on-surface-variant font-medium">Belum ada proyek yang ditampilkan.</p>
                  <p className="text-on-surface-variant/60 text-xs mt-1">Mulai dengan menambahkan proyek baru di sisi kiri.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/10 shadow-sm flex flex-col group hover:shadow-md transition-all">
                      <div className="aspect-video w-full relative overflow-hidden bg-surface-container">
                        <img 
                          src={project.imageUrl} 
                          alt={project.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/640/360';
                          }}
                        />
                        <div className="absolute top-3 right-3 flex gap-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${project.type === 'paid' ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'}`}>
                            {project.type === 'paid' ? 'Berbayar' : 'Gratis'}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-on-surface text-lg mb-1 line-clamp-1">{project.title}</h3>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mb-6 flex-grow">{project.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-outline-variant/10">
                          <button 
                            onClick={() => handleEdit(project)}
                            className="flex items-center justify-center gap-2 py-2 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface rounded-xl text-xs font-bold transition-all"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(project.id)}
                            className="flex items-center justify-center gap-2 py-2 bg-error/5 hover:bg-error/15 text-error rounded-xl text-xs font-bold transition-all"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">Konfigurasi Situs</h2>
                <p className="text-on-surface-variant text-sm">Sesuaikan informasi publik yang tampil di halaman portofolio Anda.</p>
              </div>

              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm space-y-6">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Informasi Hero & Profil</h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Judul Utama (Hero Title)</label>
                      <input 
                        type="text" 
                        value={settings.hero_title}
                        onChange={(e) => setSettings({...settings, hero_title: e.target.value})}
                        className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Judul besar di halaman depan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Sub-judul (Hero Subtitle)</label>
                      <textarea 
                        value={settings.hero_subtitle}
                        onChange={(e) => setSettings({...settings, hero_subtitle: e.target.value})}
                        rows={3}
                        className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Kalimat perkenalan di bawah judul"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Foto Profil (URL Gambar)</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container flex-shrink-0">
                           <img 
                            src={settings.profile_image} 
                            alt="Profile Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/user/200/200'}
                           />
                        </div>
                        <input 
                          type="url" 
                          value={settings.profile_image}
                          onChange={(e) => setSettings({...settings, profile_image: e.target.value})}
                          className="w-full bg-surface-container px-4 py-3 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm space-y-6">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Media Sosial & Kontak</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Facebook size={18} className="absolute left-4 top-3.5 text-[#1877F2]" />
                      <input 
                        type="url" 
                        value={settings.facebook_url}
                        onChange={(e) => setSettings({...settings, facebook_url: e.target.value})}
                        className="w-full bg-surface-container pl-12 pr-4 py-3 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="URL Facebook"
                      />
                    </div>
                    <div className="relative">
                      <Instagram size={18} className="absolute left-4 top-3.5 text-[#E4405F]" />
                      <input 
                        type="url" 
                        value={settings.instagram_url}
                        onChange={(e) => setSettings({...settings, instagram_url: e.target.value})}
                        className="w-full bg-surface-container pl-12 pr-4 py-3 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="URL Instagram"
                      />
                    </div>
                    <div className="relative">
                      <Youtube size={18} className="absolute left-4 top-3.5 text-[#FF0000]" />
                      <input 
                        type="url" 
                        value={settings.youtube_url}
                        onChange={(e) => setSettings({...settings, youtube_url: e.target.value})}
                        className="w-full bg-surface-container pl-12 pr-4 py-3 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="URL Youtube"
                      />
                    </div>
                    <div className="relative">
                       <Globe size={18} className="absolute left-4 top-3.5 text-[#000000]" />
                       <input 
                        type="url" 
                        value={settings.tiktok_url}
                        onChange={(e) => setSettings({...settings, tiktok_url: e.target.value})}
                        className="w-full bg-surface-container pl-12 pr-4 py-3 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="URL TikTok"
                      />
                    </div>
                    <div className="relative">
                      <Globe size={18} className="absolute left-4 top-3.5 text-[#0A66C2]" />
                      <input 
                        type="url" 
                        value={settings.linkedin_url}
                        onChange={(e) => setSettings({...settings, linkedin_url: e.target.value})}
                        className="w-full bg-surface-container pl-12 pr-4 py-3 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="URL LinkedIn"
                      />
                    </div>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-3.5 text-on-surface-variant" />
                      <input 
                        type="email" 
                        value={settings.email_contact}
                        onChange={(e) => setSettings({...settings, email_contact: e.target.value})}
                        className="w-full bg-surface-container pl-12 pr-4 py-3 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Email Kontak"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSavingSettings ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Simpan Semua Pengaturan
                </button>
              </form>
            </div>

            <div className="hidden lg:block">
               <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm sticky top-24">
                  <h3 className="text-lg font-bold text-on-surface mb-6">Panduan Optimasi</h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <ImageIcon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">Gambar & Thumbnail</h4>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Gunakan URL gambar dari layanan cloud (seperti Imgur atau Google Drive yang sudah publik) untuk memastikan gambar tampil cepat.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">Favicon & Ikon</h4>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Untuk mengubah favicon situs, Anda perlu memperbarui file favicon.ico di folder repositori GitHub Anda secara manual.</p>
                      </div>
                    </div>
                    <div className="bg-surface-container p-6 rounded-2xl">
                       <p className="text-xs font-medium text-on-surface leading-loose">
                         "Perubahan pada bagian <strong>Situs</strong> akan langsung terlihat oleh pengunjung website Anda di halaman utama secara real-time."
                       </p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
