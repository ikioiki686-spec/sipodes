import type { Village, VillageGeoJson } from "@/lib/types";

const updatedAt = "2026-05-17T00:00:00.000Z";

type DistrictSeed = {
  district: string;
  population: number;
  households: number;
  healthCenters: number;
  schools: number;
  villages: string[];
};

export const niasDistricts = [
  "Bawolato",
  "Botomuzoi",
  "Gido",
  "Hiliduho",
  "Hiliserangkai",
  "Idanogawo",
  "Ma'u",
  "Sogae'adu",
  "Somolo-molo",
  "Ulugawo",
];

export const niasVillageNamesByDistrict: Record<string, string[]> = {
  Bawolato: [
    "Balale Toba'a",
    "Banua Sibohou Silima Ewali",
    "Botohaenga",
    "Dahana",
    "Gazamanu",
    "Hilialawa",
    "Hilifaosi",
    "Hiliganoita",
    "Hilihao Cugala",
    "Hilihoru",
    "Hiliwarokha",
    "Hou",
    "Lagasimahe",
    "Orahili",
    "Orahua",
    "Orahua Faondrato",
    "Sifaoroasi Ulu Hou",
    "Sindrondro",
    "Siofabanua",
    "Siofaewali",
    "Si'ofaewali Selatan",
    "Sisarahili Bawolato",
    "Sitolu Banua",
    "Sohoya",
    "Tagaule",
  ],
  Botomuzoi: [
    "Balohili Botomuzoi",
    "Banua Sibohou Botomuzoi",
    "Fulolo Botomuzoi",
    "Hiligodu Botomuzoi",
    "Hilihambawa Botomuzoi",
    "Hilimbowo Botomuzoi",
    "Hiliwa'ele I",
    "Hiliwa'ele II",
    "Lasara Botomuzoi",
    "Loloana'a",
    "Ola Nori",
    "Ononamolo Talafu",
    "Mohili Berua Botomuzoi",
    "Simanaere Botomuzoi",
    "Sisobahili Dola",
    "Talafu",
    "Tetehosi Botomuzoi",
    "Tuhegafoa I",
  ],
  Gido: [
    "Akhelaume",
    "Hiliotalua",
    "Hilisebua",
    "Hiliweto Gido",
    "Hilizoi",
    "Ladea",
    "Ladea Orahua",
    "Lahemo",
    "Lasara Idanoi",
    "Lasela",
    "Loloanaa Gido",
    "Lolozasai",
    "Nifolo'o Lauru",
    "Olindrawa Sisarahili",
    "Sirete",
    "Sisobahili",
    "Saewe",
    "Somi",
    "Somi Botogo'o",
    "Tulumbaho Salo'o",
    "Umbu",
  ],
  Hiliduho: [
    "Dima",
    "Fadoro Lauru",
    "Hiliduho",
    "Hiligodu Tanoseo",
    "Lasara Tanoseo",
    "Mazingo Tanoseo",
    "Ombolata Saloo",
    "Ombolata Sisarahili",
    "Ononamolo I Botomuzoi",
    "Onowaembo Hiligara",
    "Onozitoli Dulu",
    "Silimabanua",
    "Sinarikhi",
    "Sisobahili I Tanoseo",
    "Sisobalauru",
    "Tuhegafoa II",
  ],
  Hiliserangkai: [
    "Awela",
    "Dahadano Botombawo",
    "Ehosakhozi",
    "Fadoro Hunogoa",
    "Fadoro Lalai",
    "Fulolo Lalai",
    "Hilizia Lauru",
    "Lalai I/II",
    "Lawa Lawa",
    "Lolofaoso",
    "Lolofaoso Lalai",
    "Lolowua",
    "Lolowua Hiliwarasi",
    "Orahili Idanoi",
    "Onombongi",
  ],
  Idanogawo: [
    "Ahedano",
    "Awoni Lauso",
    "Baruzo",
    "Biouti",
    "Biouti Timur",
    "Bobozioli Loloana'a",
    "Bozihona",
    "Hili'adulo",
    "Hiligogowaya Maliwa'a",
    "Hililawae",
    "Hilimoasio",
    "Hilimoasio Dua",
    "Hilina'a Tafuo",
    "Hiliono Zega",
    "Laira",
    "Laowo Hilimbaruzo",
    "Maliwa'a",
    "Mondrali",
    "Oladano",
    "Orahili Zuzundrao",
    "Otalua",
    "Sandruta",
    "Saiwahili Hili'adulo",
    "Sisobahili Iraono Hura",
    "Tiga Serangkai Maliwa'a",
    "Tetegeona'ai",
    "Tetehosi",
    "Tuhewaebu",
  ],
  "Ma'u": [
    "Atualuo",
    "Balodano",
    "Dekha",
    "Lasara Siwalu Banua",
    "Lewa-lewa",
    "Lewuaguru II",
    "Sihaero III",
    "Sihare'o III Bawosalo'o Berua",
    "Sihare'o III Hilibadalu",
    "Sisarahilima'u",
    "Tuhemberua",
  ],
  "Sogae'adu": [
    "Baruzo",
    "Hilibadalu",
    "Hilimbana",
    "La'uri",
    "Saitagaramba",
    "Sihare'o Sogae'adu",
    "Sisarahili Sogae'adu",
    "Sogae'adu",
    "Tuhembuasi",
    "Tulumbaho",
    "We'a-we'a",
  ],
  "Somolo-molo": [
    "Huno",
    "Hiliborodano",
    "Hiligodu Somolo-Molo",
    "Iodano",
    "Lewuoguru I",
    "Lewuombanua",
    "Sifaoroasi",
    "Sisaratandrawa",
    "Sisobawino I",
    "Somolo-molo",
    "So'ewali",
  ],
  Ulugawo: [
    "Fahandrona",
    "Fatodano",
    "Hilibadalu",
    "Hiligafoa",
    "Hilimbowo",
    "Hiliweto Gela",
    "Holi",
    "Lawa Lawaluo",
    "Mohili",
    "Onodalinga",
    "Orahili",
    "Sifaoroasi Ulugawo",
    "Sisarahili Soroma'asi",
    "Sisobahili Ulugawo",
  ],
};

const districtSeeds: DistrictSeed[] = [
  {
    district: "Bawolato",
    population: 26610,
    households: 6653,
    healthCenters: 2,
    schools: 25,
    villages: niasVillageNamesByDistrict.Bawolato,
  },
  {
    district: "Botomuzoi",
    population: 10231,
    households: 2558,
    healthCenters: 1,
    schools: 18,
    villages: niasVillageNamesByDistrict.Botomuzoi,
  },
  {
    district: "Gido",
    population: 25101,
    households: 6275,
    healthCenters: 4,
    schools: 21,
    villages: niasVillageNamesByDistrict.Gido,
  },
  {
    district: "Hiliduho",
    population: 10417,
    households: 2604,
    healthCenters: 1,
    schools: 16,
    villages: niasVillageNamesByDistrict.Hiliduho,
  },
  {
    district: "Hiliserangkai",
    population: 13339,
    households: 3335,
    healthCenters: 1,
    schools: 15,
    villages: niasVillageNamesByDistrict.Hiliserangkai,
  },
  {
    district: "Idanogawo",
    population: 28456,
    households: 7114,
    healthCenters: 3,
    schools: 28,
    villages: niasVillageNamesByDistrict.Idanogawo,
  },
  {
    district: "Ma'u",
    population: 11399,
    households: 2850,
    healthCenters: 1,
    schools: 11,
    villages: niasVillageNamesByDistrict["Ma'u"],
  },
  {
    district: "Sogae'adu",
    population: 12479,
    households: 3120,
    healthCenters: 1,
    schools: 11,
    villages: niasVillageNamesByDistrict["Sogae'adu"],
  },
  {
    district: "Somolo-molo",
    population: 6918,
    households: 1730,
    healthCenters: 1,
    schools: 11,
    villages: niasVillageNamesByDistrict["Somolo-molo"],
  },
  {
    district: "Ulugawo",
    population: 10679,
    households: 2670,
    healthCenters: 1,
    schools: 14,
    villages: niasVillageNamesByDistrict.Ulugawo,
  },
];

export const sampleVillages: Village[] = districtSeeds.flatMap((seed) =>
  seed.villages.map((name, index) => {
    const count = seed.villages.length;
    const population =
      Math.floor(seed.population / count) +
      (index < seed.population % count ? 1 : 0);
    const households =
      Math.floor(seed.households / count) +
      (index < seed.households % count ? 1 : 0);

    return {
      id: slugify(`${seed.district}-${name}`),
      name,
      district: seed.district,
      population,
      households,
      healthCenters: index === 0 ? seed.healthCenters : 0,
      schools: Math.max(0, Math.floor(seed.schools / count) + (index < seed.schools % count ? 1 : 0)),
      publicFacilities: ["Balai desa", "Tempat ibadah", "Posyandu"],
      msmes: ["Produk lokal", "Warung rakyat"],
      potentials: ["Pertanian", "Perkebunan", "UMKM desa"],
      updatedAt,
    };
  }),
);

export const sampleVillageGeoJson: VillageGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { villageId: "hiliduho", name: "Hiliduho", district: "Hiliduho" },
      geometry: { type: "Polygon", coordinates: [[[97.53, 1.22], [97.61, 1.29], [97.68, 1.23], [97.62, 1.15], [97.53, 1.22]]] },
    },
    {
      type: "Feature",
      properties: { villageId: "hiliserangkai", name: "Hiliserangkai", district: "Hiliserangkai" },
      geometry: { type: "Polygon", coordinates: [[[97.62, 1.15], [97.68, 1.23], [97.77, 1.18], [97.72, 1.09], [97.62, 1.15]]] },
    },
    {
      type: "Feature",
      properties: { villageId: "botomuzoi", name: "Botomuzoi", district: "Botomuzoi" },
      geometry: { type: "Polygon", coordinates: [[[97.68, 1.23], [97.79, 1.25], [97.86, 1.17], [97.77, 1.18], [97.68, 1.23]]] },
    },
    {
      type: "Feature",
      properties: { villageId: "gido", name: "Gido", district: "Gido" },
      geometry: { type: "Polygon", coordinates: [[[97.72, 1.09], [97.77, 1.18], [97.88, 1.08], [97.81, 0.99], [97.72, 1.09]]] },
    },
    {
      type: "Feature",
      properties: { villageId: "sogaeadu", name: "Sogae'adu", district: "Sogae'adu" },
      geometry: { type: "Polygon", coordinates: [[[97.81, 0.99], [97.88, 1.08], [97.96, 1.01], [97.9, 0.93], [97.81, 0.99]]] },
    },
    {
      type: "Feature",
      properties: { villageId: "mau", name: "Ma'u", district: "Ma'u" },
      geometry: { type: "Polygon", coordinates: [[[97.58, 1.04], [97.72, 1.09], [97.81, 0.99], [97.69, 0.92], [97.58, 1.04]]] },
    },
    {
      type: "Feature",
      properties: { villageId: "somolo-molo", name: "Somolo-molo", district: "Somolo-molo" },
      geometry: { type: "Polygon", coordinates: [[[97.49, 1.08], [97.58, 1.04], [97.69, 0.92], [97.57, 0.89], [97.49, 1.08]]] },
    },
    {
      type: "Feature",
      properties: { villageId: "ulugawo", name: "Ulugawo", district: "Ulugawo" },
      geometry: { type: "Polygon", coordinates: [[[97.69, 0.92], [97.81, 0.99], [97.9, 0.93], [97.81, 0.84], [97.69, 0.92]]] },
    },
    {
      type: "Feature",
      properties: { villageId: "idanogawo", name: "Idanogawo", district: "Idanogawo" },
      geometry: { type: "Polygon", coordinates: [[[97.81, 0.84], [97.9, 0.93], [98.02, 0.82], [97.93, 0.73], [97.81, 0.84]]] },
    },
    {
      type: "Feature",
      properties: { villageId: "bawolato", name: "Bawolato", district: "Bawolato" },
      geometry: { type: "Polygon", coordinates: [[[97.93, 0.73], [98.02, 0.82], [98.08, 0.66], [97.97, 0.56], [97.87, 0.64], [97.93, 0.73]]] },
    },
  ],
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
