import { createContext, useContext } from "react";
import type { LayerManager } from "../core/LayerManager";

/** MapCanvas 가 만든 매니저를 하위 레이어 컴포넌트에 내려준다. */
const ManagerContext = createContext<LayerManager | null>(null);

export const ManagerProvider = ManagerContext.Provider;

/** 레이어 컴포넌트가 매니저를 집는다. MapCanvas 밖에서 쓰면 막는다. */
export function useManager(): LayerManager {
  const manager = useContext(ManagerContext);
  if (!manager) {
    throw new Error("레이어 컴포넌트는 <MapCanvas> 안에서만 쓸 수 있다");
  }
  return manager;
}
