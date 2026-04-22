import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface HomepageSettings {
  heroTag: string;
  heroTitle: string;
  heroDesc: string;
  heroImage: string;
  aboutVision: string;
  aboutName: string;
  aboutJob: string;
  aboutImage: string;
  statYears: string;
  statTrainees: string;
  statProjects: string;
  statWorkshops: string;
  education: { year: string; title: string; major: string; institution: string }[];
  experience: { year: string; title: string; institution: string }[];
  awards: { title: string; subtitle: string; highlight: boolean }[];
  awardImages: string[];
  instagramPosts?: { url: string; image: string }[];
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
}

export const defaultSettings: HomepageSettings = {
  heroTag: 'Guru Informatika',
  heroTitle: 'Halo, Saya Muhammad Alimka',
  heroDesc: 'Saya adalah Guru Mata Pelajaran Informatika di UPTD SMPN 6 Moncongloe, Maros. Saya memiliki tugas tambahan dan rekam jejak fokus di Bidang Pendidikan dan Teknologi. Mari berkenalan lebih lanjut dengan saya.',
  heroImage: 'https://lh3.googleusercontent.com/d/1baU393E_Z-tuJ2C9U82-5Ls4fmu5q5Hx',
  aboutVision: 'Sebagai pendidik di UPTD SMPN 6 Moncongloe, Maros, saya berdedikasi menjembatani celah antara pendidikan tradisional dan era digital. Saya percaya teknologi adalah katalisator pemberdayaan generasi masa depan Indonesia. Mari kita sama-sama mendorong Transformasi Digitalisasi Pembelajaran di Indonesia',
  aboutName: 'Muhammad Alimka, S.Pd., M.Pd.',
  aboutJob: 'PNS Guru Informatika',
  aboutImage: 'https://lh3.googleusercontent.com/d/1baU393E_Z-tuJ2C9U82-5Ls4fmu5q5Hx',
  statYears: '7+',
  statTrainees: '1000+',
  statProjects: '20+',
  statWorkshops: '100+',
  education: [
    { year: "Tahun 2021 - 2023", title: "S2 - Magister Pendidikan", major: "Pendidikan Teknik Informatika dan Komputer", institution: "Universitas Negeri Makassar" },
    { year: "Tahun 2013 - 2018", title: "S1 - Sarjana Pendidikan", major: "Pendidikan Teknik Informatika dan Komputer", institution: "Universitas Negeri Makassar" },
    { year: "Tahun 2010 - 2013", title: "Sekolah Menengah Atas (SMA)", major: "", institution: "SMAN 1 Sabbangparu, Kab. Wajo" },
  ],
  experience: [
    { year: "2019 — Sekarang", title: "Guru Informatika", institution: "UPTD SMPN 6 Moncongloe, Maros" },
    { year: "2026 — Sekarang", title: "Ketua MGMP Informatika", institution: "Kabupaten Maros" },
    { year: "2022 — Sekarang", title: "Ketua Komunitas Sapa Belajar Indonesia", institution: "SMPN 6 Moncongloe, Maros" },
  ],
  awards: [
    { title: "Duta Teknologi Kemendikbudristek", subtitle: "Tahun 2022 — Sekarang | Kemendikbudristek RI", highlight: true },
    { title: "Guru Inspiratif Nasional Jenjang SMP", subtitle: "Tahun 2022 | Kemendikbudristek RI", highlight: false },
    { title: "Fasilitator Perencanaan Pembelajaran", subtitle: "Puskurjar Kemdikbudristek RI", highlight: false },
    { title: "Fasilitator Guru Penggerak", subtitle: "Kemdikbudristek RI", highlight: false },
    { title: "Fasilitator Koding dan Kecerdasan Artifisial (KKA)", subtitle: "Kemdikdasmen RI", highlight: false },
    { title: "Fasilitator Digitalisasi Pembelajaran", subtitle: "Kemdikdasmen RI", highlight: false },
    { title: "Guru Pejuang Digital Level 3", subtitle: "Kemdikdasmen RI", highlight: false },
  ],
  awardImages: [
    "https://lh3.googleusercontent.com/d/1eaiF_NlF5r--JCxXEvOLJSdB1om-xVsz",
    "https://lh3.googleusercontent.com/d/1sWNDHiQqyxvzauQA-rdhGAvbi2QlvSgS",
    "https://lh3.googleusercontent.com/d/1dmpq9L-IVNWE8hpu2Nos4nQwWYs0htvq",
    "https://lh3.googleusercontent.com/d/14Uw1bpKJtk1W__VbcJeYBk6xMucExZbF"
  ],
  instagramPosts: [
    { url: "https://instagram.com", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&h=1067&auto=format&fit=crop" },
    { url: "https://instagram.com", image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&h=1067&auto=format&fit=crop" },
    { url: "https://instagram.com", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=600&h=1067&auto=format&fit=crop" },
    { url: "https://instagram.com", image: "https://images.unsplash.com/photo-1515542706656-8e6ef17a1521?q=80&w=600&h=1067&auto=format&fit=crop" }
  ]
};

export function useHomepageSettings() {
  const [settings, setSettings] = useState<HomepageSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'homepage'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ ...defaultSettings, ...docSnap.data() } as HomepageSettings);
      } else {
        // Jika belum ada data di database (belum klik Save di panel admin), pasang nilai default.
        // Kita tidak melakukan setDoc di sini agar menghindari error permission untuk user non-admin.
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Error fetching homepage settings:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { settings, loading };
}
