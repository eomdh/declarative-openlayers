import { render } from "@testing-library/react";
import OSM from "ol/source/OSM";
import { type ReactNode, useEffect } from "react";
import { describe, expect, it } from "vitest";
import type { LayerManager } from "../core/LayerManager";
import { useManager } from "./context";
import { TileLayer, VectorLayer } from "./layers";
import { MapCanvas } from "./MapCanvas";

// 매니저를 밖으로 꺼내 상태를 들여다본다. 자식이라 context 로 받는다.
function Probe({ onReady }: { onReady: (m: LayerManager) => void }) {
  const manager = useManager();
  useEffect(() => {
    onReady(manager);
  }, [manager, onReady]);
  return null;
}

function mount(children: ReactNode) {
  let manager: LayerManager | undefined;
  const result = render(
    <MapCanvas center={[126.87, 35.8]} zoom={11}>
      <Probe onReady={(m) => (manager = m)} />
      {children}
    </MapCanvas>,
  );
  if (!manager) {
    throw new Error("매니저가 준비되지 않았다");
  }
  return { manager, ...result };
}

const withMap = (children: ReactNode) => (
  <MapCanvas center={[126.87, 35.8]} zoom={11}>
    <Probe onReady={() => {}} />
    {children}
  </MapCanvas>
);

describe("선언형 레이어", () => {
  it("마운트하면 매니저에 등록된다", () => {
    const { manager } = mount(<TileLayer id="osm" source={new OSM()} />);

    expect(manager.has("osm")).toBe(true);
  });

  it("언마운트하면 걷어낸다", () => {
    const { manager, rerender } = mount(<TileLayer id="osm" source={new OSM()} />);
    expect(manager.has("osm")).toBe(true);

    rerender(withMap(null));

    expect(manager.has("osm")).toBe(false);
  });

  it("렌더 트리 순서가 곧 레이어 스택이다", () => {
    const { manager } = mount(
      <>
        <TileLayer id="base" source={new OSM()} zIndex={0} />
        <VectorLayer id="parcels" zIndex={2} />
      </>,
    );

    expect(manager.has("base")).toBe(true);
    expect(manager.has("parcels")).toBe(true);
    expect(manager.ordered().map((h) => h.key)).toEqual(["base", "parcels"]);
  });
});
