import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { parseImageUrl, extractIdFromSlug } from './lib/utils';
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ExternalLink, ArrowLeft, Loader2, Copy, Check, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import DOMPurify from 'dompurify';
import Swal from 'sweetalert2';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Image gallery state
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      if (!id) return;
      
      const parsedId = extractIdFromSlug(id);
      
      try {
        const docRef = doc(db, 'projects', parsedId);
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
  const allImages = [project.imageUrl, ...(project.supportUrls || [])];

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

  const handleNextBtn = () => {
    setCurrentImageIdx((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevBtn = () => {
    setCurrentImageIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar showBack={true} />
      
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <Link to="/projects" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold uppercase tracking-wider mb-8">
            <ArrowLeft size={16} /> Kembali ke Koleksi
          </Link>
        </div>

        <article className="bg-surface-container-lowest rounded-[2rem] overflow-hidden border border-outline-variant/10 shadow-lg p-8 md:p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* LIKES/IMAGE SECTION (LEFT) - Takes up 5 columns */}
            <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-32">
               <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-container shadow-md border border-outline-variant/10 group">
                 <img 
                   src={allImages[currentImageIdx]} 
                   alt={project.title} 
                   className="w-full h-full object-cover transition-opacity duration-300"
                   referrerPolicy="no-referrer"
                   onError={(e) => {
                     (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/800/800';
                   }}
                 />
                 
                 {/* Navigation Arrows */}
                 {allImages.length > 1 && (
                   <>
                     <button 
                       onClick={handlePrevBtn}
                       className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 text-on-surface hover:bg-surface shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                       aria-label="Previous Image"
                     >
                       <ChevronLeft size={24} />
                     </button>
                     <button 
                       onClick={handleNextBtn}
                       className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 text-on-surface hover:bg-surface shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                       aria-label="Next Image"
                     >
                       <ChevronRight size={24} />
                     </button>
                   </>
                 )}
               </div>

               {/* Thumbnails */}
               {allImages.length > 1 && (
                 <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                   {allImages.map((imgUrl, idx) => (
                     <button 
                       key={idx}
                       onClick={() => setCurrentImageIdx(idx)}
                       className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all snap-start ${
                         currentImageIdx === idx ? 'border-primary shadow-md' : 'border-outline-variant/20 opacity-70 hover:opacity-100'
                       }`}
                     >
                       <img 
                         src={imgUrl} 
                         alt={`Thumbnail ${idx + 1}`} 
                         className="w-full h-full object-cover"
                         referrerPolicy="no-referrer"
                       />
                     </button>
                   ))}
                 </div>
               )}
            </div>

            {/* CONTENT SECTION (RIGHT) - Takes up 7 columns */}
            <div className="lg:col-span-7 flex flex-col h-full">
               <header className="mb-6">
                 <div className="inline-flex items-center gap-2 mb-6">
                    <span className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm border ${
                        isPaid ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container text-on-surface-variant border-outline-variant/20'
                      }`}>
                        {isPaid ? 'Eksklusif (Beli)' : 'Gratis'}
                    </span>
                 </div>
                 <h1 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight ${isPaid ? 'text-primary' : 'text-on-surface'}`}>
                    {project.title}
                 </h1>
               </header>

               <div 
                 className="prose prose-lg text-on-surface-variant max-w-none mb-10 leading-relaxed"
                 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.description || '') }}
               />

               {project.promptText && project.promptText.trim() !== '' && (
                 <div className="mb-10 bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm relative group w-full">
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

               <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-auto border-t border-outline-variant/10 border-dashed">
                 <a 
                   href={project.link} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className={`flex-1 inline-flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold uppercase tracking-widest transition-all ${
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
                     className="flex-1 inline-flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold uppercase tracking-widest transition-all border-2 border-primary/20 text-primary hover:bg-primary/5"
                   >
                     Beli via Lynk.id
                   </a>
                 )}

                 <button
                   onClick={(e) => {
                     e.preventDefault();
                     const url = window.location.href;
                     navigator.clipboard.writeText(url);
                     Swal.fire({
                       icon: 'success',
                       title: 'Tautan disalin!',
                       toast: true,
                       position: 'top-end',
                       showConfirmButton: false,
                       timer: 3000
                     });
                   }}
                   className="inline-flex items-center justify-center p-4 min-w-[56px] rounded-xl font-bold transition-all border-2 border-outline-variant/20 text-on-surface-variant hover:bg-surface-container hover:text-primary hover:border-primary/30 group"
                   title="Bagikan Tautan"
                 >
                   <Share2 size={24} className="group-hover:scale-110 transition-transform" />
                 </button>
               </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
