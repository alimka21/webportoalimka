import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, setDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LogOut, Plus, Trash2, Edit2, Image as ImageIcon, Link as LinkIcon, Type, FileText, Heading, LayoutDashboard, PlusCircle, Trash, X, Upload, Loader2, Settings } from 'lucide-react';
import { supabase } from './lib/supabase';
import Swal from 'sweetalert2';
import { parseImageUrl } from './lib/utils';
import { uploadAndCompressImage } from './lib/storage';
import { useHomepageSettings, HomepageSettings } from './hooks/useSettings';

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
  isFeatured?: boolean;
  createdAt: any;
  authorUid: string;
}

const CustomizePanel = () => {
  const { settings, loading } = useHomepageSettings();
  const [localSettings, setLocalSettings] = useState<HomepageSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSettings) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'homepage'), localSettings);
      Swal.fire('Berhasil!', 'Pengaturan halaman utama disimpan.', 'success');
    } catch {
      Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error');
    }
    setIsSaving(false);
  };

  const handleFileUploadLocal = async (event: React.ChangeEvent<HTMLInputElement>, key: keyof HomepageSettings | string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress(prev => ({ ...prev, [key]: true }));
    try {
      const url = await uploadAndCompressImage(file, 'settings');
      if(key.startsWith('awardImage-')) {
         const idx = parseInt(key.split('-')[1]);
         const newImages = [...(localSettings?.awardImages || [])];
         newImages[idx] = url;
         setLocalSettings(prev => prev ? ({ ...prev, awardImages: newImages }) : prev);
      } else {
         setLocalSettings(prev => prev ? ({ ...prev, [key]: url }) : prev);
      }
    } catch (error: any) {
      console.error("Local Upload Error:", error);
      Swal.fire('Gagal!', `Upload gagal: ${error?.message || 'Kesalahan koneksi'}`, 'error');
    } finally {
      setUploadProgress(prev => ({ ...prev, [key]: false }));
      event.target.value = '';
    }
  };

  const updateArrayItem = (key: 'education' | 'experience' | 'awards', index: number, field: string, value: any) => {
    if (!localSettings) return;
    const newArray = [...(localSettings[key] as any[])];
    newArray[index] = { ...newArray[index], [field]: value };
    setLocalSettings({ ...localSettings, [key]: newArray });
  };

  const addArrayItem = (key: 'education' | 'experience' | 'awards', emptyObj: any) => {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, [key]: [...(localSettings[key] as any[]) || [], emptyObj] });
  };

  const removeArrayItem = (key: 'education' | 'experience' | 'awards', index: number) => {
    if (!localSettings) return;
    const newArray = [...(localSettings[key] as any[])];
    newArray.splice(index, 1);
    setLocalSettings({ ...localSettings, [key]: newArray });
  };

  if (loading || !localSettings) return <div className="p-8 text-center text-on-surface-variant text-sm font-bold animate-pulse">Loading settings...</div>;

  return (
    <div className="bg-surface-container-lowest p-8 md:p-10 rounded-[2rem] shadow-sm border border-outline-variant/10">
      <h2 className="text-2xl font-black text-on-surface mb-8 flex items-center gap-3 border-b border-outline-variant/10 pb-6">
        <Settings size={28} className="text-primary" />
        Customize Halaman Utama
      </h2>

      <form onSubmit={handleSave} className="space-y-10">
        
        {/* HERO SECTION */}
        <div>
          <h3 className="text-sm font-black text-primary uppercase tracking-widest border-b border-outline-variant/10 pb-2 mb-4">Bagian Hero (Atas)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tagline</label>
              <input type="text" value={localSettings.heroTag} onChange={e => setLocalSettings({...localSettings, heroTag: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Judul Besar</label>
              <input type="text" value={localSettings.heroTitle} onChange={e => setLocalSettings({...localSettings, heroTitle: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Deskripsi Utama</label>
              <textarea rows={3} value={localSettings.heroDesc} onChange={e => setLocalSettings({...localSettings, heroDesc: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm resize-none" required />
            </div>
            <div>
               <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Foto Hero</label>
               <div className="flex gap-4 items-center">
                 {localSettings.heroImage && <img src={parseImageUrl(localSettings.heroImage)} className="w-20 h-20 rounded-xl object-cover" />}
                 <label className="relative flex items-center justify-center bg-primary/10 text-primary px-4 py-3 rounded-xl cursor-pointer hover:bg-primary hover:text-on-primary transition-colors text-sm font-bold">
                    {uploadProgress['heroImage'] ? <Loader2 size={16} className="animate-spin" /> : 'Ganti Foto'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUploadLocal(e, 'heroImage')} disabled={uploadProgress['heroImage']} />
                 </label>
                 <input type="url" value={localSettings.heroImage} onChange={e => setLocalSettings({...localSettings, heroImage: e.target.value})} className="flex-1 bg-surface-container px-4 py-2.5 rounded-xl text-sm" placeholder="Atau paste URL" />
               </div>
            </div>
          </div>
        </div>

        {/* ABOUT SECTION */}
        <div>
          <h3 className="text-sm font-black text-primary uppercase tracking-widest border-b border-outline-variant/10 pb-2 mb-4">Bagian Tentang Saya</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Teks Visi Pribadi</label>
              <textarea rows={4} value={localSettings.aboutVision} onChange={e => setLocalSettings({...localSettings, aboutVision: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm resize-none" required />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Nama Lengkap & Gelar</label>
                <input type="text" value={localSettings.aboutName} onChange={e => setLocalSettings({...localSettings, aboutName: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm" required />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Jabatan / Pekerjaan (Singkat)</label>
                <input type="text" value={localSettings.aboutJob} onChange={e => setLocalSettings({...localSettings, aboutJob: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm" required />
              </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Foto Profil (Kecil)</label>
               <div className="flex gap-4 items-center">
                 {localSettings.aboutImage && <img src={parseImageUrl(localSettings.aboutImage)} className="w-14 h-14 rounded-full object-cover" />}
                 <label className="relative flex items-center justify-center bg-primary/10 text-primary px-4 py-3 rounded-xl cursor-pointer hover:bg-primary hover:text-on-primary transition-colors text-sm font-bold">
                    {uploadProgress['aboutImage'] ? <Loader2 size={16} className="animate-spin" /> : 'Ganti Foto'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUploadLocal(e, 'aboutImage')} disabled={uploadProgress['aboutImage']} />
                 </label>
                 <input type="url" value={localSettings.aboutImage} onChange={e => setLocalSettings({...localSettings, aboutImage: e.target.value})} className="flex-1 bg-surface-container px-4 py-2.5 rounded-xl text-sm" placeholder="Atau paste URL" />
               </div>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div>
          <h3 className="text-sm font-black text-primary uppercase tracking-widest border-b border-outline-variant/10 pb-2 mb-4">Statistik & Angka Profil</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tahun Mengajar</label>
              <input type="text" value={localSettings.statYears || ''} onChange={e => setLocalSettings({...localSettings, statYears: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Peserta Pelatihan</label>
              <input type="text" value={localSettings.statTrainees || ''} onChange={e => setLocalSettings({...localSettings, statTrainees: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Proyek Digital</label>
              <input type="text" value={localSettings.statProjects || ''} onChange={e => setLocalSettings({...localSettings, statProjects: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Pelatihan & Workshop</label>
              <input type="text" value={localSettings.statWorkshops || ''} onChange={e => setLocalSettings({...localSettings, statWorkshops: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm" required />
            </div>
          </div>
        </div>

        {/* EDUCATION SECTION */}
        <div>
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-4">
             <h3 className="text-sm font-black text-primary uppercase tracking-widest">Riwayat Pendidikan</h3>
             <button type="button" onClick={() => addArrayItem('education', { year: '', title: '', major: '', institution: '' })} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20">+ Tambah</button>
          </div>
          <div className="space-y-4">
             {(localSettings.education || []).map((edu, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 relative flex flex-col gap-3">
                   <button type="button" onClick={() => removeArrayItem('education', idx)} className="absolute top-3 right-3 text-error hover:bg-error/10 p-1.5 rounded-md"><Trash2 size={14} /></button>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <div>
                         <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tahun</label>
                         <input type="text" value={edu.year} onChange={e => updateArrayItem('education', idx, 'year', e.target.value)} className="w-full bg-surface-container px-3 py-2 rounded-lg text-sm" placeholder="Contoh: 2021 - 2023" />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Gelar / Tingkat</label>
                         <input type="text" value={edu.title} onChange={e => updateArrayItem('education', idx, 'title', e.target.value)} className="w-full bg-surface-container px-3 py-2 rounded-lg text-sm" placeholder="Contoh: S2 - Magister Pendidikan" />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Jurusan (Opsional)</label>
                         <input type="text" value={edu.major} onChange={e => updateArrayItem('education', idx, 'major', e.target.value)} className="w-full bg-surface-container px-3 py-2 rounded-lg text-sm" placeholder="Contoh: Pendidikan Teknik..." />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Institusi / Universitas</label>
                         <input type="text" value={edu.institution} onChange={e => updateArrayItem('education', idx, 'institution', e.target.value)} className="w-full bg-surface-container px-3 py-2 rounded-lg text-sm" placeholder="Contoh: Universitas Negeri Makassar" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* EXPERIENCE SECTION */}
        <div>
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-4">
             <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Pengalaman Profesional</h3>
             <button type="button" onClick={() => addArrayItem('experience', { year: '', title: '', institution: '' })} className="text-xs bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg font-bold hover:bg-secondary/20">+ Tambah</button>
          </div>
          <div className="space-y-4">
             {(localSettings.experience || []).map((exp, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 relative flex flex-col gap-3">
                   <button type="button" onClick={() => removeArrayItem('experience', idx)} className="absolute top-3 right-3 text-error hover:bg-error/10 p-1.5 rounded-md"><Trash2 size={14} /></button>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                      <div>
                         <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tahun</label>
                         <input type="text" value={exp.year} onChange={e => updateArrayItem('experience', idx, 'year', e.target.value)} className="w-full bg-surface-container px-3 py-2 rounded-lg text-sm" placeholder="Contoh: 2019 — Sekarang" />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Posisi / Pekerjaan</label>
                         <input type="text" value={exp.title} onChange={e => updateArrayItem('experience', idx, 'title', e.target.value)} className="w-full bg-surface-container px-3 py-2 rounded-lg text-sm" placeholder="Contoh: Guru Informatika" />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Institusi / Tempat</label>
                         <input type="text" value={exp.institution} onChange={e => updateArrayItem('experience', idx, 'institution', e.target.value)} className="w-full bg-surface-container px-3 py-2 rounded-lg text-sm" placeholder="Contoh: UPTD SMPN 6 Moncongloe" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* AWARDS SECTION */}
        <div>
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-4">
             <h3 className="text-sm font-black text-primary uppercase tracking-widest">Tugas Tambahan & Penghargaan</h3>
             <button type="button" onClick={() => addArrayItem('awards', { title: '', subtitle: '', highlight: false })} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20">+ Tambah</button>
          </div>
          <div className="space-y-4">
             {(localSettings.awards || []).map((award, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 relative flex flex-col gap-3">
                   <button type="button" onClick={() => removeArrayItem('awards', idx)} className="absolute top-3 right-3 text-error hover:bg-error/10 p-1.5 rounded-md"><Trash2 size={14} /></button>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <div>
                         <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Judul / Peran</label>
                         <input type="text" value={award.title} onChange={e => updateArrayItem('awards', idx, 'title', e.target.value)} className="w-full bg-surface-container px-3 py-2 rounded-lg text-sm" placeholder="Contoh: Duta Teknologi" />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Instansi & Tahun (Subtitle)</label>
                         <input type="text" value={award.subtitle} onChange={e => updateArrayItem('awards', idx, 'subtitle', e.target.value)} className="w-full bg-surface-container px-3 py-2 rounded-lg text-sm" placeholder="Contoh: Tahun 2022 | Kemendikbudristek" />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2 mt-1">
                         <input type="checkbox" id={`hl-${idx}`} checked={award.highlight} onChange={e => updateArrayItem('awards', idx, 'highlight', e.target.checked)} className="w-4 h-4 text-primary rounded border-outline-variant/30" />
                         <label htmlFor={`hl-${idx}`} className="text-xs font-bold text-on-surface-variant cursor-pointer">Highlight Biru Utama?</label>
                      </div>
                   </div>
                </div>
             ))}

             {/* Award Images (Max 4) */}
             <div className="pt-4 border-t border-outline-variant/10">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Foto Kegitan Tugas Tambahan (Maksimal 4 Foto)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((idx) => {
                     const imgSrc = localSettings.awardImages?.[idx];
                     return (
                        <div key={idx} className="relative aspect-square border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center bg-surface hover:bg-surface-container-low transition-colors overflow-hidden group">
                           {imgSrc ? (
                              <img src={parseImageUrl(imgSrc)} className="w-full h-full object-cover" />
                           ) : (
                              <div className="text-center p-2 text-on-surface-variant opacity-50"><ImageIcon size={24} className="mx-auto mb-1" /><span className="text-[10px] font-bold uppercase">Kosong</span></div>
                           )}
                           
                           <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs backdrop-blur-sm">
                              {uploadProgress[`awardImage-${idx}`] ? <Loader2 size={16} className="animate-spin" /> : (imgSrc ? 'Ganti Foto' : 'Upload Foto')}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUploadLocal(e, `awardImage-${idx}`)} disabled={uploadProgress[`awardImage-${idx}`]} />
                           </label>
                        </div>
                     )
                  })}
                </div>
             </div>
          </div>
        </div>

        {/* CLOUDINARY CONFIG SECTION */}
        <div>
          <h3 className="text-sm font-black text-secondary uppercase tracking-widest border-b border-outline-variant/10 pb-2 mb-4">Pengaturan Upload Gambar Otomatis (Opsional)</h3>
          <p className="text-xs text-on-surface-variant mb-4">
            Untuk menggunakan <a href="https://cloudinary.com/users/register_free" target="_blank" rel="noreferrer" className="text-primary hover:underline">Cloudinary (Gratis & 100% Bebas Kuota)</a> daripada Firebase. Cukup daftarkan diri Anda, buat "Upload Preset" dengan pengaturan *"Unsigned"*.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Cloud Name</label>
              <input type="text" value={localSettings.cloudinaryCloudName || ''} onChange={e => setLocalSettings({...localSettings, cloudinaryCloudName: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm" placeholder="Contoh: dpvxxx" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Upload Preset (Mode: Unsigned)</label>
              <input type="text" value={localSettings.cloudinaryUploadPreset || ''} onChange={e => setLocalSettings({...localSettings, cloudinaryUploadPreset: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl text-sm" placeholder="Contoh: preset_portofolio" />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-primary text-on-primary py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          disabled={isSaving}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Perubahan Publik'}
        </button>
      </form>
    </div>
  );
};

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
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});
  
  // Tab state: 'dashboard' | 'form' | 'customize'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'customize'>('dashboard');

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, id: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress(prev => ({ ...prev, [id]: true }));
    try {
      const url = await uploadAndCompressImage(file, 'projects');
      setter(url);
    } catch (error: any) {
       console.error("Upload Error:", error);
       Swal.fire({
          title: 'Gagal Mengunggah!',
          text: `Kesalahan: ${error?.message || 'Gagal tersambung ke penyimpanan'}`,
          icon: 'error',
          confirmButtonText: 'Tutup'
        });
    } finally {
      setUploadProgress(prev => ({ ...prev, [id]: false }));
      // reset input
      event.target.value = '';
    }
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
      is_featured: isFeatured,
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
      isFeatured,
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
      setIsFeatured(false);
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
    setIsFeatured(project.isFeatured || false);
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

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'HAPUS SEMUA PROYEK?',
      text: "Tindakan ini sangat berbahaya! Semua proyek Anda (bahkan yang di Firebase dan Supabase) akan dihapus secara permanen dan tidak dapat dikembalikan!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'SAYA YAKIN, HAPUS SEMUA!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        // Delete all projects visually by deleting one by one
        // Wait, for Supabase we can do a bulk delete, but for firebase we need to delete docs individually
        
        // 1. Delete from Supabase bulk
        const { error: supabaseError } = await supabase
          .from('projects')
          .delete()
          .neq('id', 'dummy'); // Deletes all

        if (supabaseError) {
          console.warn("Supabase delete all failed:", supabaseError);
        }

        // 2. Delete from Firebase bulk
        for (const project of projects) {
           await deleteDoc(doc(db, 'projects', project.id));
        }

        Swal.fire({
          title: 'Dihapus!',
          text: 'Semua proyek telah dikosongkan.',
          icon: 'success',
          timer: 2000
        });
      } catch (error) {
        console.error("Error deleting all projects:", error);
        Swal.fire({
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat menghapus semua proyek.',
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
          <button 
            onClick={() => setActiveTab('customize')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'customize' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <Settings size={20} /> Customize Info
          </button>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-grow">
          {activeTab === 'customize' && <CustomizePanel />}
          
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
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Unggah Foto Utama <span className="text-error">*</span></label>
                <div className="flex flex-col gap-4">
                  <label className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${imageUrl ? 'border-primary/50 bg-primary/5' : 'border-outline-variant/30 bg-surface-container hover:bg-surface-container-high'}`}>
                    {uploadProgress['main'] ? (
                      <div className="flex flex-col items-center text-primary">
                        <Loader2 size={32} className="animate-spin mb-2" />
                        <span className="text-sm font-bold">Mengunggah...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="text-on-surface-variant/50 mb-2"/>
                        <span className="text-sm font-bold text-on-surface">Pilih file gambar dari komputer</span>
                        <span className="text-xs text-on-surface-variant mt-1">JPG, PNG (Maks 1MB)</span>
                        <input type="file" accept="image/*" className="hidden" required={!imageUrl && !editingId} onChange={(e) => handleFileUpload(e, setImageUrl, 'main')} disabled={uploadProgress['main']} />
                      </>
                    )}
                  </label>
                  {imageUrl && (
                    <div className="relative inline-block w-fit">
                      <img src={imageUrl} alt="Preview" className="h-40 w-auto rounded-xl object-cover border border-outline-variant/20 shadow-sm" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                 <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Unggah Foto Pendukung (Opsional)</label>
                    <button type="button" onClick={() => setSupportUrls([...supportUrls, ''])} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      <Plus size={12} /> Tambah Foto
                    </button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {supportUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <label className={`relative flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-colors overflow-hidden ${url ? 'border-primary/30 border-solid' : 'border-outline-variant/30 bg-surface-container hover:bg-surface-container-high'}`}>
                          {uploadProgress[`support_${index}`] ? (
                            <Loader2 size={24} className="animate-spin text-primary" />
                          ) : url ? (
                            <>
                               <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                 <span className="text-white text-xs font-bold flex items-center gap-1"><Edit2 size={14} /> Ganti</span>
                               </div>
                               <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (newUrl) => {
                                 const newUrls = [...supportUrls];
                                 newUrls[index] = newUrl;
                                 setSupportUrls(newUrls);
                               }, `support_${index}`)} disabled={uploadProgress[`support_${index}`]} />
                            </>
                          ) : (
                            <>
                              <Upload size={24} className="text-on-surface-variant/50 mb-1"/>
                              <span className="text-xs font-bold text-on-surface text-center px-2">Pilih File</span>
                               <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (newUrl) => {
                                 const newUrls = [...supportUrls];
                                 newUrls[index] = newUrl;
                                 setSupportUrls(newUrls);
                               }, `support_${index}`)} disabled={uploadProgress[`support_${index}`]} />
                            </>
                          )}
                        </label>
                        {supportUrls.length > 1 && (
                          <button 
                            type="button" 
                            onClick={(_) => setSupportUrls(supportUrls.filter((_, i) => i !== index))} 
                            className="absolute -top-2 -right-2 bg-error text-on-error p-1.5 rounded-full shadow-md hover:bg-error/90 transition-colors z-10"
                          >
                            <X size={14} />
                          </button>
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
                    <option value="paid">Eksklusif / Berbayar (Paid)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between mt-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface">Tampilkan di Beranda (Showcase)</label>
                  <p className="text-xs text-on-surface-variant mt-0.5">Beri centang jika proyek ini ingin ditampilkan di halaman utama web (maks 6 disarankan).</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-6 h-6 rounded border-outline-variant/30 text-primary focus:ring-primary"
                />
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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
                <h2 className="text-2xl font-black text-on-surface">Dashboard Proyek ({projects.length})</h2>
                <div className="flex gap-3">
                  {projects.length > 0 && (
                    <button 
                      onClick={handleDeleteAll}
                      className="flex items-center gap-2 bg-error/10 text-error px-4 py-2 rounded-xl text-sm font-bold hover:bg-error/20 transition-colors border border-error/20"
                    >
                      <Trash size={16} /> Kosongkan Semua
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveTab('form')}
                    className="hidden md:flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
                  >
                    <Plus size={16} /> Buat Baru
                  </button>
                </div>
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
