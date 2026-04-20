/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  GraduationCap, 
  Briefcase, 
  ArrowDown, 
  ArrowRight, 
  Mail, 
  Linkedin, 
  Github, 
  Instagram,
  Facebook,
  Youtube,
  Menu,
  X,
  Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { supabase } from './lib/supabase';

import { Navbar } from "./components/Navbar";
import { Footer, TikTokIcon } from "./components/Footer";

// Context-like hook for settings
const useSiteSettings = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('content')
        .eq('id', 'site_config')
        .single();
      
      if (data) {
        setSettings(data.content);
        // Update document title dynamically
        if (data.content.hero_title) {
          document.title = `${data.content.hero_title} | Alimka Digital Portofolio`;
        }
        // Update favicon dynamically if exists in settings
        if (data.content.profile_image) {
          const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          if (link) {
            link.href = data.content.profile_image;
          }
        }
      }
    };

    fetchSettings();

    const channel = supabase
      .channel('site-settings-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, () => fetchSettings())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return settings;
};

const Hero = ({ settings }: { settings: any }) => {
  const title = settings?.hero_title || "Halo, Saya Muhammad Alimka";
  const subtitle = settings?.hero_subtitle || "Saya adalah Guru Mata Pelajaran Informatika di UPTD SMPN 6 Moncongloe, Maros. Mari berkenalan lebih lanjut dengan saya.";
  const profileImage = settings?.profile_image || "https://lh3.googleusercontent.com/d/1baU393E_Z-tuJ2C9U82-5Ls4fmu5q5Hx";

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="order-2 md:order-1"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold tracking-widest uppercase mb-6">
            Pendidik & Kreator Digital
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface tracking-tighter leading-tight mb-6">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant font-medium mb-8 leading-relaxed max-w-lg">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#projects" className="btn-primary text-white px-8 py-4 rounded-xl font-bold tracking-wide uppercase text-sm inline-flex items-center gap-2">
              Cek Projek
            </a>
            <a href={`mailto:${settings?.email_contact || "muh.alimka@gmail.com"}`} className="px-8 py-4 border border-outline-variant rounded-xl font-bold tracking-wide uppercase text-sm text-primary hover:bg-surface-container-low transition-colors">
              Hubungi Saya
            </a>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="order-1 md:order-2 flex justify-center"
        >
          <div className="relative w-full max-w-md aspect-square bg-surface-container-high rounded-[2rem] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500 shadow-xl">
            <img 
              src={profileImage} 
              alt="Profil Muhammad Alimka" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/user/400/400'}
            />
          </div>
        </motion.div>
      </div>
      
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
    </section>
  );
};

const About = ({ settings }: { settings: any }) => {
  const socialLinks = [
    { icon: <Instagram size={18} />, href: settings?.instagram_url || "https://instagram.com/muh.alimka", label: "Instagram", color: "hover:bg-[#E4405F]" },
    { icon: <Facebook size={18} />, href: settings?.facebook_url || "https://facebook.com/muh.alimka", label: "Facebook", color: "hover:bg-[#1877F2]" },
    { icon: <TikTokIcon size={18} />, href: settings?.tiktok_url || "https://tiktok.com/@muh.alimka", label: "TikTok", color: "hover:bg-[#000000]" },
    { icon: <Youtube size={18} />, href: settings?.youtube_url || "https://www.youtube.com/@gurualimka9743", label: "YouTube", color: "hover:bg-[#FF0000]" },
  ];

  return (
    <section id="about" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tighter text-on-surface mb-2">Tentang Saya</h2>
          <div className="h-1 w-16 bg-primary"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:col-span-3 flex flex-col gap-0 overflow-hidden rounded-3xl border border-outline-variant/10 shadow-sm"
          >
            <div className="bg-surface-container-lowest p-8 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-xl font-bold text-primary mb-4">Visi Pendidik Digital</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Dedikasi saya adalah untuk menjembatani celah antara pendidikan tradisional dan era digital. Saya percaya teknologi adalah katalisator pemberdayaan generasi masa depan Indonesia. Mari kita sama-sama mendorong Transformasi Digitalisasi Pembelajaran di Indonesia.
                </p>
              </div>
              <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm flex-shrink-0">
                    <img 
                      src={settings?.profile_image || "https://lh3.googleusercontent.com/d/1baU393E_Z-tuJ2C9U82-5Ls4fmu5q5Hx"} 
                      alt="Muhammad Alimka" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/user/200/200'}
                    />
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-8 w-full">
                    <div>
                      <p className="text-base font-bold text-on-surface">Muhammad Alimka, S.Pd., M.Pd.</p>
                      <p className="text-sm text-on-surface-variant font-medium">Informasi & Teknologi Pendidikan</p>
                    </div>
                    
                    <div className="flex gap-2">
                       {socialLinks.filter(l => l.href).map((link, index) => (
                        <a
                          key={index}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant transition-all ${link.color} hover:text-white shadow-sm group`}
                          aria-label={link.label}
                        >
                          {link.icon}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary text-on-primary p-8">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Email Utama</p>
                  <p className="text-sm font-medium">{settings?.email_contact || "muh.alimka@gmail.com"}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Tempat Tinggal</p>
                  <p className="text-sm font-medium">Makassar, Sulawesi Selatan</p>
                </div>
                <div className="flex-[2]">
                  <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Pekerjaan</p>
                  <p className="text-sm font-medium">Pendidik & Kreator Digital</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-inverse-surface text-inverse-on-surface p-8 rounded-3xl shadow-xl flex flex-col justify-around text-center border border-white/5"
          >
            <div className="py-2">
              <p className="text-4xl font-black text-primary-fixed">7+</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Tahun Mengajar</p>
            </div>
            <div className="h-px w-full bg-white/10"></div>
            <div className="py-2">
              <p className="text-4xl font-black text-primary-fixed">1000+</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Peserta Pelatihan</p>
            </div>
            <div className="h-px w-full bg-white/10"></div>
            <div className="py-2">
              <p className="text-4xl font-black text-primary-fixed">20+</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Proyek Digital</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Qualifications = () => {
  const education = [
    { year: "2021 - 2023", title: "S2 - Magister Pendidikan", major: "Pendidikan Teknik Informatika dan Komputer", institution: "Universitas Negeri Makassar" },
    { year: "2013 - 2018", title: "S1 - Sarjana Pendidikan", major: "Pendidikan Teknik Informatika dan Komputer", institution: "Universitas Negeri Makassar" },
    { year: "2010 - 2013", title: "Sekolah Menengah Atas (SMA)", institution: "SMAN 1 Sabbangparu, Kab. Wajo" },
  ];

  const experience = [
    { year: "2019 — Sekarang", title: "Guru Informatika", institution: "UPTD SMPN 6 Moncongloe, Maros" },
    { year: "2026 — Sekarang", title: "Ketua MGMP Informatika", institution: "Kabupaten Maros" },
    { year: "2022 — Sekarang", title: "Ketua Komunitas Sapa Belajar Indonesia", institution: "SMPN 6 Moncongloe, Maros" },
  ];

  return (
    <section id="qualifications" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold tracking-tighter text-on-surface mb-4">Kualifikasi & Perjalanan</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">Rekam jejak akademis dan profesional dalam dunia pendidikan dan teknologi.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-2xl font-bold text-on-surface">Riwayat Pendidikan</h3>
            </div>
            
            <div className="relative border-l-2 border-outline-variant/30 ml-6 pl-10 space-y-12">
              {education.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -left-[51px] top-0 w-5 h-5 rounded-full bg-surface border-4 border-primary shadow-sm z-10"></div>
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 hover:shadow-lg transition-all group">
                    <span className="inline-block text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full mb-3 uppercase tracking-widest">{item.year}</span>
                    <h4 className="text-lg font-bold text-on-surface mb-1">{item.title}</h4>
                    {item.major && <p className="text-sm text-on-surface font-medium mb-1">{item.major}</p>}
                    <p className="text-sm text-on-surface-variant font-medium">{item.institution}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                <Briefcase size={24} />
              </div>
              <h3 className="text-2xl font-bold text-on-surface">Pengalaman Profesional</h3>
            </div>
            
            <div className="relative border-l-2 border-outline-variant/30 ml-6 pl-10 space-y-12">
              {experience.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -left-[51px] top-0 w-5 h-5 rounded-full bg-surface border-4 border-secondary shadow-sm z-10"></div>
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 hover:shadow-lg transition-all group">
                    <span className="inline-block text-[10px] font-black text-secondary bg-secondary/5 px-3 py-1 rounded-full mb-3 uppercase tracking-widest">{item.year}</span>
                    <h4 className="text-lg font-bold text-on-surface mb-1">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant font-medium">{item.institution}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Skillset = () => {
  const skills = [
    { name: "AI dalam Pendidikan", desc: "Pemanfaatan Prompt Engineering untuk efisiensi pengajaran dan pembuatan konten edukasi.", percentage: 95, color: "from-blue-500 to-indigo-600" },
    { name: "Digital Literacy Hub", desc: "Manajemen pusat literasi digital untuk memberdayakan komunitas sekolah dan masyarakat.", percentage: 90, color: "from-emerald-500 to-teal-600" },
    { name: "Pedagogi Inovatif", desc: "Metodologi pengajaran kreatif berbasis teknologi modern.", percentage: 92, color: "from-amber-500 to-orange-600" },
    { name: "Pengembangan Kurikulum", desc: "Penyusunan kurikulum informatika yang relevan dengan kebutuhan industri.", percentage: 88, color: "from-rose-500 to-pink-600" },
  ];

  return (
    <section id="skillset" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold tracking-tighter text-on-surface mb-12">Keahlian Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm"
            >
              <h4 className="text-lg font-bold text-on-surface mb-4">{skill.name}</h4>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">{skill.desc}</p>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5 }}
                  className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Awards = () => {
  const awards = [
    { title: "Duta Teknologi Kemendikbudristek", subtitle: "2022 — Sekarang", highlight: true },
    { title: "Guru Inspiratif Nasional Jenjang SMP", subtitle: "2022 | Kemendikbudristek RI" },
    { title: "Fasilitator Perencanaan Pembelajaran", subtitle: "Puskurjar Kemdikbudristek RI" },
    { title: "Fasilitator Guru Penggerak", subtitle: "Kemdikbudristek RI" },
    { title: "Fasilitator Koding dan Kecerdasan Artifisial", subtitle: "Kemdikdasmen RI" },
  ];

  return (
    <section id="awards" className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-black tracking-tighter text-center mb-16">Tugas Tambahan & Peran</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards.map((award, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`p-6 rounded-2xl border ${award.highlight ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface'}`}
            >
              <h4 className={`font-bold mb-1 ${award.highlight ? 'text-primary' : 'text-on-surface'}`}>{award.title}</h4>
              <p className="text-xs text-on-surface-variant">{award.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

import { Link } from "react-router-dom";

const ProjectCard = ({ project, index }: any) => {
  const isPaid = project.type === 'paid';
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-[2rem] overflow-hidden group flex flex-col border border-outline-variant/10 bg-white shadow-sm hover:shadow-xl transition-all`}
    >
      <div className="aspect-video overflow-hidden relative">
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
          onError={(e) => (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/640/360'}
        />
        <div className="absolute top-4 right-4">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg ${isPaid ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface border border-outline-variant/10'}`}>
            {isPaid ? '⭐ Berbayar' : '🎁 Gratis'}
          </span>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-grow bg-white">
        <h4 className="text-xl font-bold mb-3 text-on-surface line-clamp-1">{project.title}</h4>
        <p className="text-on-surface-variant text-sm mb-8 flex-grow line-clamp-2 leading-relaxed">{project.description}</p>
        <Link 
          to={`/projects/${project.id}`}
          className={`inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all py-3 px-6 rounded-xl w-full ${isPaid ? 'bg-primary text-on-primary hover:bg-primary/90' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}`}
        >
          Lihat Detail <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching projects: ", error);
        setLoading(false);
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
        setLoading(false);
      }
    };

    fetchProjects();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchProjects())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="projects" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter text-on-surface mb-2">Showcase Proyek</h2>
            <div className="h-1 w-20 bg-primary"></div>
          </div>
          <Link to="/projects" className="text-primary font-bold text-sm uppercase tracking-widest hover:underline flex items-center gap-2">Lihat Semua Proyek <ArrowRight size={16} /></Link>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 border-dashed">
            <p className="text-on-surface-variant font-medium">Belum ada proyek yang ditampilkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(0, 3).map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const Contact = ({ settings }: { settings: any }) => {
  return (
    <section id="contact" className="py-24 bg-primary text-on-primary">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-8 leading-tight"
        >
          Siap Berkolaborasi?
        </motion.h2>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={settings?.tiktok_url || "https://wa.me/6282335454864"} 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-primary px-10 py-5 rounded-2xl font-bold tracking-wide uppercase text-sm hover:bg-surface-container shadow-lg inline-flex items-center justify-center gap-2"
          >
            Hubungi via WhatsApp
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`mailto:${settings?.email_contact || "muh.alimka@gmail.com"}`} 
            className="border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold tracking-wide uppercase text-sm hover:bg-white/10 inline-flex items-center justify-center gap-2"
          >
            Kirim Email
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const settings = useSiteSettings();

  return (
    <div className="min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />
      <main>
        <Hero settings={settings} />
        <About settings={settings} />
        <Qualifications />
        <Skillset />
        <Awards />
        <Projects />
        <Contact settings={settings} />
      </main>
      <Footer />
    </div>
  );
}
