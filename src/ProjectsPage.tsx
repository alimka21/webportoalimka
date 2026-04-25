import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, ArrowRight, Star, Share2 } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { parseImageUrl, generateSlug } from './lib/utils';
import Swal from 'sweetalert2';
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Link, useSearchParams } from "react-router-dom";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const typeFilter = searchParams.get("type") || "all";
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    document.title = "Koleksi Proyek | Alimka Digital";
    
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          imageUrl: parseImageUrl(d.imageUrl),
        };
      });
      setProjects(projectsData);
    }, (err) => {
      console.error("Error fetching projects from Firebase: ", err);
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-surface">
      <Navbar showBack={true} />
      
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface mb-6">Semua Proyek</h1>
          
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-on-surface-variant" />
              </div>
              <input 
                type="text" 
                placeholder="Cari proyek..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
              />
            </div>
            
            {/* Filter */}
            <div className="flex gap-2 p-1.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl w-full md:w-auto overflow-x-auto">
              <button 
                onClick={() => setSearchParams({ type: 'all' })}
                className={`flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${typeFilter === 'all' ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Semua
              </button>
              <button 
                onClick={() => setSearchParams({ type: 'paid' })}
                className={`flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${typeFilter === 'paid' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Eksklusif (Beli)
              </button>
              <button 
                onClick={() => setSearchParams({ type: 'free' })}
                className={`flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${typeFilter === 'free' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Gratis
              </button>
            </div>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 border-dashed">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container mb-4 text-on-surface-variant/50">
               <Search size={32} />
             </div>
             <p className="text-on-surface-variant font-medium text-lg">Tidak ada proyek yang sesuai dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => {
              const isPaid = project.type === 'paid';
              const plainDesc = (project.description || '').replace(/<[^>]+>/g, '').replace(/&[a-zA-Z0-9#]+;/g, ' ').trim();
              const truncatedDesc = plainDesc.length > 100 ? plainDesc.substring(0, 100) + '...' : plainDesc;
              const projectUrl = `/projects/${generateSlug(project.title, project.id)}`;
              return (
                <motion.div 
                  layout
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (index % 10) * 0.05 }}
                  className={`rounded-2xl overflow-hidden card-hover group flex flex-col relative shadow-sm hover:shadow-xl bg-surface-container-lowest border border-outline-variant/10`}
                >
                  <div className="aspect-square overflow-hidden relative z-10 bg-surface-container">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/400/400';
                      }}
                    />
                    {isPaid && (
                      <div className="absolute top-4 right-4 bg-primary text-on-primary p-2.5 rounded-full shadow-lg z-20" title="Proyek Eksklusif">
                        <Star size={18} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-grow relative z-10 bg-surface-container-lowest/90 backdrop-blur-sm">
                    <h4 className={`text-xl font-bold mb-3 line-clamp-2 transition-colors ${
                      isPaid ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                    }`}>{project.title}</h4>
                    <p className="text-on-surface-variant text-sm mb-4 flex-grow leading-relaxed">
                       {truncatedDesc}
                    </p>
                  </div>
                  <Link to={projectUrl} className="absolute inset-0 z-20">
                    <span className="sr-only">Lihat Detail {project.title}</span>
                  </Link>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = window.location.origin + projectUrl;
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
                    className="absolute bottom-6 right-6 z-30 p-2.5 bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary rounded-full transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                    title="Bagikan Proyek"
                  >
                    <Share2 size={18} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
