// 공개 표면. 코어와 선언형 바인딩을 함께 내보낸다.

export { useManager } from "./bindings/context";
export { CustomLayer, ImageLayer, TileLayer, VectorLayer } from "./bindings/layers";
export { MapCanvas } from "./bindings/MapCanvas";
export { EPSG_5179, registerKoreanCRS } from "./core/crs";
export { LayerManager } from "./core/LayerManager";
export type { LayerHandle, LayerKind, LayerSpec } from "./core/types";
