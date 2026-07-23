import type { Feature } from "ol";
import type BaseLayer from "ol/layer/Base";
import type ImageSource from "ol/source/Image";
import type TileSource from "ol/source/Tile";
import type { StyleLike } from "ol/style/Style";

/** 레이어 종류. 원본의 여섯 종에서 앱 종속인 vectorTile·webglTile 은 뺐다. */
export type LayerKind = "tile" | "vector" | "image" | "custom";

export interface TileSpec {
  kind: "tile";
  source: TileSource;
}

export interface VectorSpec {
  kind: "vector";
  /** 비동기로 받아온 feature 도 그대로 받는다. 없으면 빈 레이어로 시작한다. */
  features?: Feature[] | Promise<Feature[]>;
  style?: StyleLike;
}

export interface ImageSpec {
  kind: "image";
  source: ImageSource;
}

/** 지원하지 않는 종류나 이미 만든 OL 레이어를 그대로 얹을 때. */
export interface CustomSpec {
  kind: "custom";
  layer: BaseLayer;
}

export type LayerSpec = TileSpec | VectorSpec | ImageSpec | CustomSpec;

/**
 * 등록된 레이어를 가리키는 손잡이.
 *
 * 종류를 타입 파라미터로 들고 있는 게 핵심이다. `replaceFeatures` 처럼 벡터에만
 * 되는 동작은 `LayerHandle<"vector">` 만 받게 해서, 잘못된 종류를 넘기면 **런타임이
 * 아니라 컴파일에서 막힌다.** 원본은 여기서 throw 로 처리했다.
 */
export interface LayerHandle<K extends LayerKind = LayerKind> {
  readonly key: string;
  readonly kind: K;
}
