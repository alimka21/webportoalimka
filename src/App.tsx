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
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { supabase } from './lib/supabase';

import { Navbar } from "./components/Navbar";
import { Footer, TikTokIcon } from "./components/Footer";

const Hero = () => {
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
            Guru Informatika
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface tracking-tighter leading-tight mb-6">
            Halo, Saya Muhammad Alimka
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant font-medium mb-8 leading-relaxed max-w-lg">
            Saya adalah Guru Mata Pelajaran Informatika di UPTD SMPN 6 Moncongloe, Maros. Saya memiliki tugas tambahan dan rekam jejak fokus di Bidang Pendidikan dan Teknologi. Mari berkenalan lebih lanjut dengan saya.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#projects" className="btn-primary text-white px-8 py-4 rounded-xl font-bold tracking-wide uppercase text-sm inline-flex items-center gap-2">
              Cek Projek
            </a>
            <a href="https://wa.me/6282335454864" target="_blank" rel="noopener noreferrer" className="px-8 py-4 border border-outline-variant rounded-xl font-bold tracking-wide uppercase text-sm text-primary hover:bg-surface-container-low transition-colors">
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
              src="https://lh3.googleusercontent.com/d/1baU393E_Z-tuJ2C9U82-5Ls4fmu5q5Hx" 
              alt="Profil Muhammad Alimka" 
              className="w-full h-full object-cover scale-x-[-1]"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
    </section>
  );
};

const About = () => {
  const socialLinks = [
    { icon: <Instagram size={18} />, href: "https://instagram.com/muh.alimka", label: "Instagram", color: "hover:bg-[#E4405F]" },
    { icon: <Facebook size={18} />, href: "https://facebook.com/muh.alimka", label: "Facebook", color: "hover:bg-[#1877F2]" },
    { icon: <TikTokIcon size={18} />, href: "https://tiktok.com/@muh.alimka", label: "TikTok", color: "hover:bg-[#000000]" },
    { icon: <Youtube size={18} />, href: "https://www.youtube.com/@gurualimka9743", label: "YouTube", color: "hover:bg-[#FF0000]" },
  ];

  return (
    <section id="about" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tighter text-on-surface mb-2">Tentang Saya</h2>
          <div className="h-1 w-16 bg-primary"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Main Bio Card + Identity Card Connected */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:col-span-3 flex flex-col gap-0 overflow-hidden rounded-3xl border border-outline-variant/10 shadow-sm"
          >
            {/* Bio Part */}
            <div className="bg-surface-container-lowest p-8 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-xl font-bold text-primary mb-4">Visi Pendidik Digital</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Sebagai pendidik di UPTD SMPN 6 Moncongloe, Maros, saya berdedikasi menjembatani celah antara pendidikan tradisional dan era digital. Saya percaya teknologi adalah katalisator pemberdayaan generasi masa depan Indonesia. Mari kita sama-sama mendorong Transformasi Digitalisasi Pembelajaran di Indonesia
                </p>
              </div>
              <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm flex-shrink-0">
                    <img 
                      src="https://lh3.googleusercontent.com/d/1baU393E_Z-tuJ2C9U82-5Ls4fmu5q5Hx" 
                      alt="Muhammad Alimka" 
                      className="w-full h-full object-cover scale-x-[-1]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-8 w-full">
                    <div>
                      <p className="text-base font-bold text-on-surface">Muhammad Alimka, S.Pd., M.Pd.</p>
                      <p className="text-sm text-on-surface-variant font-medium">PNS Guru Informatika</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {socialLinks.map((link, index) => (
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

            {/* Identity Part (Connected below) */}
            <div className="bg-primary text-on-primary p-8">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Email Utama</p>
                  <p className="text-sm font-medium">muh.alimka@gmail.com</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Tempat Tinggal</p>
                  <p className="text-sm font-medium">Makassar, Sulawesi Selatan</p>
                </div>
                <div className="flex-[2]">
                  <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Pekerjaan</p>
                  <p className="text-sm font-medium">Guru, Fasilitator, dan Inovator</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats/Quick Info Card */}
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
            <div className="h-px w-full bg-white/10"></div>
            <div className="py-2">
              <p className="text-4xl font-black text-primary-fixed">100+</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Pelatihan & Workshop</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Qualifications = () => {
  const education = [
    { 
      year: "Tahun 2021 - 2023", 
      title: "S2 - Magister Pendidikan", 
      major: "Pendidikan Teknik Informatika dan Komputer",
      institution: "Universitas Negeri Makassar" 
    },
    { 
      year: "Tahun 2013 - 2018", 
      title: "S1 - Sarjana Pendidikan", 
      major: "Pendidikan Teknik Informatika dan Komputer",
      institution: "Universitas Negeri Makassar" 
    },
    { 
      year: "Tahun 2010 - 2013", 
      title: "Sekolah Menengah Atas (SMA)", 
      institution: "SMAN 1 Sabbangparu, Kab. Wajo" 
    },
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
          {/* Education Column */}
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
                  {/* Timeline Dot */}
                  <div className="absolute -left-[51px] top-0 w-5 h-5 rounded-full bg-surface border-4 border-primary shadow-sm z-10"></div>
                  
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 hover:shadow-lg hover:border-primary/20 transition-all group">
                    <span className="inline-block text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                      {item.year}
                    </span>
                    <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors mb-1">{item.title}</h4>
                    {item.major && <p className="text-sm text-on-surface font-medium mb-1">{item.major}</p>}
                    <p className="text-sm text-on-surface-variant font-medium">{item.institution}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Experience Column */}
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
                  {/* Timeline Dot */}
                  <div className="absolute -left-[51px] top-0 w-5 h-5 rounded-full bg-surface border-4 border-secondary shadow-sm z-10"></div>
                  
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 hover:shadow-lg hover:border-secondary/20 transition-all group">
                    <span className="inline-block text-[10px] font-black text-secondary bg-secondary/5 px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                      {item.year}
                    </span>
                    <h4 className="text-lg font-bold text-on-surface group-hover:text-secondary transition-colors mb-1">{item.title}</h4>
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
    { name: "Pedagogi Inovatif", desc: "Metodologi pengajaran kreatif berbasis teknologi modern untuk meningkatkan keterlibatan siswa.", percentage: 92, color: "from-amber-500 to-orange-600" },
    { name: "Pengembangan Kurikulum", desc: "Penyusunan kurikulum informatika yang relevan dengan kebutuhan industri masa kini.", percentage: 88, color: "from-rose-500 to-pink-600" },
    { name: "Public Speaking", desc: "Pelatihan dan presentasi efektif untuk menginspirasi pendidik dan memotivasi siswa.", percentage: 90, color: "from-violet-500 to-purple-600" },
  ];

  return (
    <section id="skillset" className="py-24 bg-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold tracking-tighter text-on-surface mb-4">Keahlian Utama</h2>
            <p className="text-on-surface-variant max-w-xl">Fokus kompetensi dalam mengintegrasikan teknologi ke dalam ekosistem pendidikan untuk masa depan yang lebih cerah.</p>
          </div>
          <div className="flex gap-2">
            <div className="w-12 h-1 bg-primary rounded-full"></div>
            <div className="w-4 h-1 bg-primary/30 rounded-full"></div>
            <div className="w-4 h-1 bg-primary/10 rounded-full"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative group h-full"
            >
              <div className="relative bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">{skill.name}</h4>
                  <div className="text-3xl font-black text-primary/20 group-hover:text-primary transition-colors">
                    {skill.percentage}%
                  </div>
                </div>
                
                <p className="text-sm text-on-surface-variant leading-relaxed mb-8 flex-grow">
                  {skill.desc}
                </p>
                
                {/* Progress Bar Container */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                    <span>Kompetensi</span>
                    <span>{skill.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Decorative CTA Card in Skillset */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="bg-primary text-on-primary p-10 rounded-[2.5rem] shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
            
            <h4 className="text-2xl font-bold mb-4 relative z-10">Ingin Berdiskusi?</h4>
            <p className="text-on-primary/80 mb-8 relative z-10">Mari berkolaborasi untuk menciptakan solusi pendidikan yang inovatif.</p>
            <a href="https://wa.me/6282335454864" target="_blank" rel="noopener noreferrer" className="bg-white text-primary px-8 py-4 rounded-2xl font-bold tracking-wide uppercase text-xs hover:bg-surface-container transition-colors relative z-10 shadow-lg active:scale-95">
              Hubungi Sekarang
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Awards = () => {
  const awards = [
    { title: "Duta Teknologi Kemendikbudristek", subtitle: "Tahun 2022 — Sekarang | Kemendikbudristek RI", highlight: true },
    { title: "Guru Inspiratif Nasional Jenjang SMP", subtitle: "Tahun 2022 | Kemendikbudristek RI" },
    { title: "Fasilitator Perencanaan Pembelajaran", subtitle: "Puskurjar Kemdikbudristek RI" },
    { title: "Fasilitator Guru Penggerak", subtitle: "Kemdikbudristek RI" },
    { title: "Fasilitator Koding dan Kecerdasan Artifisial (KKA)", subtitle: "Kemdikdasmen RI" },
    { title: "Fasilitator Digitalisasi Pembelajaran", subtitle: "Kemdikdasmen RI" },
    { title: "Guru Pejuang Digital Level 3", subtitle: "Kemdikdasmen RI" },
  ];

  return (
    <section id="awards" className="py-24 bg-surface-container-lowest relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface mb-4">Tugas Tambahan</h2>
          <div className="h-2 w-32 bg-primary rounded-full mx-auto mb-6"></div>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            Dedikasi dalam inovasi pendidikan dan pemberdayaan komunitas guru di tingkat nasional melalui berbagai peran strategis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Photo Grid Column */}
          <div className="flex flex-col gap-4 h-[500px] md:h-[650px]">
            <div className="flex gap-4 h-[55%]">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-[60%] rounded-3xl overflow-hidden shadow-lg relative group"
              >
                <img src="https://lh3.googleusercontent.com/d/1eaiF_NlF5r--JCxXEvOLJSdB1om-xVsz" alt="Tugas Tambahan 1" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="w-[40%] rounded-3xl overflow-hidden shadow-lg relative group"
              >
                <img src="https://lh3.googleusercontent.com/d/1sWNDHiQqyxvzauQA-rdhGAvbi2QlvSgS" alt="Tugas Tambahan 2" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              </motion.div>
            </div>
            <div className="flex gap-4 h-[45%]">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="w-[40%] rounded-3xl overflow-hidden shadow-lg relative group"
              >
                <img src="https://lh3.googleusercontent.com/d/1dmpq9L-IVNWE8hpu2Nos4nQwWYs0htvq" alt="Tugas Tambahan 3" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="w-[60%] rounded-3xl overflow-hidden shadow-lg relative group"
              >
                <img src="https://lh3.googleusercontent.com/d/14Uw1bpKJtk1W__VbcJeYBk6xMucExZbF" alt="Tugas Tambahan 4" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              </motion.div>
            </div>
          </div>

          {/* Simple Bullet List Column */}
          <div className="space-y-8">
            <div className="space-y-6">
              {awards.map((award, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="mt-2.5 w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                  <div className="flex-grow">
                    <h4 className={`text-lg font-bold leading-tight transition-colors ${award.highlight ? "text-primary" : "text-on-surface group-hover:text-primary"}`}>
                      {award.title}
                    </h4>
                    <p className="text-sm font-medium text-on-surface-variant/80 mt-1">
                      {award.subtitle}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

import { Link } from "react-router-dom";

const ProjectCard = ({ project, index }: { project: any, index: number, key?: string | number }) => {
  const isPaid = project.type === 'paid';
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`rounded-3xl overflow-hidden card-hover group flex flex-col relative shadow-sm hover:shadow-xl ${
        isPaid 
          ? 'bg-surface-container-lowest border-2 border-primary/30 before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:z-0' 
          : 'bg-surface-container-lowest border border-outline-variant/10'
      }`}
    >
      <div className="aspect-video overflow-hidden relative z-10">
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/640/360';
          }}
        />
        <div className="absolute top-4 right-4">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-1.5 ${
            isPaid ? 'bg-gradient-to-r from-primary to-primary-fixed text-on-primary' : 'bg-surface text-on-surface'
          }`}>
            {isPaid ? '⭐ Eksklusif' : '🎁 Gratis'}
          </span>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-grow relative z-10 bg-surface-container-lowest/80 backdrop-blur-sm">
        {/* Decorative line */}
        <div className={`absolute top-0 left-8 w-12 h-1 rounded-b-full ${isPaid ? 'bg-primary' : 'bg-secondary'}`}></div>
        
        <h4 className={`text-xl font-bold mb-3 line-clamp-2 mt-2 transition-colors ${
          isPaid ? 'text-primary' : 'text-on-surface group-hover:text-primary'
        }`}>{project.title}</h4>
        <p className="text-on-surface-variant text-sm mb-8 flex-grow leading-relaxed">{project.description}</p>
        
        <Link 
          to={`/projects/${project.id}`}
          className={`inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all py-3 px-6 rounded-xl w-full ${
            isPaid 
              ? 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary' 
              : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary'
          }`}
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
        console.error("Error fetching projects from Supabase: ", error);
        // Fallback to Firebase if Supabase fails (optional, but good for migration)
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProjects(projectsData);
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        // Map snake_case to camelCase for UI compatibility
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

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => fetchProjects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const paidProjects = projects.filter(p => p.type === 'paid');
  const freeProjects = projects.filter(p => p.type === 'free');

  return (
    <section id="projects" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter text-on-surface mb-2">Showcase Proyek Terbaru</h2>
            <div className="h-1 w-20 bg-secondary"></div>
          </div>
          <p className="text-on-surface-variant max-w-md">Kumpulan proyek digital pilihan yang berfokus pada inovasi pendidikan dan pemberdayaan guru.</p>
        </div>
        
        {projects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 border-dashed"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container mb-4 text-on-surface-variant/50">
              <span className="text-3xl font-black">?</span>
            </div>
            <p className="text-on-surface-variant font-medium text-lg">Belum ada proyek yang ditambahkan.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
            {/* Paid Projects Section */}
            {(paidProjects.length > 0 || projects.length > 0) && (
              <div className="bg-surface-container-lowest/40 rounded-3xl p-6 md:p-8 border border-outline-variant/10">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col mb-8"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner mb-4">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-on-surface mb-1">Koleksi Eksklusif</h3>
                    <p className="text-sm text-on-surface-variant font-medium">Proyek berbayar premium untuk memaksimalkan potensi edukasi</p>
                  </div>
                </motion.div>
                
                {paidProjects.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-outline-variant/20 rounded-2xl">
                    <p className="text-on-surface-variant text-sm">Belum ada proyek eksklusif</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {paidProjects.slice(0, 3).map((project, index) => (
                      <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                    {paidProjects.length > 3 && (
                      <div className="pt-4 text-center">
                        <Link to="/projects?type=paid" className="inline-flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider hover:underline">
                          Lihat Semua Koleksi Eksklusif <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Free Projects Section */}
            {(freeProjects.length > 0 || projects.length > 0) && (
              <div className="bg-surface-container-lowest/40 rounded-3xl p-6 md:p-8 border border-outline-variant/10 flex flex-col">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col mb-8"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner mb-4">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-on-surface mb-1">Sumber Daya Gratis</h3>
                    <p className="text-sm text-on-surface-variant font-medium">Akses langsung ke materi bernilai secara gratis</p>
                  </div>
                </motion.div>

                {freeProjects.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-outline-variant/20 rounded-2xl mt-auto">
                    <p className="text-on-surface-variant text-sm">Belum ada proyek gratis</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 flex-grow">
                    {freeProjects.slice(0, 3).map((project, index) => (
                      <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                    {freeProjects.length > 3 && (
                      <div className="pt-4 text-center mt-auto">
                        <Link to="/projects?type=free" className="inline-flex items-center gap-2 text-secondary font-bold text-sm uppercase tracking-wider hover:underline">
                          Lihat Semua Sumber Daya Gratis <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-primary text-on-primary">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-8 leading-tight"
        >
          Siap berkolaborasi dalam transformasi <br className="hidden md:block"/> pendidikan digital?
        </motion.h2>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/6282335454864" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-primary px-10 py-5 rounded-2xl font-bold tracking-wide uppercase text-sm hover:bg-surface-container transition-colors shadow-lg inline-flex items-center justify-center gap-2"
          >
            <Mail size={18} /> Hubungi via WhatsApp
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="mailto:muh.alimka@gmail.com" 
            className="border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold tracking-wide uppercase text-sm hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Mail size={18} /> Kirim Email
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  return (
    <div className="min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Qualifications />
        <Skillset />
        <Awards />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
