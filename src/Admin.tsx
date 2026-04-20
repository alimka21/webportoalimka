import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LogOut, Plus, Trash2, Edit2, Image as ImageIcon, Link as LinkIcon, Type, FileText, Heading } from 'lucide-react';
import { supabase } from './lib/supabase';

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

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState<'free' | 'paid'>('free');
  const [editingId, setEditingId] = useState<string | null>(null);

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
        // Fallback to Firebase for admin
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

    fetchProjects();

    const channel = supabase
      .channel('admin-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchProjects())
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
      alert("Gagal login. Pastikan popup tidak diblokir.");
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        // Try Supabase first
        const { error: supabaseError } = await supabase
          .from('projects')
          .update(projectDataSupabase)
          .eq('id', editingId);

        if (supabaseError) {
          console.warn("Supabase update failed, trying Firebase fallback:", supabaseError);
          await updateDoc(doc(db, 'projects', editingId), projectDataFirebase);
        }
        setEditingId(null);
      } else {
        // Try Supabase first
        const { error: supabaseError } = await supabase
          .from('projects')
          .insert([projectDataSupabase]);

        if (supabaseError) {
          console.warn("Supabase insert failed, trying Firebase fallback:", supabaseError);
          await addDoc(collection(db, 'projects'), {
            ...projectDataFirebase,
            createdAt: serverTimestamp(),
          });
        }
      }

      // Reset form
      setTitle('');
      setDescription('');
      setImageUrl('');
      setLink('');
      setType('free');
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Gagal menyimpan proyek.");
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
    if (window.confirm("Apakah Anda yakin ingin menghapus proyek ini?")) {
      try {
        const { error: supabaseError } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (supabaseError) {
          console.warn("Supabase delete failed, trying Firebase fallback:", supabaseError);
          await deleteDoc(doc(db, 'projects', id));
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Gagal menghapus proyek.");
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
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-on-surface">Admin Panel</h1>
            <p className="text-xs text-on-surface-variant">{user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm font-medium text-primary hover:underline">Lihat Web</a>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-error hover:bg-error/10 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10 sticky top-24">
            <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              {editingId ? <Edit2 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
              {editingId ? 'Edit Proyek' : 'Tambah Proyek Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Deskripsi singkat tentang proyek ini..."
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
                  className="flex-1 bg-primary text-on-primary py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
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
          <h2 className="text-lg font-bold text-on-surface mb-4">Daftar Proyek ({projects.length})</h2>
          
          {projects.length === 0 ? (
            <div className="bg-surface-container-lowest p-8 rounded-3xl text-center border border-outline-variant/10 border-dashed">
              <p className="text-on-surface-variant">Belum ada proyek. Tambahkan proyek pertama Anda!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm flex flex-col">
                  <div className="aspect-video w-full relative bg-surface-container">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/640/360';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-sm ${project.type === 'paid' ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'}`}>
                        {project.type === 'paid' ? 'Berbayar' : 'Gratis'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-on-surface text-base mb-1 line-clamp-1">{project.title}</h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 flex-grow">{project.description}</p>
                    
                    <div className="flex gap-2 mt-auto pt-4 border-t border-outline-variant/10">
                      <button 
                        onClick={() => handleEdit(project)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-bold transition-colors"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-error/10 hover:bg-error/20 text-error rounded-lg text-xs font-bold transition-colors"
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
      </main>
      <Footer />
    </div>
  );
}
