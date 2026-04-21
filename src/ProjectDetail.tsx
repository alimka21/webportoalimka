import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { supabase } from './lib/supabase';
import { parseImageUrl } from './lib/utils';
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ExternalLink, ArrowLeft, Loader2, Copy, Check } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fbData = docSnap.data();
          setProject({ 
            id: docSnap.id, 
            ...fbData,
            supportUrls: (fbData.supportUrls || []).map((url: string) => parseImageUrl(url)),
            imageUrl: parseImageUrl(fbData.imageUrl)
          });
        } else {
          console.error("No such document in Firebase!");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Navbar showBack={true} />
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar showBack={true} />
        <div className="pt-32 pb-24 max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-error mb-4">Proyek tidak ditemukan</h1>
          <Link to="/projects" className="text-primary hover:underline">
            Kembali ke daftar proyek
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = project.type === 'paid';

  const handleCopyPrompt = async () => {
    if (!project.promptText) return;
    try {
      await navigator.clipboard.writeText(project.promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin prompt: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar showBack={true} />
      
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Link to="/projects" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold uppercase tracking-wider mb-8">
            <ArrowLeft size={16} /> Kembali ke Koleksi
          </Link>
        </div>

        <article className={`bg-surface-container-lowest rounded-[2rem] overflow-hidden border ${isPaid ? 'border-primary/20 shadow-xl shadow-primary/5' : 'border-outline-variant/10 shadow-lg'} p-8 md:p-12 mb-12`}>
          
          <header className="mb-10 text-center">
             <div className="inline-flex items-center gap-2 mb-6">
                <span className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm border ${
                    isPaid ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container text-on-surface-variant border-outline-variant/20'
                  }`}>
                    {isPaid ? 'Eksklusif (Beli)' : 'Gratis'}
                </span>
             </div>
             <h1 className={`text-3xl md:text-5xl font-extrabold mb-6 leading-tight ${isPaid ? 'text-primary' : 'text-on-surface'}`}>
                {project.title}
             </h1>
          </header>

          <figure className="relative w-full max-w-3xl mx-auto mb-12 rounded-2xl overflow-hidden bg-surface-container shadow-md border border-outline-variant/10">
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-auto max-h-[500px] object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/800/500';
              }}
            />
          </figure>

          <div className="prose prose-lg md:prose-xl text-on-surface-variant max-w-none mb-12 whitespace-pre-wrap leading-relaxed">
            {project.description}
          </div>

          {project.promptText && (
            <div className="mb-12 bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm relative group max-w-3xl mx-auto">
              <div className="flex justify-between items-center bg-surface-container-high px-6 py-3 border-b border-outline-variant/10">
                <span className="text-sm font-bold text-on-surface uppercase tracking-wider">Detail / Prompt</span>
                <button 
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-container-highest transition-colors text-primary"
                >
                  {copied ? <><Check size={14} className="text-green-500" /> Tersalin</> : <><Copy size={14} /> Salin Teks</>}
                </button>
              </div>
              <div className="p-6 text-sm md:text-base font-mono text-on-surface-variant whitespace-pre-wrap overflow-x-auto max-h-[400px] overflow-y-auto">
                {project.promptText}
              </div>
            </div>
          )}

          {project.supportUrls && project.supportUrls.length > 0 && (
            <div className="mb-12 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-on-surface mb-8 text-center">Galeri Penunjang</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {project.supportUrls.map((url: string, idx: number) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="relative rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm block hover:shadow-md transition-shadow group">
                    <div className="aspect-[4/3] bg-surface-container">
                       <img 
                          src={url} 
                          alt={`Support ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/640/480';
                          }}
                        />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-outline-variant/10 border-dashed">
            <a 
              href={project.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex-1 inline-flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${
                isPaid 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/30 hover:bg-primary/90' 
                  : 'bg-secondary text-on-secondary shadow-lg hover:bg-secondary/90'
              }`}
            >
              Buka Tautan Proyek <ExternalLink size={20} />
            </a>
            
            {isPaid && (
              <a 
                href="https://lynk.id/alimkadigital" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-widest transition-all border-2 border-primary/20 text-primary hover:bg-primary/5"
              >
                Beli via Lynk.id
              </a>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
