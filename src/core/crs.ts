import { register } from "ol/proj/proj4";
import proj4 from "proj4";

/** EPSG:5179 (KGD2002 / Unified CS). 한국 농지 데이터가 이 좌표계로 들어온다. */
export const EPSG_5179 =
  "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 " +
  "+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";

let registered = false;

/** proj4 에 정의를 넣고 OpenLayers 에 등록한다. 두 번째 호출부터는 아무것도 안 한다. */
export function registerKoreanCRS(): void {
  if (registered) {
    return;
  }
  proj4.defs("EPSG:5179", EPSG_5179);
  register(proj4);
  registered = true;
}
