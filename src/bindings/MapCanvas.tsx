import OLMap from "ol/Map";
import { fromLonLat } from "ol/proj";
import View from "ol/View";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { registerKoreanCRS } from "../core/crs";
import { LayerManager } from "../core/LayerManager";
import { ManagerProvider } from "./context";

export interface MapCanvasProps {
  /** WGS84 경위도. 안에서 지도 좌표계로 옮긴다. */
  center: [number, number];
  zoom: number;
  children?: ReactNode;
  className?: string;
}

/**
 * OL Map 을 만들고 정리한다. 자식 레이어 컴포넌트는 context 로 매니저를 받는다.
 *
 * 지도는 한 번만 만든다. center·zoom 이 바뀌어도 다시 만들지 않는다. 매번 새로
 * 만들면 자식 레이어가 통째로 사라졌다 붙어 깜빡인다.
 */
export function MapCanvas({ center, zoom, children, className }: MapCanvasProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [manager, setManager] = useState<LayerManager | null>(null);

  // center·zoom 은 초기값으로만 쓴다. 바뀌어도 지도를 다시 만들지 않는다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: 지도는 한 번만 만든다
  useEffect(() => {
    if (!targetRef.current) {
      return;
    }
    registerKoreanCRS();

    const map = new OLMap({
      target: targetRef.current,
      layers: [],
      view: new View({ center: fromLonLat(center), zoom }),
    });
    setManager(new LayerManager(map));

    return () => map.setTarget(undefined);
  }, []);

  return (
    <div ref={targetRef} className={className}>
      {manager && <ManagerProvider value={manager}>{children}</ManagerProvider>}
    </div>
  );
}
