import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LogOut, Plus, Trash2, Edit2, Image as ImageIcon, Link as LinkIcon, Type, FileText, Heading, LayoutDashboard, PlusCircle, Trash, X } from 'lucide-react';
import { supabase } from './lib/supabase';
import Swal from 'sweetalert2';
import { parseImageUrl } from './lib/utils';

import { Footer } from './components/Footer';

interface Project {
  id: string;
  title: string;
  description: string;
  promptText?: string;
  supportUrls?: string[];
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
  const [promptText, setPromptText] = useState('');
  const [supportUrls, setSupportUrls] = useState<string[]>(['']);
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState<'free' | 'paid'>('free');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Tab state: 'dashboard' | 'form'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form'>('dashboard');

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
          const projectsData = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
              id: doc.id,
              ...d,
              supportUrls: (d.supportUrls || []).map((url: string) => parseImageUrl(url)),
              imageUrl: parseImageUrl(d.imageUrl),
            };
          }) as Project[];
          setProjects(projectsData);
        });
        return () => unsubscribe();
      } else {
        const mappedData = data.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            promptText: p.prompt_text,
            supportUrls: (p.support_urls || []).map((url: string) => parseImageUrl(url)),
            imageUrl: parseImageUrl(p.image_url),
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
      prompt_text: promptText,
      support_urls: supportUrls.filter(url => url.trim() !== '').map(url => parseImageUrl(url)),
      image_url: parseImageUrl(imageUrl),
      link,
      type,
      author_uid: user.uid,
    };

    const projectDataFirebase = {
      title,
      description,
      promptText,
      supportUrls: supportUrls.filter(url => url.trim() !== '').map(url => parseImageUrl(url)),
      imageUrl: parseImageUrl(imageUrl),
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
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Proyek telah diperbarui.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

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

        Swal.fire({
          title: 'Berhasil!',
          text: 'Proyek baru telah ditambahkan dan akan tampil di halaman utama.',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      }

      // Reset form
      setTitle('');
      setDescription('');
      setPromptText('');
      setSupportUrls(['']);
      setImageUrl('');
      setLink('');
      setType('free');
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Error saving project:", error);
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan proyek.',
        icon: 'error',
        confirmButtonText: 'Tutup'
      });
    }
  };

  const handleEdit = (project: Project) => {
    setTitle(project.title);
    setDescription(project.description);
    setPromptText(project.promptText || '');
    setSupportUrls(project.supportUrls?.length ? project.supportUrls : ['']);
    setImageUrl(project.imageUrl);
    setLink(project.link);
    setType(project.type);
    setEditingId(project.id);
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Proyek yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const { error: supabaseError } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (supabaseError) {
          console.warn("Supabase delete failed, trying Firebase fallback:", supabaseError);
          await deleteDoc(doc(db, 'projects', id));
        }

        Swal.fire(
          'Dihapus!',
          'Proyek telah dihapus.',
          'success'
        );
      } catch (error) {
        console.error("Error deleting project:", error);
        Swal.fire({
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat menghapus proyek.',
          icon: 'error'
        });
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

      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'dashboard' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard Proyek
          </button>
          <button 
            onClick={() => {
              setEditingId(null);
              setTitle('');
              setDescription('');
              setPromptText('');
              setSupportUrls(['']);
              setImageUrl('');
              setLink('');
              setType('free');
              setActiveTab('form');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'form' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <PlusCircle size={20} /> Tambah Proyek
          </button>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-grow">
          {activeTab === 'form' && (
            <div className="bg-surface-container-lowest p-8 md:p-10 rounded-[2rem] shadow-sm border border-outline-variant/10">
              <h2 className="text-2xl font-black text-on-surface mb-8 flex items-center gap-3 border-b border-outline-variant/10 pb-6">
                {editingId ? <Edit2 size={28} className="text-primary" /> : <Plus size={28} className="text-primary" />}
                {editingId ? 'Edit Data Proyek' : 'Buat Proyek Baru'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Detail Proyek / Teks Prompt Penuh</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-3 text-on-surface-variant/50" />
                  <textarea 
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    rows={8}
                    className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono whitespace-pre"
                    placeholder="Masukkan detail penjelasan yang panjang atau teks prompt gratis di sini..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Link Gambar Utama (URL) <span className="text-error">*</span></label>
                <div className="relative">
                  <ImageIcon size={18} className="absolute left-4 top-3.5 text-on-surface-variant/50" />
                  <input 
                    type="url" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(parseImageUrl(e.target.value))}
                    required
                    className="w-full bg-surface-container pl-12 pr-4 py-3.5 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                {imageUrl && (
                   <img src={imageUrl} alt="Preview" className="mt-4 h-24 rounded-lg object-cover border border-outline-variant/20" referrerPolicy="no-referrer" />
                )}
              </div>

              <div>
                 <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Link Foto Pendukung (Opsional)</label>
                    <button type="button" onClick={() => setSupportUrls([...supportUrls, ''])} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      <Plus size={12} /> Tambah Foto
                    </button>
                 </div>
                 <div className="space-y-3">
                   {supportUrls.map((url, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <ImageIcon size={18} className="absolute left-4 top-3.5 text-on-surface-variant/50" />
                            <input 
                              type="url" 
                              value={url}
                              onChange={(e) => {
                                const newUrls = [...supportUrls];
                                newUrls[index] = parseImageUrl(e.target.value);
                                setSupportUrls(newUrls);
                              }}
                              className="w-full bg-surface-container pl-12 pr-4 py-3.5 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                              placeholder="URL foto pendukung..."
                            />
                          </div>
                          {supportUrls.length > 1 && (
                            <button type="button" onClick={() => setSupportUrls(supportUrls.filter((_, i) => i !== index))} className="p-3.5 bg-error/10 text-error rounded-xl hover:bg-error/20 transition-colors">
                              <Trash size={18} />
                            </button>
                          )}
                        </div>
                        {url && (
                           <img src={url} alt="Preview Support" className="h-20 w-32 rounded-lg object-cover border border-outline-variant/20" referrerPolicy="no-referrer" />
                        )}
                      </div>
                   ))}
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Link Tujuan (URL) <span className="text-error">*</span></label>
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

              <div className="pt-8 flex gap-4 border-t border-outline-variant/10">
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-on-primary py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
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
                      setPromptText('');
                      setSupportUrls(['']);
                      setImageUrl('');
                      setLink('');
                      setType('free');
                      setActiveTab('dashboard');
                    }}
                    className="px-8 bg-surface-container text-on-surface py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-surface-container-high transition-colors"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-black text-on-surface">Dashboard Proyek ({projects.length})</h2>
                <button 
                  onClick={() => setActiveTab('form')}
                  className="hidden md:flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
                >
                  <Plus size={16} /> Buat Baru
                </button>
              </div>
              
              {projects.length === 0 ? (
                <div className="bg-surface-container-lowest p-12 rounded-[2rem] text-center border border-outline-variant/10 border-dashed">
                  <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6 text-on-surface-variant font-black text-3xl">!</div>
                  <p className="text-on-surface-variant text-lg">Belum ada proyek. Ayo mulai tambahkan proyek memukau!</p>
                  <button onClick={() => setActiveTab('form')} className="mt-6 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold">Tambah Proyek Pertama</button>
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-sm overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-container-low text-on-surface-variant font-black text-xs uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-5">Proyek</th>
                        <th className="px-6 py-5">Tipe & Link</th>
                        <th className="px-6 py-5 text-right flex-shrink-0 min-w[120px]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                          <td className="px-6 py-5 flex items-center gap-5">
                             <img 
                              src={project.imageUrl} 
                              alt={project.title} 
                              className="w-16 h-16 rounded-xl bg-surface border border-outline-variant/20 object-cover shrink-0 shadow-sm" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/100/100';
                              }}
                            />
                            <div className="max-w-[250px]">
                              <p className="font-bold text-base text-on-surface truncate whitespace-normal leading-tight line-clamp-2" title={project.title}>{project.title}</p>
                              <p className="text-xs text-on-surface-variant truncate whitespace-normal leading-tight line-clamp-1 mt-1.5" title={project.description}>{project.description}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top pt-8">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg inline-block mb-2 ${project.type === 'paid' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-secondary/10 text-secondary border border-secondary/20'}`}>
                              {project.type === 'paid' ? 'Paid / Beli' : 'Free / Gratis'}
                            </span>
                            <div>
                              <a href={project.link} target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary transition-colors text-xs flex items-center gap-1.5 font-semibold">
                                Buka Link <LinkIcon size={12} />
                              </a>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right align-top pt-8 min-w-[120px]">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleEdit(project)}
                                className="p-2.5 bg-surface-container-lowest hover:bg-surface-container text-on-surface rounded-xl transition-colors border border-outline-variant/20 shadow-sm"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(project.id)}
                                className="p-2.5 bg-error/5 hover:bg-error/10 text-error rounded-xl transition-colors border border-error/20 auto-pointer shadow-sm"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
