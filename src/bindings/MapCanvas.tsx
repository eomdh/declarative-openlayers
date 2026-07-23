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
 * 지도와 매니저는 ref 로 딱 한 번만 만든다. effect 는 DOM 에 붙였다 떼는 일만
 * 한다. 매니저 identity 가 안 바뀌므로, StrictMode 가 effect 를 두 번 돌리거나
 * center·zoom 이 바뀌어도 자식 레이어가 죽은 매니저에 등록되지 않는다.
 */
export function MapCanvas({ center, zoom, children, className }: MapCanvasProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<OLMap | null>(null);
  const [manager, setManager] = useState<LayerManager | null>(null);

  // 지도는 target 이 붙은 채로 딱 한 번 만든다. target 없이 만들면 타일 로드
  // 완료가 재렌더를 못 깨워 배경 지도가 안 그려진다. ref 로 재생성을 막아
  // 매니저 identity 를 고정하고, StrictMode 재실행은 target 만 다시 붙인다.
  // center·zoom 은 만들 때만 읽는다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: 지도는 한 번만 만든다
  useEffect(() => {
    if (!targetRef.current) {
      return;
    }
    if (!mapRef.current) {
      registerKoreanCRS();
      mapRef.current = new OLMap({
        target: targetRef.current,
        layers: [],
        view: new View({ center: fromLonLat(center), zoom }),
      });
      setManager(new LayerManager(mapRef.current));
    } else {
      mapRef.current.setTarget(targetRef.current);
    }

    const map = mapRef.current;
    return () => map.setTarget(undefined);
  }, []);

  return (
    <div ref={targetRef} className={className}>
      {manager && <ManagerProvider value={manager}>{children}</ManagerProvider>}
    </div>
  );
}
