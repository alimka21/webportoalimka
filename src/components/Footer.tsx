import { Instagram, Facebook, Youtube } from "lucide-react";

// Custom TikTok Icon since Lucide doesn't have it in the standard set sometimes or it's named differently
export const TikTokIcon = ({ size = 24 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export const Footer = () => {
  const socialLinks = [
    { icon: <Instagram size={18} />, href: "https://instagram.com/muh.alimka", label: "Instagram" },
    { icon: <Facebook size={18} />, href: "https://facebook.com/muh.alimka", label: "Facebook" },
    { icon: <TikTokIcon size={18} />, href: "https://tiktok.com/@muh.alimka", label: "TikTok" },
    { icon: <Youtube size={18} />, href: "https://www.youtube.com/@gurualimka9743", label: "YouTube" },
  ];

  return (
    <footer className="w-full py-12 border-t border-outline-variant/10 bg-surface-container-low">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-6 gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <p className="text-sm tracking-normal text-on-surface font-medium">
            © {new Date().getFullYear()} Muhammad Alimka. Guru, Fasilitator, dan Inovator.
          </p>
          <p className="text-xs text-on-surface-variant/70 mt-1 uppercase tracking-widest font-bold">
            All rights reserved.
          </p>
        </div>
        <div className="flex gap-6">
          {socialLinks.map((link, index) => (
            <a 
              key={index}
              href={link.href} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant hover:text-primary transition-all text-sm font-medium flex items-center gap-1"
              aria-label={link.label}
            >
              {link.icon} <span className="hidden sm:inline">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
