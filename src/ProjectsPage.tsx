import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, ArrowRight } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { supabase } from './lib/supabase';
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
    
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching projects from Supabase: ", error);
        // Fallback to Firebase
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProjects(projectsData);
        }, (err) => {
          console.error("Error fetching projects from Firebase: ", err);
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
        }));
        setProjects(mappedData);
      }
    };

    fetchProjects();

    const channel = supabase
      .channel('projects-page-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchProjects())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
            <div className="flex gap-2 p-1.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl w-full md:w-auto">
              <button 
                onClick={() => setSearchParams({ type: 'all' })}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${typeFilter === 'all' ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Semua
              </button>
              <button 
                onClick={() => setSearchParams({ type: 'paid' })}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${typeFilter === 'paid' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Eksklusif (Beli)
              </button>
              <button 
                onClick={() => setSearchParams({ type: 'free' })}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${typeFilter === 'free' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => {
              const isPaid = project.type === 'paid';
              return (
                <motion.div 
                  layout
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (index % 10) * 0.05 }}
                  className={`rounded-3xl overflow-hidden card-hover group flex flex-col relative shadow-sm hover:shadow-xl ${
                    isPaid 
                      ? 'bg-surface-container-lowest border-2 border-primary/30 before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:z-0' 
                      : 'bg-surface-container-lowest border border-outline-variant/10'
                  }`}
                >
                  <div className="aspect-video overflow-hidden relative z-10 bg-surface-container">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/640/360';
                      }}
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 ${
                        isPaid ? 'bg-gradient-to-r from-primary to-primary-fixed text-on-primary' : 'bg-surface text-on-surface'
                      }`}>
                        {isPaid ? '⭐ Eksklusif' : '🎁 Gratis'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow relative z-10 bg-surface-container-lowest/80 backdrop-blur-sm">
                    <h4 className={`text-xl font-bold mb-3 line-clamp-2 transition-colors ${
                      isPaid ? 'text-primary' : 'text-on-surface'
                    }`}>{project.title}</h4>
                    
                    <Link 
                      to={`/projects/${project.id}`}
                      className={`mt-auto inline-flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wider transition-all py-3 px-6 rounded-xl w-full ${
                        isPaid 
                          ? 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary' 
                          : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary'
                      }`}
                    >
                      Lihat Detail
                    </Link>
                  </div>
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
