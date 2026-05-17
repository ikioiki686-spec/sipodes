"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Contact,
  Database,
  FileSpreadsheet,
  HeartPulse,
  Home,
  Layers,
  LockKeyhole,
  Map as MapIcon,
  MapPinned,
  PanelTop,
  RotateCcw,
  School,
  Search,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { AdminPanel } from "@/components/AdminPanel";
import { AnimatedSection, fadeItem } from "@/components/ui/AnimatedSection";
import { Card } from "@/components/ui/Card";
import { MobileNav } from "@/components/ui/MobileNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  niasDistricts,
  sampleVillageGeoJson,
  sampleVillages,
} from "@/lib/sample-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { SupabaseVillageRow, Village } from "@/lib/types";
import { rowToVillage } from "@/lib/village-mappers";

const STORAGE_KEY = "sipodes-nias-villages";
const BPS_NIAS_URL = "https://niaskab.bps.go.id/id";

const navLinks = [
  { href: "#beranda", label: "Beranda" },
  { href: "#tentang", label: "Tentang" },
  { href: "#fitur", label: "Fitur" },
  { href: "#data", label: "Data" },
  { href: "#kontak", label: "Kontak" },
  { href: "#bantuan", label: "Bantuan" },
];

const VillageMap = dynamic(
  () => import("@/components/VillageMap").then((mod) => mod.VillageMap),
  {
    loading: () => (
      <div className="flex h-full min-h-[560px] items-center justify-center bg-sky-50 text-sm font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-300">
        Memuat peta Kabupaten Nias...
      </div>
    ),
    ssr: false,
  },
);

export function WebGisDashboard() {
  const gradientRef = useRef<HTMLDivElement | null>(null);
  const [villages, setVillages] = useState<Village[]>(sampleVillages);
  const [selectedVillageId, setSelectedVillageId] = useState(sampleVillages[0].id);
  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("Semua Kecamatan");
  const [villageFilter, setVillageFilter] = useState("Semua Desa");
  const [adminOpen, setAdminOpen] = useState(false);
  const [dataSource, setDataSource] = useState<"contoh" | "lokal" | "supabase">(
    "contoh",
  );

  useEffect(() => {
    if (!gradientRef.current) {
      return;
    }

    const tween = gsap.to(gradientRef.current, {
      backgroundPosition: "100% 50%",
      duration: 12,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    return () => {
      tween.kill();
    };
  }, []);

  useEffect(() => {
    window.setTimeout(() => {
      const localData = window.localStorage.getItem(STORAGE_KEY);
      if (localData) {
        setVillages(JSON.parse(localData) as Village[]);
        setDataSource("lokal");
      }
    }, 0);
  }, []);

  useEffect(() => {
    async function loadSupabaseVillages() {
      if (!supabase) {
        return;
      }

      const { data, error } = await supabase
        .from("villages")
        .select("*")
        .order("district")
        .order("name");

      if (!error && data?.length) {
        setVillages((data as SupabaseVillageRow[]).map(rowToVillage));
        setSelectedVillageId(data[0].id);
        setDataSource("supabase");
      }
    }

    loadSupabaseVillages();
  }, []);

  const filteredVillages = villages.filter((village) => {
    const matchQuery = `${village.name} ${village.district}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchDistrict =
      districtFilter === "Semua Kecamatan" || village.district === districtFilter;
    const matchVillage =
      villageFilter === "Semua Desa" || village.id === villageFilter;

    return matchQuery && matchDistrict && matchVillage;
  });

  const effectiveSelectedVillageId = villages.some(
    (village) => village.id === selectedVillageId,
  )
    ? selectedVillageId
    : (filteredVillages[0]?.id ?? villages[0]?.id ?? "");

  const selectedVillage = villages.find(
    (village) => village.id === effectiveSelectedVillageId,
  );

  const totals = useMemo(
    () =>
      villages.reduce(
        (acc, village) => ({
          population: acc.population + village.population,
          households: acc.households + village.households,
          healthCenters: acc.healthCenters + village.healthCenters,
          schools: acc.schools + village.schools,
          msmes: acc.msmes + village.msmes.length,
        }),
        {
          population: 0,
          households: 0,
          healthCenters: 0,
          schools: 0,
          msmes: 0,
        },
      ),
    [villages],
  );

  function handleVillagesChange(nextVillages: Village[]) {
    setVillages(nextVillages);
    setDataSource(isSupabaseConfigured ? "supabase" : "lokal");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextVillages));
  }

  function applyFilters() {
    if (villageFilter !== "Semua Desa") {
      setSelectedVillageId(villageFilter);
      return;
    }

    const first = filteredVillages[0];
    if (first) {
      setSelectedVillageId(first.id);
    }
  }

  function resetFilters() {
    setQuery("");
    setDistrictFilter("Semua Kecamatan");
    setVillageFilter("Semua Desa");
    setSelectedVillageId(villages[0]?.id ?? "");
  }

  return (
    <motion.main
      animate={{ opacity: 1 }}
      className="app-gradient relative min-h-screen overflow-hidden text-slate-950 dark:text-slate-100"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-80 bg-[length:220%_220%] opacity-70"
        ref={gradientRef}
        style={{
          backgroundImage:
            "linear-gradient(110deg, rgba(16,185,129,.2), rgba(249,115,22,.16), rgba(14,165,233,.12))",
        }}
      />

      <header className="sticky top-0 z-[650] border-b border-emerald-900/10 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <MapPinned className="size-7" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-tight text-slate-950 dark:text-white sm:text-xl">
                WebGIS Desa Interaktif
              </p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                Dashboard Peta dan Data Wilayah Desa
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-9 text-sm font-semibold text-slate-700 dark:text-slate-300 lg:flex">
            {navLinks.map((link, index) => (
              <a
                className={
                  index === 0
                    ? "border-b-2 border-emerald-700 py-5 text-emerald-700 dark:border-emerald-300 dark:text-emerald-300"
                    : "py-5 transition hover:text-emerald-700 dark:hover:text-emerald-300"
                }
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNav links={navLinks} />
            <button
              className="interactive-button inline-flex h-11 w-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white/80 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-emerald-200 sm:w-auto sm:px-4"
              onClick={() => setAdminOpen((value) => !value)}
              type="button"
            >
              <LockKeyhole className="size-4" />
              <span className="hidden sm:inline">Login Admin</span>
            </button>
            <a
              className="interactive-button hidden h-11 items-center gap-2 rounded-md bg-gradient-to-r from-emerald-700 to-emerald-600 px-5 text-sm font-semibold text-white shadow-sm sm:inline-flex"
              href="#peta"
            >
              <MapIcon className="size-4" />
              Lihat Peta
            </a>
          </div>
        </div>
      </header>

      <AnimatedSection
        className="relative z-10 mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(360px,0.78fr)_minmax(600px,1.22fr)] lg:px-8"
        id="beranda"
        stagger
      >
        <motion.div className="flex flex-col justify-center" variants={fadeItem}>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-300/10">
            <Users className="size-4" />
            Data Desa - Akurat - Terintegrasi - Mudah Diakses
          </div>
          <h1 className="mt-5 max-w-xl text-5xl font-black leading-[0.98] tracking-normal text-emerald-950 dark:text-emerald-50 sm:text-6xl">
            WebGIS Desa Interaktif
          </h1>
          <p className="mt-4 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            Kabupaten Nias, Provinsi Sumatera Utara
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Platform terpadu untuk melihat wilayah kecamatan, data desa,
            fasilitas umum, UMKM, dan potensi desa. Admin dapat menginput,
            mengedit, serta mengimpor data Excel/CSV agar informasi tampil
            otomatis pada peta.
          </p>
          <a
            className="interactive-button mt-4 inline-flex w-fit items-center gap-2 rounded-md border border-emerald-100 bg-white/80 px-3 py-2 text-sm font-bold text-emerald-800 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-emerald-200"
            href={BPS_NIAS_URL}
            rel="noreferrer"
            target="_blank"
          >
            <Database className="size-4" />
            Referensi BPS Kabupaten Nias
          </a>
          <motion.div className="mt-6 grid gap-3 sm:grid-cols-3" variants={fadeItem}>
            <TrustCard icon={Database} title="Data Terpercaya" text="Basis data siap disambungkan ke Supabase." />
            <TrustCard icon={MapIcon} title="Peta Interaktif" text="Klik wilayah untuk melihat ringkasan data." />
            <TrustCard icon={ShieldCheck} title="Akses Mudah" text="Dashboard responsif untuk admin dan publik." />
          </motion.div>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              className="interactive-button inline-flex h-12 min-w-40 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-emerald-700 to-emerald-600 px-5 text-sm font-bold text-white shadow-sm"
              href="#peta"
            >
              <MapIcon className="size-4" />
              Lihat Peta
            </a>
            <button
              className="interactive-button inline-flex h-12 min-w-40 items-center justify-center gap-2 rounded-md border border-emerald-100 bg-white/80 px-5 text-sm font-bold text-emerald-800 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-emerald-200"
              onClick={() => setAdminOpen(true)}
              type="button"
            >
              <FileSpreadsheet className="size-4" />
              Jelajahi Data
            </button>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-4 lg:grid-cols-[255px_minmax(0,1fr)]"
          id="peta"
          variants={fadeItem}
        >
          <Card as="section" className="p-4">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Pencarian & Filter Wilayah
            </p>
            <label className="relative mt-4 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full rounded-md border border-slate-200 bg-white/80 pl-9 pr-3 text-sm outline-none ring-emerald-600 transition focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari desa atau wilayah..."
                value={query}
              />
            </label>
            <FilterSelect label="Provinsi" value="SUMATERA UTARA" values={["SUMATERA UTARA"]} />
            <FilterSelect label="Kabupaten/Kota" value="KAB. NIAS" values={["KAB. NIAS"]} />
            <FilterSelect
              label="Kecamatan"
              onChange={(value) => {
                const firstVillage = villages.find(
                  (village) => village.district === value,
                );
                setDistrictFilter(value);
                setVillageFilter("Semua Desa");
                if (firstVillage) {
                  setSelectedVillageId(firstVillage.id);
                }
              }}
              value={districtFilter}
              values={["Semua Kecamatan", ...niasDistricts]}
            />
            <FilterSelect
              label="Kelurahan/Desa"
              labels={new Map(villages.map((village) => [village.id, village.name]))}
              onChange={setVillageFilter}
              value={villageFilter}
              values={[
                "Semua Desa",
                ...villages
                  .filter(
                    (village) =>
                      districtFilter === "Semua Kecamatan" ||
                      village.district === districtFilter,
                  )
                  .map((village) => village.id),
              ]}
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="interactive-button inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 text-sm font-bold text-white"
                onClick={applyFilters}
                type="button"
              >
                Terapkan
              </button>
              <button
                className="interactive-button inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white/80 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
                onClick={resetFilters}
                type="button"
              >
                <RotateCcw className="size-4" />
                Reset
              </button>
            </div>
            <div className="mt-4 rounded-md bg-emerald-50 p-3 text-xs text-slate-700 dark:bg-emerald-950/40 dark:text-slate-200">
              <p className="font-bold text-emerald-800 dark:text-emerald-200">
                Ringkasan Wilayah
              </p>
              <SummaryRow label="Provinsi" value="Sumatera Utara" />
              <SummaryRow label="Kabupaten" value="Kab. Nias" />
              <SummaryRow label="Kecamatan" value="10" />
              <SummaryRow label="Desa" value="170" />
            </div>
          </Card>

          <Card as="section" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white/78 px-4 py-3 dark:border-white/10 dark:bg-slate-950/65">
              <div className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white">
                Kabupaten Nias
                <Layers className="size-4" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                <PanelTop className="size-4" />
                Sumber: {dataSource}
              </span>
              <span className="hidden items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 dark:border-orange-300/20 dark:bg-orange-400/10 dark:text-orange-200 sm:inline-flex">
                {villages.length} marker desa
              </span>
            </div>
            <div className="h-[570px]">
              <VillageMap
                geoJson={sampleVillageGeoJson}
                villages={villages}
                selectedVillageId={effectiveSelectedVillageId}
                onSelectVillage={setSelectedVillageId}
              />
            </div>
          </Card>
        </motion.div>
      </AnimatedSection>

      <AnimatedSection
        className="relative z-10 mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8"
        id="fitur"
        stagger
      >
        <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
          <Feature icon={MapIcon} title="Peta Interaktif" text="Wilayah kecamatan dan detail data desa." />
          <Feature icon={Users} title="Data Kependudukan" text="Penduduk, KK, dan ringkasan wilayah." />
          <Feature icon={HeartPulse} title="Fasilitas Kesehatan" text="Puskesmas dan layanan kesehatan." />
          <Feature icon={School} title="Fasilitas Pendidikan" text="Sekolah dan sarana pendidikan." />
          <Feature icon={Store} title="Potensi Ekonomi" text="UMKM, pertanian, dan potensi desa." />
          <Feature icon={FileSpreadsheet} title="Import Data" text="Excel dan CSV untuk pembaruan cepat." />
        </Card>
      </AnimatedSection>

      <AnimatedSection
        className="relative z-10 mx-auto grid max-w-7xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-8"
        id="data"
      >
        <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
          <Metric icon={Building2} label="Jumlah Desa" value={villages.length} suffix="Desa" />
          <Metric icon={Users} label="Jumlah Penduduk" value={totals.population} suffix="Jiwa" />
          <Metric icon={MapPinned} label="Luas Wilayah" value={853.44} suffix="km2" />
          <Metric icon={Home} label="Jumlah KK" value={totals.households} suffix="KK" />
          <Metric icon={HeartPulse} label="Faskes" value={totals.healthCenters} suffix="Unit" />
          <Metric icon={School} label="Pendidikan" value={totals.schools} suffix="Unit" />
        </Card>

        <aside className="space-y-4">
          {selectedVillage && <VillageDetail village={selectedVillage} />}
          {adminOpen && (
            <AdminPanel
              districts={niasDistricts}
              villages={villages}
              onVillagesChange={handleVillagesChange}
            />
          )}
        </aside>
      </AnimatedSection>

      <AnimatedSection
        className="relative z-10 mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8"
        id="tentang"
      >
        <Card className="overflow-hidden border-emerald-100 bg-emerald-50/78 dark:border-white/10 dark:bg-emerald-950/28">
          <div className="grid gap-5 p-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">
                Satu Peta, Banyak Manfaat
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                WebGIS Desa Interaktif membantu pemerintah, perangkat desa, dan
                masyarakat melihat data wilayah untuk perencanaan pembangunan,
                pelayanan publik, dan pemetaan potensi ekonomi lokal.
              </p>
            </div>
            <div className="relative min-h-40 overflow-hidden rounded-lg border border-white/60 bg-white/50 dark:border-white/10 dark:bg-white/5">
              <Image
                alt="Ilustrasi lanskap desa di Kabupaten Nias"
                className="object-cover"
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 560px"
                src="/nias-landscape.svg"
              />
            </div>
          </div>
          <div className="grid gap-3 px-6 pb-6 sm:grid-cols-3">
            <Benefit icon={ShieldCheck} title="Transparan" text="Data terbuka dan dapat dipertanggungjawabkan." />
            <Benefit icon={Contact} title="Akuntabel" text="Informasi rapi untuk pelayanan cepat." />
            <Benefit icon={Users} title="Kolaboratif" text="Mendukung pembaruan data bersama." />
          </div>
        </Card>
      </AnimatedSection>

      <footer className="relative z-10 bg-emerald-950 text-white" id="kontak">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <MapPinned className="size-8" />
              <div>
                <p className="font-bold">WebGIS Desa Interaktif</p>
                <p className="text-xs text-emerald-100">
                  Dashboard Peta dan Data Wilayah Desa
                </p>
              </div>
            </div>
            <p className="mt-5 text-xs text-emerald-100">
              Copyright 2026 WebGIS Desa Interaktif.
            </p>
          </div>
          <FooterList title="Tautan Cepat" items={["Beranda", "Tentang", "Fitur", "Data"]} />
          <div>
            <p className="font-bold">Sumber Data</p>
            <div className="mt-3 grid gap-2 text-sm text-emerald-100">
              <a href={BPS_NIAS_URL} rel="noreferrer" target="_blank">
                BPS Kabupaten Nias
              </a>
              <span>Kemendagri</span>
              <span>BIG / Geoportal</span>
              <span>Dinas Setempat</span>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <ShieldCheck className="size-8 text-emerald-200" />
            <p className="mt-3 font-bold">Data Aman & Terpercaya</p>
            <p className="mt-1 text-xs leading-5 text-emerald-100">
              Sistem siap memakai Supabase Auth dan PostgreSQL untuk pengelolaan
              data desa.
            </p>
          </div>
        </div>
      </footer>
    </motion.main>
  );
}

function TrustCard({
  icon: Icon,
  text,
  title,
}: {
  icon: typeof Database;
  text: string;
  title: string;
}) {
  return (
    <Card className="grid grid-cols-[38px_1fr] gap-3 p-3">
      <div className="flex size-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p>
      </div>
    </Card>
  );
}

function FilterSelect({
  label,
  labels,
  onChange,
  value,
  values,
}: {
  label: string;
  labels?: Map<string, string>;
  onChange?: (value: string) => void;
  value: string;
  values: string[];
}) {
  return (
    <label className="mt-3 block text-xs font-semibold text-slate-500 dark:text-slate-400">
      {label}
      <select
        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white/80 px-3 text-sm font-medium text-slate-700 outline-none ring-emerald-600 focus:ring-2 disabled:opacity-80 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
        disabled={!onChange}
        onChange={(event) => onChange?.(event.target.value)}
        value={value}
      >
        {values.map((item) => (
          <option key={item} value={item}>
            {labels?.get(item) ?? item}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Feature({
  icon: Icon,
  text,
  title,
}: {
  icon: typeof MapIcon;
  text: string;
  title: string;
}) {
  return (
    <motion.div
      className="grid grid-cols-[44px_1fr] gap-3 border-slate-200 lg:border-r lg:pr-3 last:border-r-0 dark:border-white/10"
      variants={fadeItem}
    >
      <div className="flex size-11 items-center justify-center rounded-md border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-300/10 dark:bg-emerald-400/10 dark:text-emerald-300">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p>
      </div>
    </motion.div>
  );
}

function Metric({
  icon: Icon,
  label,
  suffix,
  value,
}: {
  icon: typeof Users;
  label: string;
  suffix: string;
  value: number;
}) {
  return (
    <div className="grid grid-cols-[42px_1fr] gap-3 border-slate-200 lg:border-r lg:pr-3 last:border-r-0 dark:border-white/10">
      <div className="flex size-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-black text-emerald-900 dark:text-emerald-100">
          {value.toLocaleString("id-ID")}
        </p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{suffix}</p>
      </div>
    </div>
  );
}

function VillageDetail({ village }: { village: Village }) {
  return (
    <Card as="section" className="p-4">
      <div>
        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
          {village.district}, Kab. Nias
        </p>
        <h2 className="text-xl font-black text-slate-950 dark:text-white">{village.name}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Diperbarui {new Date(village.updatedAt).toLocaleDateString("id-ID")}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Fact label="Jumlah Penduduk" value={village.population} />
        <Fact label="Jumlah KK" value={village.households} />
        <Fact label="Puskesmas" value={village.healthCenters} />
        <Fact label="Sekolah" value={village.schools} />
      </div>
      <InfoList label="Fasilitas Umum" values={village.publicFacilities} />
      <InfoList label="UMKM" values={village.msmes} />
      <InfoList label="Potensi Desa" values={village.potentials} />
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-lg font-black">{value.toLocaleString("id-ID")}</p>
    </div>
  );
}

function InfoList({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(values.length ? values : ["-"]).map((value) => (
          <span
            className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200"
            key={value}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function Benefit({
  icon: Icon,
  text,
  title,
}: {
  icon: typeof ShieldCheck;
  text: string;
  title: string;
}) {
  return (
    <Card className="p-3">
      <Icon className="size-5 text-emerald-700 dark:text-emerald-300" />
      <p className="mt-2 text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p>
    </Card>
  );
}

function FooterList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <p className="font-bold">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-emerald-100">
        {items.map((item) => (
          <a href="#beranda" key={item}>
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}
