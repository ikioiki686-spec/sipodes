"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2, Upload, UserCheck } from "lucide-react";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/Card";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Village, VillageFormValues } from "@/lib/types";
import { parseList, slugify, villageToRow } from "@/lib/village-mappers";

type AdminPanelProps = {
  districts: string[];
  villages: Village[];
  onVillagesChange: (villages: Village[]) => void;
};

const emptyForm: VillageFormValues = {
  id: "",
  name: "",
  district: "Idanogawo",
  population: 0,
  households: 0,
  healthCenters: 0,
  schools: 0,
  publicFacilities: [],
  msmes: [],
  potentials: [],
};

export function AdminPanel({
  districts,
  villages,
  onVillagesChange,
}: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState(!isSupabaseConfigured);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [adminDistrict, setAdminDistrict] = useState(districts[0] ?? "Idanogawo");
  const [selectedId, setSelectedId] = useState(villages[0]?.id ?? "");
  const [message, setMessage] = useState(
    isSupabaseConfigured
      ? "Masuk dengan akun Supabase Auth."
      : "Mode demo aktif. Data disimpan di browser.",
  );

  const selectedVillage = useMemo(
    () => villages.find((village) => village.id === selectedId),
    [selectedId, villages],
  );

  const districtVillages = useMemo(
    () => villages.filter((village) => village.district === adminDistrict),
    [adminDistrict, villages],
  );

  const [form, setForm] = useState<VillageFormValues>(
    selectedVillage ?? emptyForm,
  );

  useEffect(() => {
    async function loadSession() {
      if (!supabase) {
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setAuthenticated(true);
        setMessage("Session admin aktif. Perubahan akan dikirim ke Supabase.");
      }
    }

    loadSession();
  }, []);

  function pickVillage(id: string) {
    const village = villages.find((item) => item.id === id);
    setSelectedId(id);
    setForm(village ?? { ...emptyForm, district: adminDistrict });
    if (village) {
      setAdminDistrict(village.district);
    }
  }

  function createVillage() {
    const nextForm = {
      ...emptyForm,
      district: adminDistrict,
    };
    setSelectedId("");
    setForm(nextForm);
    setMessage("Form input desa baru siap diisi.");
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Isi email dan password admin terlebih dahulu.");
      return;
    }

    if (!supabase) {
      setAuthenticated(true);
      setMessage("Mode demo aktif. Anda bisa mengedit data tanpa Supabase.");
      return;
    }

    setIsAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsAuthLoading(false);

    if (error) {
      setMessage(getFriendlyAuthMessage(error.message));
      return;
    }

    setAuthenticated(true);
    setMessage("Login berhasil. Perubahan akan dikirim ke Supabase.");
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Isi email dan password untuk membuat admin pertama.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password minimal 6 karakter.");
      return;
    }

    if (!supabase) {
      setAuthenticated(true);
      setMessage("Mode demo aktif. Supabase belum dikonfigurasi.");
      return;
    }

    setIsAuthLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setIsAuthLoading(false);

    if (error) {
      setMessage(getFriendlyAuthMessage(error.message));
      return;
    }

    if (data.session) {
      setAuthenticated(true);
      setMessage("Admin pertama berhasil dibuat dan sudah login.");
      return;
    }

    setMessage(
      "Admin berhasil dibuat. Cek email untuk konfirmasi, lalu login kembali.",
    );
    setAuthMode("login");
  }

  async function saveVillage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanForm: VillageFormValues = {
      ...form,
      id: form.id || slugify(`${form.district}-${form.name}`),
    };
    const nextVillage: Village = {
      ...cleanForm,
      updatedAt: new Date().toISOString(),
    };
    const nextVillages = villages.some((village) => village.id === nextVillage.id)
      ? villages.map((village) =>
          village.id === nextVillage.id ? nextVillage : village,
        )
      : [...villages, nextVillage];

    if (supabase) {
      const { error } = await supabase
        .from("villages")
        .upsert(villageToRow(cleanForm));

      if (error) {
        setMessage(error.message);
        return;
      }
    }

    onVillagesChange(nextVillages);
    setSelectedId(nextVillage.id);
    setAdminDistrict(nextVillage.district);
    setForm(cleanForm);
    setMessage("Data desa tersimpan dan tampil otomatis di peta.");
  }

  async function deleteVillage() {
    if (!selectedId) {
      setMessage("Pilih data desa yang ingin dihapus.");
      return;
    }

    if (supabase) {
      const { error } = await supabase.from("villages").delete().eq("id", selectedId);

      if (error) {
        setMessage(error.message);
        return;
      }
    }

    const nextVillages = villages.filter((village) => village.id !== selectedId);
    const nextDistrictVillages = nextVillages.filter(
      (village) => village.district === adminDistrict,
    );
    const nextSelectedVillage = nextDistrictVillages[0] ?? nextVillages[0];

    onVillagesChange(nextVillages);
    setSelectedId(nextSelectedVillage?.id ?? "");
    setForm(nextSelectedVillage ?? { ...emptyForm, district: adminDistrict });
    setMessage("Data desa berhasil dihapus.");
  }

  async function importExcel(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(
      firstSheet,
    );

    const imported = rows.map((row) => {
      const name = String(row.name ?? row.nama_desa ?? row.desa ?? "");
      const village: Village = {
        id: String(
          row.id ??
            slugify(
              `${String(row.district ?? row.kecamatan ?? "")}-${name}`,
            ),
        ),
        name,
        district: String(row.district ?? row.kecamatan ?? ""),
        population: Number(row.population ?? row.jumlah_penduduk ?? 0),
        households: Number(row.households ?? row.jumlah_kk ?? 0),
        healthCenters: Number(row.health_centers ?? row.puskesmas ?? 0),
        schools: Number(row.schools ?? row.sekolah ?? 0),
        publicFacilities: parseList(
          String(row.public_facilities ?? row.fasilitas_umum ?? ""),
        ),
        msmes: parseList(String(row.msmes ?? row.umkm ?? "")),
        potentials: parseList(String(row.potentials ?? row.potensi_desa ?? "")),
        updatedAt: new Date().toISOString(),
      };

      return village;
    });

    const merged = [...villages];
    imported.forEach((village) => {
      const index = merged.findIndex((item) => item.id === village.id);
      if (index >= 0) {
        merged[index] = village;
      } else {
        merged.push(village);
      }
    });

    if (supabase) {
      const { error } = await supabase
        .from("villages")
        .upsert(imported.map((village) => villageToRow(village)));

      if (error) {
        setMessage(error.message);
        return;
      }
    }

    onVillagesChange(merged);
    setMessage(`${imported.length} baris Excel/CSV berhasil diimpor.`);
  }

  return (
    <Card as="section" className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-teal-700 dark:text-emerald-300">Admin</p>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            CRUD Data Desa
          </h2>
        </div>
        <UserCheck className="size-5 text-teal-700 dark:text-emerald-300" />
      </div>

      {!authenticated ? (
        <form
          className="mt-4 space-y-3"
          onSubmit={authMode === "login" ? handleLogin : handleRegister}
        >
          <div className="grid grid-cols-2 rounded-md bg-slate-100 p-1 text-sm font-semibold dark:bg-white/5">
            <button
              className={`rounded px-3 py-2 transition ${
                authMode === "login"
                  ? "bg-white text-emerald-800 shadow-sm dark:bg-slate-900 dark:text-emerald-200"
                  : "text-slate-500 dark:text-slate-300"
              }`}
              onClick={() => setAuthMode("login")}
              type="button"
            >
              Masuk
            </button>
            <button
              className={`rounded px-3 py-2 transition ${
                authMode === "register"
                  ? "bg-white text-emerald-800 shadow-sm dark:bg-slate-900 dark:text-emerald-200"
                  : "text-slate-500 dark:text-slate-300"
              }`}
              onClick={() => setAuthMode("register")}
              type="button"
            >
              Buat Admin
            </button>
          </div>
          <Field
            label="Email"
            onChange={setEmail}
            type="email"
            value={email}
          />
          <Field
            label="Password"
            onChange={setPassword}
            type="password"
            value={password}
          />
          <button
            className="interactive-button inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
            disabled={isAuthLoading}
            type="submit"
          >
            <UserCheck className="size-4" />
            {isAuthLoading
              ? "Memproses..."
              : authMode === "login"
                ? "Masuk"
                : "Buat Admin Pertama"}
          </button>
        </form>
      ) : (
        <div className="mt-4 space-y-4">
          <SelectField
            label="Kelola Berdasarkan Kecamatan"
            onChange={(district) => {
              const firstVillage = villages.find(
                (village) => village.district === district,
              );

              setAdminDistrict(district);
              setSelectedId(firstVillage?.id ?? "");
              setForm(firstVillage ?? { ...emptyForm, district });
              setMessage(`Menampilkan data desa di Kecamatan ${district}.`);
            }}
            value={adminDistrict}
            values={districts}
          />

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white/80 px-3 text-sm outline-none ring-teal-600 focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
              onChange={(event) => pickVillage(event.target.value)}
              value={selectedId}
            >
              <option value="">Input desa baru di {adminDistrict}</option>
              {districtVillages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name}
                </option>
              ))}
            </select>
            <button
              className="interactive-button inline-flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white/80 text-emerald-700 dark:border-white/10 dark:bg-white/10 dark:text-emerald-200"
              onClick={createVillage}
              title="Input desa baru"
              type="button"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <form className="space-y-3" onSubmit={saveVillage}>
            <Field label="ID Desa" onChange={(id) => setForm({ ...form, id })} value={form.id} />
            <Field label="Nama Desa" onChange={(name) => setForm({ ...form, name })} value={form.name} />
            <SelectField
              label="Kecamatan"
              onChange={(district) => {
                setAdminDistrict(district);
                setSelectedId("");
                setForm({ ...form, district });
              }}
              value={form.district}
              values={districts}
            />
            <NumberField label="Jumlah Penduduk" onChange={(population) => setForm({ ...form, population })} value={form.population} />
            <NumberField label="Jumlah KK" onChange={(households) => setForm({ ...form, households })} value={form.households} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Puskesmas" onChange={(healthCenters) => setForm({ ...form, healthCenters })} value={form.healthCenters} />
              <NumberField label="Sekolah" onChange={(schools) => setForm({ ...form, schools })} value={form.schools} />
            </div>
            <TextArea label="Fasilitas Umum" onChange={(value) => setForm({ ...form, publicFacilities: parseList(value) })} value={form.publicFacilities.join(", ")} />
            <TextArea label="UMKM" onChange={(value) => setForm({ ...form, msmes: parseList(value) })} value={form.msmes.join(", ")} />
            <TextArea label="Potensi Desa" onChange={(value) => setForm({ ...form, potentials: parseList(value) })} value={form.potentials.join(", ")} />
            <button
              className="interactive-button inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
              type="submit"
            >
              <Save className="size-4" />
              Simpan Data
            </button>
          </form>

          <button
            className="interactive-button inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200"
            disabled={!selectedId}
            onClick={deleteVillage}
            type="button"
          >
            <Trash2 className="size-4" />
            Hapus Data
          </button>

          <label className="interactive-card flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 dark:border-white/15 dark:text-slate-200">
            <Upload className="size-4" />
            Import Excel/CSV
            <input
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={importExcel}
              type="file"
            />
          </label>
        </div>
      )}

      <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
        {message}
      </p>
    </Card>
  );
}

function Field({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <input
        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white/80 px-3 text-sm outline-none ring-teal-600 focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function NumberField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <input
        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white/80 px-3 text-sm outline-none ring-teal-600 focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  value,
  values,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
  values: string[];
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <select
        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white/80 px-3 text-sm outline-none ring-teal-600 focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <textarea
        className="mt-1 min-h-20 w-full rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function getFriendlyAuthMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Email atau password salah, atau user admin belum dibuat di Supabase Auth.";
  }

  if (lower.includes("email not confirmed")) {
    return "Email admin belum dikonfirmasi. Cek inbox email atau matikan email confirmation di Supabase Auth untuk development.";
  }

  if (lower.includes("user already registered")) {
    return "Email ini sudah terdaftar. Gunakan tab Masuk.";
  }

  if (lower.includes("signup") && lower.includes("disabled")) {
    return "Pendaftaran user dinonaktifkan di Supabase. Buat user admin lewat Supabase Dashboard > Authentication > Users.";
  }

  return message;
}
