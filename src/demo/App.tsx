import type { Feature } from "ol";
import OSM from "ol/source/OSM";
import { useEffect, useState } from "react";
import { TileLayer, VectorLayer } from "../bindings/layers";
import { MapCanvas } from "../bindings/MapCanvas";
import { type LayerState, LayerTree } from "./LayerTree";
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
    <div className="app">
      <div className="frame">
        <div className="topbar">
          <span className="mark" />
          <span className="wordmark">declarative-openlayers</span>
        </div>

        <div className="split">
          <LayerTree layers={layers} onChange={setLayers} />

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
        </div>
      </div>

      {error && <p className="msg error">필지 로드 실패: {error}</p>}
      {!groups && !error && <p className="msg hint">필지 불러오는 중...</p>}
    </div>
  );
}
