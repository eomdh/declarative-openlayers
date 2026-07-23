import type { Feature } from "ol";
import OSM from "ol/source/OSM";
import { useEffect, useState } from "react";
import { TileLayer, VectorLayer } from "../bindings/layers";
import { MapCanvas } from "../bindings/MapCanvas";
import { LayerPanel, type LayerState } from "./LayerPanel";
import { fillStyle, GROUPS, loadParcelGroups } from "./parcels";

const GIMJE: [number, number] = [126.875, 35.8];

// 각 그룹의 화면 상태. 렌더 트리가 이 상태를 그대로 반영한다.
const INITIAL: LayerState[] = GROUPS.map((group, index) => ({
  id: group.id,
  label: group.label,
  color: group.color,
  visible: true,
  zIndex: index + 1,
}));

export function App() {
  const [groups, setGroups] = useState<Feature[][] | null>(null);
  const [layers, setLayers] = useState<LayerState[]>(INITIAL);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadParcelGroups()
      .then(setGroups)
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <main>
      <header>
        <h1>선언형 OpenLayers</h1>
        <p>레이어를 컴포넌트로 다룬다. 오른쪽 목록이 곧 렌더 트리다.</p>
      </header>

      <div className="stage">
        <MapCanvas center={GIMJE} zoom={11} className="map">
          <TileLayer id="osm" source={new OSM()} zIndex={0} />
          {groups?.map((features, index) => {
            const state = layers.find((l) => l.id === GROUPS[index]?.id);
            if (!state) {
              return null;
            }
            return (
              <VectorLayer
                key={state.id}
                id={state.id}
                features={features}
                style={fillStyle(state.color)}
                visible={state.visible}
                zIndex={state.zIndex}
              />
            );
          })}
        </MapCanvas>

        <LayerPanel layers={layers} onChange={setLayers} />
      </div>

      {error && <p className="error">필지 로드 실패: {error}</p>}
      {!groups && !error && <p className="hint">필지 불러오는 중...</p>}
    </main>
  );
}
