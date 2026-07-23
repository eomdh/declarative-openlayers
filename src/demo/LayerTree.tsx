import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

export interface LayerState {
  id: string;
  label: string;
  color: string;
  visible: boolean;
  zIndex: number;
}

interface Props {
  layers: LayerState[];
  onChange: (next: LayerState[]) => void;
}

/**
 * 지금 마운트된 레이어를 JSX 트리 모양으로 그린다. 이 트리가 곧 지도 상태다.
 * 여기서 상태를 바꾸면 App 이 다시 렌더하고, 선언형 레이어 컴포넌트가 매니저에
 * 반영한다. 목록은 명령형 OL 을 직접 안 만진다.
 *
 * 위가 화면에서도 위(zIndex 큰 쪽)라, 트리 순서와 겹침 순서가 일치한다.
 */
export function LayerTree({ layers, onChange }: Props) {
  const ordered = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  const toggle = (id: string) => {
    onChange(layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  };

  // 화면 위아래로 옮긴다. 인접한 둘의 zIndex 를 맞바꾼다.
  const move = (id: string, dir: -1 | 1) => {
    const index = ordered.findIndex((l) => l.id === id);
    const neighbor = ordered[index + dir];
    const self = ordered[index];
    if (!neighbor || !self) {
      return;
    }
    onChange(
      layers.map((l) => {
        if (l.id === self.id) {
          return { ...l, zIndex: neighbor.zIndex };
        }
        if (l.id === neighbor.id) {
          return { ...l, zIndex: self.zIndex };
        }
        return l;
      }),
    );
  };

  return (
    <aside className="tree">
      <div className="tree-head">render tree</div>

      <div className="node root">
        &lt;MapCanvas center=<em>[126.9, 35.8]</em>&gt;
      </div>

      {/* 배경 타일은 항상 맨 아래에 고정이라 조작 대상이 아니다. */}
      <div className="node fixed">
        <span className="tok">
          &lt;TileLayer id=<em>"osm"</em> /&gt;
        </span>
        <span className="z">z0</span>
      </div>

      {ordered.map((layer, index) => (
        <div className="node leaf" data-off={!layer.visible} key={layer.id}>
          <span className="swatch" style={{ background: layer.color }} />
          <span className="tok">
            &lt;VectorLayer id=<em>"{layer.id}"</em> /&gt;
          </span>
          <span className="z">z{layer.zIndex}</span>
          <span className="ops">
            <button
              type="button"
              onClick={() => move(layer.id, -1)}
              disabled={index === 0}
              aria-label="위로"
            >
              <ChevronUp size={15} />
            </button>
            <button
              type="button"
              onClick={() => move(layer.id, 1)}
              disabled={index === ordered.length - 1}
              aria-label="아래로"
            >
              <ChevronDown size={15} />
            </button>
            <button
              type="button"
              onClick={() => toggle(layer.id)}
              aria-label={layer.visible ? "숨기기" : "보이기"}
            >
              {layer.visible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </span>
        </div>
      ))}

      <div className="node close">&lt;/MapCanvas&gt;</div>

      <p className="note">
        토글하면 그 노드만 지도에서 사라진다. 위아래로 옮기면 zIndex 가 바뀌어 겹침 순서가
        실시간으로 바뀐다. 이 트리에 있는 것만 지도에 있다.
      </p>
    </aside>
  );
}
