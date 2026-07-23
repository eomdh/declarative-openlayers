import type { Feature } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

/** 데모가 쓰는 세 그룹. 필지를 나눠 여러 레이어의 토글·순서를 보여준다. */
export const GROUPS = [
  { id: "group-a", label: "구획 A", color: "#3182F6" },
  { id: "group-b", label: "구획 B", color: "#0FA958" },
  { id: "group-c", label: "구획 C", color: "#F59E0B" },
] as const;

/**
 * 필지 GeoJSON 을 받아 그룹별 feature 배열로 나눈다.
 *
 * 데이터는 옆 repo browser-geotiff-epsg5179 에서 그대로 가져왔다. 좌표가
 * EPSG:5179 라, 지도 좌표계(3857)로 옮기며 읽는다. 등록이 되어 있어야 한다.
 */
export async function loadParcelGroups(): Promise<Feature[][]> {
  const response = await fetch("/parcels.geojson");
  if (!response.ok) {
    throw new Error(`필지 데이터를 못 받았다 (${response.status})`);
  }

  const features = new GeoJSON().readFeatures(await response.json(), {
    dataProjection: "EPSG:5179",
    featureProjection: "EPSG:3857",
  });

  const groups: Feature[][] = GROUPS.map(() => []);
  features.forEach((feature, index) => {
    groups[index % GROUPS.length]?.push(feature);
  });
  return groups;
}

export function fillStyle(color: string): Style {
  return new Style({
    fill: new Fill({ color: `${color}55` }),
    stroke: new Stroke({ color, width: 1 }),
  });
}
