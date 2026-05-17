import type { SupabaseVillageRow, Village, VillageFormValues } from "@/lib/types";

export function rowToVillage(row: SupabaseVillageRow): Village {
  return {
    id: row.id,
    name: row.name,
    district: row.district,
    population: row.population ?? 0,
    households: row.households ?? 0,
    healthCenters: row.health_centers ?? 0,
    schools: row.schools ?? 0,
    publicFacilities: row.public_facilities ?? [],
    msmes: row.msmes ?? [],
    potentials: row.potentials ?? [],
    updatedAt: row.updated_at,
  };
}

export function villageToRow(village: VillageFormValues) {
  return {
    id: village.id,
    name: village.name,
    district: village.district,
    population: village.population,
    households: village.households,
    health_centers: village.healthCenters,
    schools: village.schools,
    public_facilities: village.publicFacilities,
    msmes: village.msmes,
    potentials: village.potentials,
  };
}

export function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
