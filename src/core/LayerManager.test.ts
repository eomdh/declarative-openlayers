import { Feature } from "ol";
import { Point } from "ol/geom";
import type VectorLayer from "ol/layer/Vector";
import OLMap from "ol/Map";
import OSM from "ol/source/OSM";
import type VectorSource from "ol/source/Vector";
import { describe, expect, it } from "vitest";
import { LayerManager } from "./LayerManager";

// target 없이 만든다. 렌더는 안 되지만 레이어 컬렉션 조작은 다 된다.
function headlessMap(): OLMap {
  return new OLMap({ layers: [] });
}

function tile() {
  return { kind: "tile", source: new OSM() } as const;
}

function vector(features: Feature[] = []) {
  return { kind: "vector", features } as const;
}

function olLayerCount(map: OLMap): number {
  return map.getLayers().getLength();
}

describe("등록과 제거", () => {
  it("add 하면 맵과 레지스트리 양쪽에 들어간다", () => {
    const map = headlessMap();
    const manager = new LayerManager(map);

    manager.add("base", tile());

    expect(manager.has("base")).toBe(true);
    expect(olLayerCount(map)).toBe(1);
  });

  it("remove 하면 양쪽에서 사라진다", () => {
    const map = headlessMap();
    const manager = new LayerManager(map);
    const handle = manager.add("base", tile());

    manager.remove(handle.key);

    expect(manager.has("base")).toBe(false);
    expect(olLayerCount(map)).toBe(0);
  });

  it("같은 키로 add 하면 이전 레이어를 걷어낸다", () => {
    const map = headlessMap();
    const manager = new LayerManager(map);

    manager.add("layer", vector());
    manager.add("layer", vector());

    expect(olLayerCount(map)).toBe(1);
  });
});

describe("zIndex 정렬", () => {
  it("넣은 순서와 무관하게 zIndex 순으로 돌려준다", () => {
    const map = headlessMap();
    const manager = new LayerManager(map);

    manager.add("mid", vector(), 5);
    manager.add("top", vector(), 9);
    manager.add("bottom", tile(), 0);

    expect(manager.ordered().map((h) => h.key)).toEqual(["bottom", "mid", "top"]);
  });

  it("setZIndex 로 순서가 바뀐다", () => {
    const map = headlessMap();
    const manager = new LayerManager(map);
    manager.add("a", vector(), 1);
    const b = manager.add("b", vector(), 2);

    manager.setZIndex(b, 0);

    expect(manager.ordered().map((h) => h.key)).toEqual(["b", "a"]);
  });
});

describe("feature 교체 (깜빡임 없음)", () => {
  it("교체해도 OL 레이어 객체가 그대로다", () => {
    const map = headlessMap();
    const manager = new LayerManager(map);
    const handle = manager.add("v", vector([point(0, 0)]));

    const before = map.getLayers().item(0);
    manager.replaceFeatures(handle, [point(1, 1), point(2, 2)]);
    const after = map.getLayers().item(0);

    // 같은 객체여야 한다. 새로 만들면 깜빡인다.
    expect(after).toBe(before);
  });

  it("교체하면 이전 feature 는 사라지고 새것만 남는다", () => {
    const map = headlessMap();
    const manager = new LayerManager(map);
    const handle = manager.add("v", vector([point(0, 0), point(1, 1)]));

    manager.replaceFeatures(handle, [point(9, 9)]);

    const source = (map.getLayers().item(0) as VectorLayer).getSource() as VectorSource;
    expect(source.getFeatures()).toHaveLength(1);
  });
});

describe("입력 무변조", () => {
  it("add 후에도 넘긴 spec 이 그대로다", () => {
    const map = headlessMap();
    const manager = new LayerManager(map);
    const spec = vector();

    manager.add("v", spec);

    // 원본은 delete options.layerType 으로 여기서 kind 를 지웠다.
    expect(spec.kind).toBe("vector");
  });
});

function point(x: number, y: number): Feature {
  return new Feature({ geometry: new Point([x, y]) });
}
