import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { supabase } from './lib/supabase';
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ExternalLink, ArrowLeft, Loader2 } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      if (!id) return;
      try {
        // Try Supabase
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
           console.warn("Supabase fetch project failed, trying Firebase fallback:", error);
           const docRef = doc(db, 'projects', id);
           const docSnap = await getDoc(docRef);
           if (docSnap.exists()) {
             setProject({ id: docSnap.id, ...docSnap.data() });
           } else {
             console.error("No such document in Firebase either!");
           }
        } else if (data) {
          setProject({
            id: data.id,
            title: data.title,
            description: data.description,
            imageUrl: data.image_url,
            link: data.link,
            type: data.type,
            createdAt: data.created_at,
            authorUid: data.author_uid
          });
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

  return (
    <div className="min-h-screen bg-surface">
      <Navbar showBack={true} />
      
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <Link to="/projects" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold uppercase tracking-wider mb-8">
            <ArrowLeft size={16} /> Kembali ke Koleksi
          </Link>
        </div>

        <div className={`bg-surface-container-lowest rounded-[2rem] overflow-hidden border ${isPaid ? 'border-primary/20 shadow-xl shadow-primary/5' : 'border-outline-variant/10 shadow-lg'}`}>
          <div className="aspect-video relative bg-surface-container">
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/1280/720';
              }}
            />
            <div className="absolute top-6 right-6">
               <span className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border flex items-center gap-2 ${
                  isPaid ? 'bg-gradient-to-r from-primary to-primary-fixed text-on-primary border-transparent' : 'bg-surface text-on-surface border-outline-variant/20'
                }`}>
                  {isPaid ? '⭐ Eksklusif' : '🎁 Gratis'}
                </span>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h1 className={`text-3xl md:text-4xl font-extrabold mb-6 ${isPaid ? 'text-primary' : 'text-on-surface'}`}>
              {project.title}
            </h1>
            
            <div className="prose prose-lg text-on-surface-variant max-w-none mb-12 whitespace-pre-wrap leading-relaxed">
              {project.description}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-outline-variant/10 border-dashed">
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
