import type { Feature } from "ol";
import type OLBaseLayer from "ol/layer/Base";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
// 전역 Map 을 가리지 않도록 이름을 바꿔 들여온다.
import type OLMap from "ol/Map";
import VectorSource from "ol/source/Vector";
import type { ImageSpec, LayerHandle, LayerKind, LayerSpec, TileSpec, VectorSpec } from "./types";

interface Entry {
  kind: LayerKind;
  layer: OLBaseLayer;
  zIndex: number;
}

/**
 * 키로 레이어를 관리한다. 명령형 OL 조작은 전부 여기 갇힌다.
 *
 * OL Map 만 있으면 되고 React 는 모른다. zIndex 정렬과 교체 멱등성 같은
 * 어려운 부분을 프레임워크 없이 테스트하려는 분리다.
 */
export class LayerManager {
  private readonly map: OLMap;
  private readonly entries = new Map<string, Entry>();

  constructor(map: OLMap) {
    this.map = map;
  }

  /**
   * 레이어를 만들어 등록한다. 같은 키가 있으면 먼저 걷어낸다.
   *
   * 돌려주는 손잡이가 종류를 타입으로 들고 있어서, 뒤에 벡터 전용 동작을
   * 부를 때 컴파일 단계에서 종류가 맞는지 걸러진다.
   */
  add<S extends LayerSpec>(key: string, spec: S, zIndex = 0): LayerHandle<S["kind"]> {
    this.remove(key);

    const layer = build(spec);
    layer.setZIndex(zIndex);
    this.entries.set(key, { kind: spec.kind, layer, zIndex });
    this.map.addLayer(layer);

    return { key, kind: spec.kind };
  }

  remove(key: string): void {
    const entry = this.entries.get(key);
    if (entry) {
      this.map.removeLayer(entry.layer);
      this.entries.delete(key);
    }
  }

  setVisible(handle: LayerHandle, visible: boolean): void {
    this.entry(handle).layer.setVisible(visible);
  }

  setZIndex(handle: LayerHandle, zIndex: number): void {
    const entry = this.entry(handle);
    entry.zIndex = zIndex;
    entry.layer.setZIndex(zIndex);
  }

  /**
   * feature 만 갈아끼운다. 레이어를 새로 만들지 않으므로 화면이 깜빡이지 않는다.
   *
   * 벡터 손잡이만 받는다. 다른 종류는 소스에 feature 개념이 없어서, 타입으로
   * 막는다(원본은 런타임에 throw 했다).
   */
  replaceFeatures(handle: LayerHandle<"vector">, features: Feature[]): void {
    const source = (this.entry(handle).layer as VectorLayer).getSource();
    if (!source) {
      return;
    }
    source.clear();
    source.addFeatures(features);
  }

  /** 등록 순서가 아니라 zIndex 순으로 돌려준다. 레이어 목록 UI 가 이걸 그린다. */
  ordered(): LayerHandle[] {
    return [...this.entries.entries()]
      .sort((a, b) => a[1].zIndex - b[1].zIndex)
      .map(([key, entry]) => ({ key, kind: entry.kind }));
  }

  has(key: string): boolean {
    return this.entries.has(key);
  }

  private entry(handle: LayerHandle): Entry {
    const entry = this.entries.get(handle.key);
    if (!entry) {
      throw new Error(`등록되지 않은 레이어다: ${handle.key}`);
    }
    return entry;
  }
}

function build(spec: LayerSpec): OLBaseLayer {
  switch (spec.kind) {
    case "tile":
      return new TileLayer({ source: (spec as TileSpec).source });
    case "image":
      return new ImageLayer({ source: (spec as ImageSpec).source });
    case "vector":
      return buildVector(spec as VectorSpec);
    case "custom":
      return spec.layer;
  }
}

function buildVector(spec: VectorSpec): VectorLayer {
  const source = new VectorSource();
  const layer = new VectorLayer({ source, style: spec.style });

  if (spec.features) {
    // Promise 든 배열이든 받는다. 비동기면 도착하는 대로 채운다.
    Promise.resolve(spec.features).then((features) => source.addFeatures(features));
  }
  return layer;
}
