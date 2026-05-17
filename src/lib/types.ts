import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";

export type Village = {
  id: string;
  name: string;
  district: string;
  population: number;
  households: number;
  healthCenters: number;
  schools: number;
  publicFacilities: string[];
  msmes: string[];
  potentials: string[];
  updatedAt: string;
};

export type VillageFormValues = Omit<Village, "updatedAt">;

export type VillageFeatureProperties = {
  villageId: string;
  name: string;
  district: string;
};

export type VillageGeoJson = FeatureCollection<
  Polygon | MultiPolygon,
  VillageFeatureProperties
>;

export type VillageFeature = Feature<
  Polygon | MultiPolygon,
  VillageFeatureProperties
>;

export type SupabaseVillageRow = {
  id: string;
  name: string;
  district: string;
  population: number;
  households: number;
  health_centers: number;
  schools: number;
  public_facilities: string[] | null;
  msmes: string[] | null;
  potentials: string[] | null;
  updated_at: string;
};
