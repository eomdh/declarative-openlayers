import OLMap from "ol/Map";
import { LayerManager } from "./LayerManager";

// 타입 단계 검사다. 실행하지 않고 tsc 로만 본다.
// 벡터 전용 동작이 다른 종류에 컴파일 에러를 내는지가 이 repo 의 헤드라인이다.

const manager = new LayerManager(new OLMap({ layers: [] }));

const vec = manager.add("v", { kind: "vector" });
const tile = manager.add("t", { kind: "tile", source: undefined as never });

// 벡터 손잡이는 통과한다.
manager.replaceFeatures(vec, []);

// 타일 손잡이는 막힌다. 원본은 이걸 런타임 throw 로 처리했다.
// @ts-expect-error 벡터가 아닌 손잡이는 replaceFeatures 에 못 넘긴다
manager.replaceFeatures(tile, []);
