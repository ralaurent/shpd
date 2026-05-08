"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Reusable Logo Component using your provided SVG
const Logo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    version="1.0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 382.000000 447.000000"
    preserveAspectRatio="xMidYMid meet"
    fill="currentColor"
  >
    <g transform="translate(0.000000,447.000000) scale(0.100000,-0.100000)" stroke="none">
      <path d="M1885 4063 c-99 -12 -264 -49 -355 -80 -99 -33 -296 -124 -385 -177 -127 -76 -340 -258 -434 -371 -101 -121 -225 -313 -272 -420 -49 -113 -57 -133 -77 -190 -78 -225 -102 -376 -102 -638 0 -189 10 -304 36 -410 41 -172 72 -260 143 -420 52 -115 192 -330 284 -435 58 -67 171 -173 247 -233 41 -33 80 -63 86 -68 6 -5 55 -35 110 -68 178 -106 311 -161 494 -205 161 -39 214 -47 361 -54 124 -6 200 -1 186 12 -3 3 -49 16 -104 29 -119 28 -197 51 -240 71 -17 8 -34 14 -38 14 -6 0 -78 31 -125 54 -129 64 -272 153 -370 233 -218 175 -436 456 -545 704 -125 284 -170 516 -162 834 6 243 52 466 133 652 8 17 14 34 14 37 0 17 98 201 147 276 108 164 268 343 408 457 206 167 475 301 728 364 53 13 97 27 97 32 0 7 -206 8 -265 0z" />
      <path d="M3184 3488 c1 -200 -1 -217 -23 -283 -53 -154 -198 -324 -381 -445 -12 -8 -32 -22 -44 -31 -21 -16 -181 -107 -266 -152 -25 -13 -45 -29 -45 -35 0 -6 25 -29 55 -51 63 -46 55 -41 137 -103 34 -27 67 -48 73 -48 17 0 134 53 138 62 2 4 9 8 16 8 21 0 157 90 241 160 136 114 231 246 285 400 28 80 39 276 21 373 -13 64 -89 235 -119 265 -9 10 -30 34 -45 55 -15 20 -32 37 -36 37 -4 0 -7 -96 -7 -212z" />
      <path d="M1855 3559 c-193 -102 -308 -203 -371 -326 l-39 -75 0 -122 c0 -119 1 -122 37 -197 51 -105 155 -229 286 -341 47 -41 262 -200 328 -244 33 -21 64 -42 69 -47 6 -4 64 -46 130 -92 66 -46 125 -87 130 -92 6 -4 40 -30 75 -58 96 -74 127 -101 220 -195 106 -108 131 -140 197 -255 58 -101 113 -307 113 -427 0 -99 22 -81 71 57 16 47 22 93 26 211 5 132 3 160 -16 234 -62 240 -208 446 -491 696 -77 67 -339 251 -624 437 -98 64 -226 174 -272 233 -107 138 -78 260 123 522 82 107 83 121 8 81z" />
      <path d="M2194 3356 c-64 -30 -116 -81 -151 -149 -22 -43 -26 -65 -27 -132 0 -130 56 -224 169 -283 43 -23 62 -27 140 -27 78 0 97 4 141 27 114 60 169 152 168 283 0 64 -5 90 -24 129 -33 65 -91 123 -153 152 -73 34 -190 34 -263 0z" />
      <path d="M1811 2154 c335 -347 487 -515 596 -659 221 -291 295 -502 258 -732 -9 -53 -19 -102 -24 -107 -5 -6 -14 -28 -20 -48 -7 -21 -37 -85 -67 -143 -47 -91 -52 -105 -36 -105 45 0 161 79 253 173 43 45 129 172 129 192 0 4 6 21 14 38 21 45 46 179 46 242 0 65 -25 215 -47 275 -85 240 -248 457 -483 643 -153 122 -232 168 -455 268 -56 25 -147 50 -200 56 l-60 6 96 -99z" />
    </g>
  </svg>
);

// Dynamic import for Leaflet to prevent SSR errors (window is not defined)
const DynamicMap = dynamic(
  async () => {
    const { MapContainer, TileLayer, CircleMarker } = await import("react-leaflet");
    return function Map() {
      return (
        <MapContainer
          center={[40.865, -73.827]} // Bronx, NY coordinates
          zoom={14}
          zoomControl={false}
          style={{ height: "100%", width: "100%", zIndex: 1, backgroundColor: "#0b0f10" }}
        >
          {/* Dark Mode CartoDB Map Tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {/* Location Marker */}
          <CircleMarker
            center={[40.865, -73.827]}
            pathOptions={{ color: "#a8e6fd", fillColor: "#a8e6fd", fillOpacity: 0.7 }}
            radius={8}
          />
        </MapContainer>
      );
    };
  },
  { ssr: false }
);

export default function Home() {
  const [activeSection, setActiveSection] = useState("services");

  // Track scroll position to update active nav link
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["services", "treatments", "about"];
      let current = "";

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if the section is occupying the middle of the viewport
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            current = section;
            break;
          }
        }
      }

      if (current) {
        setActiveSection(current);
      } else if (window.scrollY === 0) {
        setActiveSection("services");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check on mount
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper for applying consistent styling to prevent layout jumps
  const getNavClasses = (section: string) => {
    const baseClasses = "text-[13px] font-semibold tracking-widest uppercase transition-colors hover:opacity-80 border-b-2 pb-1";
    if (activeSection === section) {
      return `${baseClasses} text-[var(--primary)] border-[var(--primary)]`;
    }
    return `${baseClasses} text-[var(--on-surface-variant)] hover:text-[var(--primary)] border-transparent`;
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[var(--background)] text-[var(--on-background)] font-body antialiased">
      {/* Required CSS Mapping & External Assets */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0');

          html {
            scroll-behavior: smooth;
          }

          :root {
            --primary: #24677a;
            --primary-container: #a8e6fd;
            --on-primary-container: #065669;
            --surface: #f7fafc;
            --on-surface: #2b3437;
            --on-surface-variant: #576064;
            --inverse-surface: #0b0f10;
            --inverse-on-surface: #9a9d9f;
            --surface-bright: #f7fafc;
            --surface-container: #e8eff2;
            --surface-container-high: #e2e9ed;
            --surface-container-low: #eff4f7;
            --surface-container-lowest: #ffffff;
            --surface-variant: #dbe4e8;
            --primary-fixed: #a8e6fd;
            --on-primary-fixed: #004251;
            --secondary: #4c636a;
            --secondary-container: #cee7f0;
            --tertiary-container: #c0d5ff;
            --background: #f7fafc;
            --on-background: #2b3437;
          }
          .font-display { font-family: 'Instrument Sans', sans-serif; }
          .font-body { font-family: 'Inter', sans-serif; }
          
          .glass-panel {
              background: rgba(255, 255, 255, 0.6);
              backdrop-filter: blur(24px);
              -webkit-backdrop-filter: blur(24px);
              border: 1px solid rgba(255, 255, 255, 0.5);
          }
          .ambient-shadow { box-shadow: 0 20px 60px -15px rgba(36, 103, 122, 0.1); }
          .ambient-glow { box-shadow: 0 0 40px rgba(168, 230, 253, 0.3); }
          .texture-noise {
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
              opacity: 0.04;
              pointer-events: none;
          }
        `,
        }}
      />
      {/* Leaflet CSS requirement */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div className="fixed inset-0 texture-noise z-50"></div>

      {/* TopNavBar Component */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white/70 dark:bg-[var(--inverse-surface)]/70 backdrop-blur-2xl border-b border-white/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-12 py-6">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-auto text-[var(--on-surface)]" />
            <span className="text-2xl font-display font-medium tracking-tight text-[var(--on-surface)]">
              SHPD Health
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <a
              className={getNavClasses("services")}
              href="#services"
              onClick={() => setActiveSection("services")}
            >
              Services
            </a>

            <a
              className={getNavClasses("treatments")}
              href="#treatments"
              onClick={() => setActiveSection("treatments")}
            >
              Treatments
            </a>

            <a
              className={getNavClasses("about")}
              href="#about"
              onClick={() => setActiveSection("about")}
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/booking" className="hidden sm:block bg-[var(--primary-container)] text-[var(--on-primary-container)] px-6 py-3 rounded-full text-[13px] font-semibold tracking-widest uppercase hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              Book Now
            </Link>

            <button
              onClick={() => signIn("google", { redirectTo: "/dashboard" })}
              className="bg-[var(--primary)] text-white px-6 py-3 rounded-full text-[13px] font-semibold tracking-widest uppercase hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                login
              </span>
              Login
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-[100px]">
        {/* Hero Section - Mapped to 'Services' link */}
        <section id="services" className="relative min-h-[800px] flex items-center justify-center px-6 md:px-12 py-24 overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-[var(--surface)] to-[var(--surface-container-low)] opacity-80"></div>
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--primary-container)] rounded-full mix-blend-multiply blur-[140px] animate-blob opacity-50"></div>
            <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[var(--secondary-container)] rounded-full mix-blend-multiply blur-[140px] animate-blob animation-delay-2000 opacity-50"></div>
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--tertiary-container)] rounded-full mix-blend-multiply blur-[160px] opacity-40"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-[var(--on-surface-variant)] text-[13px] font-semibold tracking-widest uppercase mb-8 border border-white/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>{" "}
              Now Accepting New Patients
            </span>
            <h1 className="text-5xl md:text-7xl font-display text-[var(--on-surface)] mb-6 tracking-tight text-balance leading-tight drop-shadow-sm font-medium">
              Elevate Your Essence. Restore Your Calm.
            </h1>
            <p className="text-lg md:text-xl font-body text-[var(--on-surface-variant)] mb-12 max-w-2xl text-balance">
              Experience a sanctuary of holistic precision. We combine advanced
              medical treatments with restorative therapies to guide you towards
              absolute wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link href="/booking" className="bg-[var(--primary-container)] text-[var(--on-primary-container)] hover:bg-[var(--primary)] hover:text-white px-8 py-4 rounded-full text-[13px] font-semibold tracking-widest uppercase transition-all duration-300 ambient-glow hover:shadow-xl hover:-translate-y-1 flex items-center gap-2">
                <span>Book Your Consultation</span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: '"FILL" 0' }}
                >
                  arrow_forward
                </span>
              </Link>
              <button className="glass-panel text-[var(--on-surface)] px-8 py-4 rounded-full text-[13px] font-semibold tracking-widest uppercase hover:bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-2">
                Explore Services
              </button>
            </div>
          </div>
        </section>

        {/* Precision Treatments Section - Mapped to 'Treatments' link */}
        <section id="treatments" className="px-6 md:px-12 py-24 relative z-20 overflow-hidden">
          <div className="absolute inset-0 bg-[var(--surface-container-lowest)] z-0"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--primary-container)]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-medium text-[var(--on-surface)] mb-4">
                Precision Treatments
              </h2>
              <p className="text-[16px] font-body text-[var(--on-surface-variant)] max-w-xl mx-auto">
                Tailored protocols designed to optimize your health span and elevate your daily experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Service Card 1 (Large) */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2 glass-panel !bg-white/80 rounded-2xl p-8 hover:scale-[1.01] hover:shadow-2xl transition-all duration-500 ambient-shadow group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[var(--primary-container)]/40 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--surface-container)] to-[var(--surface-container-high)] flex items-center justify-center mb-6 shadow-inner border border-white/50">
                      <span className="material-symbols-outlined text-[var(--primary)] text-2xl">
                        psychology
                      </span>
                    </div>
                    <h3 className="text-3xl font-display font-medium text-[var(--on-surface)] mb-3">
                      Psychiatric Treatment
                    </h3>
                    <p className="text-[16px] font-body text-[var(--on-surface-variant)] max-w-md">
                      Comprehensive, compassionate mental health care tailored to your unique psychological profile. We offer advanced diagnostic and therapeutic modalities.
                    </p>
                  </div>
                  <Link href="/booking?treatment=Psychiatric+Treatment" className="mt-8 flex items-center gap-2 text-[var(--primary)] font-semibold text-[13px] tracking-widest uppercase group-hover:translate-x-2 transition-transform duration-300 bg-[var(--primary-container)]/30 w-fit px-4 py-2 rounded-full cursor-pointer">
                    Explore Protocol <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Service Card 2 */}
              <div className="col-span-1 glass-panel !bg-white/80 rounded-2xl p-8 hover:scale-[1.02] hover:shadow-xl transition-all duration-500 ambient-shadow flex flex-col justify-between group relative overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--secondary-container)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--surface-container)] to-[var(--surface-container-high)] flex items-center justify-center mb-6 shadow-inner border border-white/50">
                    <span className="material-symbols-outlined text-[var(--primary)] text-2xl">
                      monitor_weight
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-medium text-[var(--on-surface)] mb-3">
                    Weight Management
                  </h3>
                  <p className="text-[16px] font-body text-[var(--on-surface-variant)]">
                    Medical weight optimization using clinically proven interventions.
                  </p>
                </div>
                <Link href="/booking?treatment=Weight+Management" className="mt-6 flex items-center gap-2 text-[var(--primary)] font-semibold text-[13px] tracking-widest uppercase group-hover:translate-x-2 transition-transform duration-300 relative z-10">
                  Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              {/* Service Card 3 */}
              <div className="col-span-1 glass-panel !bg-white/80 rounded-2xl p-8 hover:scale-[1.02] hover:shadow-xl transition-all duration-500 ambient-shadow flex flex-col justify-between group relative overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--tertiary-container)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--surface-container)] to-[var(--surface-container-high)] flex items-center justify-center mb-6 shadow-inner border border-white/50">
                    <span className="material-symbols-outlined text-[var(--primary)] text-2xl">
                      water_drop
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-medium text-[var(--on-surface)] mb-3">
                    IV Treatment
                  </h3>
                  <p className="text-[16px] font-body text-[var(--on-surface-variant)]">
                    Direct cellular hydration and nutrient delivery for rapid restoration.
                  </p>
                </div>
                <Link href="/booking?treatment=IV+Treatment" className="mt-6 flex items-center gap-2 text-[var(--primary)] font-semibold text-[13px] tracking-widest uppercase group-hover:translate-x-2 transition-transform duration-300 relative z-10">
                  Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              {/* Service Card 4 */}
              <div className="col-span-1 glass-panel !bg-white/80 rounded-2xl p-8 hover:scale-[1.02] hover:shadow-xl transition-all duration-500 ambient-shadow flex flex-col justify-between group relative overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--primary-container)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--surface-container)] to-[var(--surface-container-high)] flex items-center justify-center mb-6 shadow-inner border border-white/50">
                    <span className="material-symbols-outlined text-[var(--primary)] text-2xl">
                      face
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-medium text-[var(--on-surface)] mb-3">
                    Botox & Aesthetics
                  </h3>
                  <p className="text-[16px] font-body text-[var(--on-surface-variant)]">
                    Subtle, precision aesthetic enhancements by licensed practitioners.
                  </p>
                </div>
                <Link href="/booking?treatment=Botox" className="mt-6 flex items-center gap-2 text-[var(--primary)] font-semibold text-[13px] tracking-widest uppercase group-hover:translate-x-2 transition-transform duration-300 relative z-10">
                  Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              {/* Service Card 5 */}
              <div className="col-span-1 glass-panel !bg-white/80 rounded-2xl p-8 hover:scale-[1.02] hover:shadow-xl transition-all duration-500 ambient-shadow flex flex-col justify-between group relative overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--secondary-container)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--surface-container)] to-[var(--surface-container-high)] flex items-center justify-center mb-6 shadow-inner border border-white/50">
                    <span className="material-symbols-outlined text-[var(--primary)] text-2xl">
                      health_and_safety
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-medium text-[var(--on-surface)] mb-3">
                    Addiction Management
                  </h3>
                  <p className="text-[16px] font-body text-[var(--on-surface-variant)]">
                    Discreet, evidence-based support systems for sustainable recovery.
                  </p>
                </div>
                <Link href="/booking?treatment=Addiction+Management" className="mt-6 flex items-center gap-2 text-[var(--primary)] font-semibold text-[13px] tracking-widest uppercase group-hover:translate-x-2 transition-transform duration-300 relative z-10">
                  Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Dedicated to Holistic Precision Section - Mapped to 'About' link */}
        <section id="about" className="px-6 md:px-12 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-container-lowest)] to-[var(--surface)] z-0"></div>
          <div className="absolute left-0 bottom-0 w-2/3 h-full bg-gradient-to-tr from-[var(--secondary-container)]/20 to-transparent z-0 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <h2 className="text-4xl font-display font-medium text-[var(--on-surface)] mb-6">
                Dedicated to Holistic Precision
              </h2>
              <p className="text-lg font-body text-[var(--on-surface-variant)] mb-6 leading-relaxed">
                At SH PD WELLNESS FAMILY HEALTH NP, we believe true wellness stems from a delicate balance of mind, body, and aesthetic harmony.
              </p>
              <p className="text-[16px] font-body text-[var(--on-surface-variant)] mb-10 leading-relaxed">
                Led by <strong className="text-[var(--on-surface)] font-medium">Sharonshay Hudson, DNP</strong>, our sanctuary offers expert care grounded in advanced nursing practice. As a highly skilled Nurse Practitioner, Dr. Hudson specializes in integrating behavioral health, refined aesthetics, and comprehensive wellness strategies to elevate your overall quality of life.
              </p>
              <button className="glass-panel text-[var(--primary)] px-8 py-4 rounded-full text-[13px] font-semibold tracking-widest uppercase hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 border-white/80 w-fit mx-auto lg:mx-0">
  Discover Our Philosophy
</button>
            </div>
            
            <div className="relative order-1 lg:order-2">
              <div className="w-full aspect-square rounded-3xl overflow-hidden glass-panel ambient-shadow p-2 relative group">
                {/* Overlay gradient - moved z-index to stay above the image */}
                <div className="absolute inset-0 z-10 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 opacity-50 mix-blend-overlay group-hover:opacity-70 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="w-full h-full rounded-[20px] relative overflow-hidden border border-white/30 bg-[var(--surface-variant)]/20">
                  <img 
                    src="/sharon-shay.jpg" 
                    alt="Sharonshay Hudson, DNP" 
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visit Our Sanctuary Section (with Leaflet Map) */}
        <section className="px-6 md:px-12 py-24 bg-[var(--inverse-surface)] text-[var(--surface-bright)] relative overflow-hidden rounded-t-[3rem] mt-8">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[var(--primary)]/40 via-[var(--inverse-surface)] to-[var(--inverse-surface)] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-medium text-[var(--surface-bright)] mb-4">
                Visit Our Sanctuary
              </h2>
              <p className="text-[16px] font-body text-[var(--surface-variant)] max-w-xl mx-auto">
                Step into a space thoughtfully designed for restorative calm, absolute wellness, and elevated care.
              </p>
            </div>

            <div className="relative w-full max-w-4xl">
              <div className="glass-panel !bg-white/5 !border-white/10 p-2 rounded-[2.5rem] ambient-shadow backdrop-blur-3xl">
                <div className="bg-[var(--inverse-surface)]/90 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col md:flex-row relative">
                  {/* Inner subtle glow */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-0"></div>
                  
                  <div className="md:w-1/2 p-12 flex flex-col justify-center relative overflow-hidden z-10">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-[var(--primary)]/20 blur-[80px] rounded-full pointer-events-none"></div>
                    <h3 className="text-3xl font-display font-medium text-[var(--surface-bright)] mb-1 tracking-tight">
                      SH PD Wellness
                    </h3>
                    <p className="text-[13px] font-semibold text-[var(--primary-fixed)] tracking-[0.15em] uppercase mb-10 opacity-90">
                      Family Health NP
                    </p>
                    <div className="flex items-start gap-5 mb-8 group">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-[var(--primary-fixed)]/20 transition-colors duration-300">
                        <span className="material-symbols-outlined text-[var(--primary-fixed)]" style={{ fontVariationSettings: '"FILL" 1' }}>
                          location_on
                        </span>
                      </div>
                      <div className="pt-1">
                        <p className="text-lg font-body text-[var(--surface-bright)] mb-1">
                          3380 Baychester Ave
                        </p>
                        <p className="text-[16px] font-body text-[var(--surface-variant)]">
                          Bronx, NY 10475
                        </p>
                      </div>
                    </div>
                    <button className="bg-[var(--primary-fixed)] text-[var(--on-primary-fixed)] px-8 py-4 rounded-full text-[13px] font-semibold tracking-widest uppercase hover:bg-white transition-all duration-300 w-fit flex items-center gap-2 shadow-[0_0_20px_rgba(168,230,253,0.2)] hover:shadow-[0_0_30px_rgba(168,230,253,0.4)]">
                      Get Directions
                      <span className="material-symbols-outlined text-sm">north_east</span>
                    </button>
                  </div>
                  
                  <div className="md:w-1/2 h-80 md:h-auto relative bg-black/20 flex items-center justify-center p-0 z-10 border-t md:border-t-0 md:border-l border-white/5 overflow-hidden">
                     {/* Dynamic Dark Mode Leaflet Map Replaces Abstract HTML Map */}
                     <DynamicMap />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Exact Original HTML Footer Translated to JSX */}
      <footer className="w-full py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8 bg-[var(--inverse-surface)] relative z-10 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full justify-between max-w-7xl mx-auto">
          <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-2 text-white">
              <Logo className="h-6 w-auto object-contain brightness-0 invert" />
              <span className="text-3xl font-display font-medium text-[var(--surface-bright)]">
                SHPD Health
              </span>
            </div>
            <p className="text-[16px] font-body text-[var(--surface-variant)] max-w-sm">
              © 2024 SHPD Health. Dedicated to restorative calm and holistic precision.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-[13px] font-semibold tracking-widest text-[var(--surface-variant)] hover:text-[var(--primary-fixed)] transition-colors duration-300" href="#">Privacy Policy</a>
            <a className="text-[13px] font-semibold tracking-widest text-[var(--surface-variant)] hover:text-[var(--primary-fixed)] transition-colors duration-300" href="#">Terms of Service</a>
            <a className="text-[13px] font-semibold tracking-widest text-[var(--surface-variant)] hover:text-[var(--primary-fixed)] transition-colors duration-300" href="#">Cookie Policy</a>
            <a className="text-[13px] font-semibold tracking-widest text-[var(--surface-variant)] hover:text-[var(--primary-fixed)] transition-colors duration-300" href="#">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
}