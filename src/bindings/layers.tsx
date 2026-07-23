import type { Feature } from "ol";
import type OLBaseLayer from "ol/layer/Base";
import type ImageSource from "ol/source/Image";
import type TileSource from "ol/source/Tile";
import type { StyleLike } from "ol/style/Style";
import { useEffect, useRef } from "react";
import type { LayerHandle } from "../core/types";
import { useManager } from "./context";

/**
 * 레이어 컴포넌트의 공통 뼈대.
 *
 * 마운트하면 매니저에 등록하고, 언마운트하면 걷어낸다. 렌더 트리에 있는 동안만
 * 지도에 있다. 이게 선언형이 되는 지점이다. 화면에 아무것도 그리지 않는다.
 *
 * key 는 처음 값으로 고정한다. 도중에 바꾸면 다른 레이어가 되므로 지원하지 않는다.
 */
function useLayer(register: () => LayerHandle, deps: unknown[]): LayerHandle | null {
  const manager = useManager();
  const handleRef = useRef<LayerHandle | null>(null);

  useEffect(() => {
    const handle = register();
    handleRef.current = handle;
    return () => manager.remove(handle.key);
    // register 는 매번 새로 만들어지므로 deps 로 제어한다.
    // biome-ignore lint/correctness/useExhaustiveDependencies: 등록은 마운트에서 한 번
  }, deps);

  return handleRef.current;
}

interface CommonProps {
  id: string;
  zIndex?: number;
  visible?: boolean;
}

/** prop 으로 온 가시성·zIndex 를 매니저에 반영한다. */
function useSync(handle: LayerHandle | null, { visible = true, zIndex = 0 }: CommonProps) {
  const manager = useManager();

  useEffect(() => {
    if (handle) {
      manager.setVisible(handle, visible);
    }
  }, [handle, visible, manager]);

  useEffect(() => {
    if (handle) {
      manager.setZIndex(handle, zIndex);
    }
  }, [handle, zIndex, manager]);
}

export function TileLayer(props: CommonProps & { source: TileSource }) {
  const manager = useManager();
  const handle = useLayer(
    () => manager.add(props.id, { kind: "tile", source: props.source }, props.zIndex),
    [props.id],
  );
  useSync(handle, props);
  return null;
}

export function ImageLayer(props: CommonProps & { source: ImageSource }) {
  const manager = useManager();
  const handle = useLayer(
    () => manager.add(props.id, { kind: "image", source: props.source }, props.zIndex),
    [props.id],
  );
  useSync(handle, props);
  return null;
}

export function VectorLayer(
  props: CommonProps & { features?: Feature[] | Promise<Feature[]>; style?: StyleLike },
) {
  const manager = useManager();
  const handle = useLayer(
    () =>
      manager.add(
        props.id,
        { kind: "vector", features: props.features, style: props.style },
        props.zIndex,
      ),
    [props.id],
  );
  useSync(handle, props);

  // 첫 등록 뒤 features 가 바뀌면 레이어를 새로 만들지 않고 갈아끼운다.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (handle && Array.isArray(props.features)) {
      manager.replaceFeatures(handle as LayerHandle<"vector">, props.features);
    }
  }, [handle, props.features, manager]);

  return null;
}

export function CustomLayer(props: CommonProps & { layer: OLBaseLayer }) {
  const manager = useManager();
  const handle = useLayer(
    () => manager.add(props.id, { kind: "custom", layer: props.layer }, props.zIndex),
    [props.id],
  );
  useSync(handle, props);
  return null;
}
