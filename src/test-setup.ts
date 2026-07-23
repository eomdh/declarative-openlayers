// OL Map 은 생성 시 ResizeObserver 를 쓴다. jsdom 에는 없어서 최소 스텁을 넣는다.
// 헤드리스 테스트는 실제 크기 변화를 안 보므로 아무것도 안 하면 된다.
if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
