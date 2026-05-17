"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { LatLngBoundsExpression, Layer } from "leaflet";
import L from "leaflet";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { Village, VillageFeature, VillageGeoJson } from "@/lib/types";

const villageMarkerIcon = L.divIcon({
  className: "village-marker",
  html: '<span></span>',
  iconAnchor: [12, 24],
  iconSize: [24, 24],
  popupAnchor: [0, -22],
});

const selectedMarkerIcon = L.divIcon({
  className: "village-marker village-marker--selected",
  html: '<span></span>',
  iconAnchor: [15, 30],
  iconSize: [30, 30],
  popupAnchor: [0, -28],
});

type VillageMapProps = {
  geoJson: VillageGeoJson;
  villages: Village[];
  selectedVillageId: string;
  onSelectVillage: (id: string) => void;
};

function FitBounds({ geoJson }: { geoJson: VillageGeoJson }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.geoJSON(geoJson).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.12), { animate: false });
    }
  }, [geoJson, map]);

  return null;
}

function SelectedVillageFlyTo({
  geoJson,
  selectedVillageId,
}: {
  geoJson: VillageGeoJson;
  selectedVillageId: string;
}) {
  const map = useMap();

  useEffect(() => {
    const selectedFeature = geoJson.features.find(
      (feature) => feature.properties.villageId === selectedVillageId,
    );

    if (selectedFeature) {
      const bounds = L.geoJSON(selectedFeature).getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds.pad(0.18), { duration: 0.6, maxZoom: 14 });
      }
    }
  }, [geoJson, map, selectedVillageId]);

  return null;
}

export function VillageMap({
  geoJson,
  villages,
  selectedVillageId,
  onSelectVillage,
}: VillageMapProps) {
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const layerByVillageIdRef = useRef(new Map<string, Layer>());
  const markerByVillageIdRef = useRef(new Map<string, L.Marker>());
  const villageById = useMemo(
    () => new Map(villages.map((village) => [village.id, village])),
    [villages],
  );
  const firstVillageByDistrict = useMemo(() => {
    const items = new Map<string, Village>();
    villages.forEach((village) => {
      if (!items.has(village.district)) {
        items.set(village.district, village);
      }
    });
    return items;
  }, [villages]);
  const selectedVillage = villageById.get(selectedVillageId);
  const villageMarkers = useMemo(
    () => createVillageMarkers(geoJson, villages),
    [geoJson, villages],
  );

  const bounds = useMemo<LatLngBoundsExpression>(() => {
    const leafletBounds = L.geoJSON(geoJson).getBounds();
    if (!leafletBounds.isValid()) {
      return [
        [-6.36, 106.77],
        [-6.23, 106.89],
      ];
    }

    return leafletBounds;
  }, [geoJson]);

  const styleFeature = useCallback(
    (feature?: VillageFeature) => {
      const isSelected =
        feature?.properties.villageId === selectedVillageId ||
        feature?.properties.district === selectedVillage?.district;

      return {
        color: isSelected ? "#f97316" : "#0f766e",
        fillColor: isSelected ? "#fdba74" : "#5eead4",
        fillOpacity: isSelected ? 0.64 : 0.42,
        opacity: 1,
        weight: isSelected ? 3 : 1.5,
      };
    },
    [selectedVillage?.district, selectedVillageId],
  );

  useEffect(() => {
    geoJsonRef.current?.setStyle((feature) =>
      styleFeature(feature as VillageFeature),
    );
  }, [selectedVillageId, styleFeature]);

  useEffect(() => {
    const selectedMarker = markerByVillageIdRef.current.get(selectedVillageId);
    if (selectedMarker) {
      selectedMarker.openPopup();
      return;
    }

    const selectedLayer =
      layerByVillageIdRef.current.get(selectedVillageId) ??
      (selectedVillage
        ? layerByVillageIdRef.current.get(selectedVillage.district)
        : undefined);

    if (selectedLayer && "openPopup" in selectedLayer) {
      selectedLayer.openPopup();
    }
  }, [selectedVillage, selectedVillageId]);

  return (
    <MapContainer
      bounds={bounds}
      className="h-full min-h-[520px] w-full"
      scrollWheelZoom
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        data={geoJson}
        ref={(instance) => {
          geoJsonRef.current = instance;
        }}
        style={(feature) => styleFeature(feature as VillageFeature)}
        onEachFeature={(feature, layer: Layer) => {
          const typedFeature = feature as VillageFeature;
          const villageId = typedFeature.properties.villageId;
          const village =
            villageById.get(villageId) ??
            (selectedVillage?.district === typedFeature.properties.district
              ? selectedVillage
              : undefined) ??
            firstVillageByDistrict.get(typedFeature.properties.district);
          layerByVillageIdRef.current.set(villageId, layer);
          layerByVillageIdRef.current.set(typedFeature.properties.district, layer);

          layer.on({
            click: () => onSelectVillage(village?.id ?? villageId),
            mouseout: () => {
              if (geoJsonRef.current) {
                geoJsonRef.current.resetStyle(layer);
              }
            },
            mouseover: () => {
              const pathLayer = layer as L.Path;
              pathLayer.setStyle({ fillOpacity: 0.7, weight: 3 });
            },
          });

          layer.bindTooltip(typedFeature.properties.name, {
            direction: "center",
            opacity: 0.92,
            sticky: true,
          });

          if (village) {
            layer.bindPopup(() => {
              return createVillagePopup(village);
            });
          }
        }}
      />
      {villageMarkers.map(({ lat, lng, village }) => (
        <Marker
          eventHandlers={{ click: () => onSelectVillage(village.id) }}
          icon={village.id === selectedVillageId ? selectedMarkerIcon : villageMarkerIcon}
          key={village.id}
          position={[lat, lng]}
          ref={(marker) => {
            if (marker) {
              markerByVillageIdRef.current.set(village.id, marker);
            } else {
              markerByVillageIdRef.current.delete(village.id);
            }
          }}
        >
          <Popup>
            <VillagePopupContent village={village} />
          </Popup>
        </Marker>
      ))}
      <FitBounds geoJson={geoJson} />
      <SelectedVillageFlyTo
        geoJson={geoJson}
        selectedVillageId={selectedVillageId}
      />
    </MapContainer>
  );
}

function VillagePopupContent({ village }: { village: Village }) {
  return (
    <div className="village-popup">
      <div className="village-popup__header">
        <div>
          <p className="village-popup__title">{village.name.toUpperCase()}</p>
          <p className="village-popup__subtitle">
            Kec. {village.district}, Kab. Nias
          </p>
        </div>
      </div>
      <div className="village-popup__table">
        <PopupRow label="Provinsi" value="SUMATERA UTARA" />
        <PopupRow label="Kabupaten/Kota" value="KAB. NIAS" />
        <PopupRow label="Kecamatan" value={village.district.toUpperCase()} />
        <PopupRow label="Kelurahan/Desa" value={village.name.toUpperCase()} />
        <PopupRow
          label="Jumlah Penduduk"
          value={village.population.toLocaleString("id-ID")}
        />
        <PopupRow
          label="Jumlah Kepala Keluarga"
          value={village.households.toLocaleString("id-ID")}
        />
        <PopupRow label="Puskesmas" value={`${village.healthCenters} unit`} />
        <PopupRow label="Sekolah" value={`${village.schools} unit`} />
        <PopupRow
          label="Fasilitas Umum"
          value={village.publicFacilities.join(", ") || "-"}
        />
        <PopupRow label="UMKM" value={village.msmes.join(", ") || "-"} />
        <PopupRow
          label="Potensi Desa"
          value={village.potentials.join(", ") || "-"}
        />
      </div>
      <div className="village-popup__note">
        Marker desa bersifat indikatif sampai koordinat/batas resmi desa diimpor.
      </div>
    </div>
  );
}

function PopupRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="village-popup__row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function createVillagePopup(village: Village) {
  const wrapper = document.createElement("div");
  wrapper.className = "village-popup";
  wrapper.innerHTML = `
    <div class="village-popup__header">
      <div>
        <p class="village-popup__title">${escapeHtml(village.name.toUpperCase())}</p>
        <p class="village-popup__subtitle">Kec. ${escapeHtml(village.district)}, Kab. Nias</p>
      </div>
    </div>
    <div class="village-popup__table">
      ${popupRow("Provinsi", "SUMATERA UTARA")}
      ${popupRow("Kabupaten/Kota", "KAB. NIAS")}
      ${popupRow("Kecamatan", village.district.toUpperCase())}
      ${popupRow("Kelurahan/Desa", village.name.replace(/^Kecamatan\s+/i, "").toUpperCase())}
      ${popupRow("Jumlah Penduduk", village.population.toLocaleString("id-ID"))}
      ${popupRow("Jumlah Kepala Keluarga", village.households.toLocaleString("id-ID"))}
      ${popupRow("Puskesmas", `${village.healthCenters.toLocaleString("id-ID")} unit`)}
      ${popupRow("Sekolah", `${village.schools.toLocaleString("id-ID")} unit`)}
      ${popupRow("Fasilitas Umum", village.publicFacilities.join(", ") || "-")}
      ${popupRow("UMKM", village.msmes.join(", ") || "-")}
      ${popupRow("Potensi Desa", village.potentials.join(", ") || "-")}
    </div>
    <div class="village-popup__note">
      Batas wilayah pada peta bersifat indikatif. Referensi visual: GIS Dukcapil Kemendagri.
    </div>
  `;

  return wrapper;
}

function popupRow(label: string, value: string) {
  return `
    <div class="village-popup__row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createVillageMarkers(geoJson: VillageGeoJson, villages: Village[]) {
  return villages
    .map((village) => {
      const feature = geoJson.features.find(
        (item) => item.properties.district === village.district,
      );

      if (!feature) {
        return null;
      }

      const siblings = villages.filter((item) => item.district === village.district);
      const index = siblings.findIndex((item) => item.id === village.id);
      const bounds = L.geoJSON(feature).getBounds();

      if (!bounds.isValid()) {
        return null;
      }

      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();
      const cols = Math.ceil(Math.sqrt(siblings.length));
      const rows = Math.ceil(siblings.length / cols);
      const col = index % cols;
      const row = Math.floor(index / cols);
      const latStep = (northEast.lat - southWest.lat) / (rows + 1);
      const lngStep = (northEast.lng - southWest.lng) / (cols + 1);
      const latJitter = ((index % 3) - 1) * latStep * 0.12;
      const lngJitter = (((index + 1) % 3) - 1) * lngStep * 0.12;

      return {
        lat: northEast.lat - latStep * (row + 1) + latJitter,
        lng: southWest.lng + lngStep * (col + 1) + lngJitter,
        village,
      };
    })
    .filter((item): item is { lat: number; lng: number; village: Village } =>
      Boolean(item),
    );
}
