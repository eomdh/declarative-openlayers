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
 * 레이어 목록. 이 목록이 곧 렌더 트리다. 여기서 상태를 바꾸면 App 이 다시 렌더하고,
 * 선언형 레이어 컴포넌트가 매니저에 반영한다. 목록은 명령형 OL 을 직접 안 만진다.
 *
 * 위가 화면에서도 위(zIndex 큰 쪽)라, 목록 순서와 지도 순서가 일치한다.
 */
export function LayerPanel({ layers, onChange }: Props) {
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
    <aside className="panel">
      <h2>레이어</h2>
      <ul>
        {ordered.map((layer, index) => (
          <li key={layer.id} data-off={!layer.visible}>
            <span className="swatch" style={{ background: layer.color }} />
            <span className="label">{layer.label}</span>
            <span className="z">z{layer.zIndex}</span>
            <button
              type="button"
              onClick={() => move(layer.id, -1)}
              disabled={index === 0}
              aria-label="위로"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              onClick={() => move(layer.id, 1)}
              disabled={index === ordered.length - 1}
              aria-label="아래로"
            >
              <ChevronDown size={16} />
            </button>
            <button
              type="button"
              onClick={() => toggle(layer.id)}
              aria-label={layer.visible ? "숨기기" : "보이기"}
            >
              {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </li>
        ))}
      </ul>
      <p className="note">
        토글하면 그 레이어만 사라진다. 위아래로 옮기면 zIndex 가 바뀌어 겹침 순서가 실시간으로
        바뀐다. 배경 지도는 항상 맨 아래다.
      </p>
    </aside>
  );
}
