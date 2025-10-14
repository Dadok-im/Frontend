import { useEffect, useRef } from 'react';
import type { Clinic, MapBounds, MapCenter } from '../../types';
import { loadKakaoScript } from '../../lib/kakao';

declare global { 
  interface Window { 
    kakao: any;
  } 
}

interface MapViewProps {
  center: MapCenter;
  clinics: Clinic[];
  onMarkerClick?: (clinic: Clinic) => void;
  onIdleCenterChange?: (c: MapCenter) => void;
  onIdleBoundsChange?: (b: MapBounds) => void;
  fitToMarkers?: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  center, 
  clinics, 
  onMarkerClick, 
  onIdleCenterChange, 
  onIdleBoundsChange, 
  fitToMarkers = true,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const kakaoMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoRef = useRef<any | null>(null);

  const idleCenterCbRef = useRef<((c: MapCenter) => void) | null>(null);
  const idleBoundsCbRef = useRef<((b: MapBounds) => void) | null>(null);

  // 최신 콜백을 ref에 보관
  useEffect(() => { idleCenterCbRef.current = onIdleCenterChange ?? null; }, [onIdleCenterChange]);
  useEffect(() => { idleBoundsCbRef.current = onIdleBoundsChange ?? null; }, [onIdleBoundsChange]);

  const infoHtml = (c: Clinic) => `
    <div style="padding:8px 10px;max-width:260px;box-sizing:border-box;border:1px solid #ddd;border-radius:10px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.12);">
      <div style="font-weight:700">${c.name}</div>
      <div style="font-size:12px">${c.roadAddress || c.address || ''}</div>
      <div style="font-size:12px">${c.phone ? '☎ ' + c.phone : ''}</div>
      <div style="margin-top:6px;display:flex;gap:10px;flex-wrap:wrap">
        <a href="${c.placeUrl}" target="_blank" rel="noreferrer" style="border:1px solid #e5e7eb;border-radius:8px;padding:6px 8px;">상세보기</a>
        ${c.phone ? `<a href="tel:${c.phone}" style="border:1px solid #e5e7eb;border-radius:8px;padding:6px 8px;">전화걸기</a>` : ''}
      </div>
    </div>`;

  // 1) 지도 생성 + 이벤트 등록
  useEffect(() => {
    let cancelled = false;
    let idleHandler: any, dragHandler: any, zoomHandler: any;

    loadKakaoScript(import.meta.env.VITE_KAKAO_JS_KEY as string)
      .then(() => {
        if (cancelled) return;
        const kakao = window.kakao;
        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: 4,
        });
        kakaoMapRef.current = map;

        // 현재 위치 마커
        const svg = encodeURIComponent(
          `<svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <circle cx="12" cy="12" r="7" fill="#ed2f38ff" opacity="0.12"/>
             <circle cx="12" cy="12" r="4" fill="#ed2f38ff"/>
           </svg>`
        );
        const img = new kakao.maps.MarkerImage(
          `data:image/svg+xml;utf8,${svg}`,
          new kakao.maps.Size(24, 24),
          { offset: new kakao.maps.Point(12, 12) }
        );
        userMarkerRef.current = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(center.lat, center.lng),
          image: img,
          zIndex: 3,
        });
        userMarkerRef.current.setMap(map);

        const fire = () => {
          const c = map.getCenter();
          idleCenterCbRef.current?.({ lat: c.getLat(), lng: c.getLng() });
          if (idleBoundsCbRef.current) {
            const b = map.getBounds();
            const sw = b.getSouthWest();
            const ne = b.getNorthEast();
            idleBoundsCbRef.current({
              sw: { lat: sw.getLat(), lng: sw.getLng() },
              ne: { lat: ne.getLat(), lng: ne.getLng() },
            });
          }
        };

        idleHandler = kakao.maps.event.addListener(map, 'idle', fire);
        dragHandler = kakao.maps.event.addListener(map, 'dragend', fire);
        zoomHandler = kakao.maps.event.addListener(map, 'zoom_changed', fire);

        fire();
      })
      .catch((err) => {
        console.error('Kakao SDK load failed:', err);
        if (mapRef.current) {
          mapRef.current.innerHTML = '<div style="padding:12px">지도를 불러오지 못했습니다. JS 키/도메인 설정을 확인하세요.</div>';
        }
      });

    return () => {
      cancelled = true;
      const kakao = (window as any).kakao;
      const map = kakaoMapRef.current;
      if (kakao && map) {
        if (idleHandler) kakao.maps.event.removeListener(map, 'idle', idleHandler);
        if (dragHandler) kakao.maps.event.removeListener(map, 'dragend', dragHandler);
        if (zoomHandler) kakao.maps.event.removeListener(map, 'zoom_changed', zoomHandler);
      }
    };
  }, []);

  // 2) 외부 center 변경 시 지도/내 위치 마커만 갱신
  useEffect(() => {
    const kakao = window.kakao;
    const map = kakaoMapRef.current;
    if (!kakao || !map) return;
    const pos = new kakao.maps.LatLng(center.lat, center.lng);
    map.setCenter(pos);
    userMarkerRef.current?.setPosition(pos);
  }, [center.lat, center.lng]);

  // 3) 클리닉 마커 렌더링
  useEffect(() => {
    const kakao = window.kakao;
    const map = kakaoMapRef.current;
    if (!kakao || !map) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (infoRef.current) { infoRef.current.close(); infoRef.current = null; }

    const bounds = new kakao.maps.LatLngBounds();

    clinics.forEach(c => {
      const pos = new kakao.maps.LatLng(c.lat, c.lng);
      const marker = new kakao.maps.Marker({ position: pos });
      marker.setMap(map);
      markersRef.current.push(marker);
      bounds.extend(pos);

      kakao.maps.event.addListener(marker, 'click', () => {
        if (infoRef.current) infoRef.current.close();
        const iw = new kakao.maps.InfoWindow({ content: infoHtml(c) });
        iw.open(map, marker);
        infoRef.current = iw;
        onMarkerClick?.(c);
      });
    });

    if (clinics.length > 0 && fitToMarkers) {
      map.setBounds(bounds);
    }
  }, [clinics, onMarkerClick, fitToMarkers]);

  return (
    <div ref={mapRef} style={{ width:'100%', height:'100%', borderRadius:16, border:'1px solid #ddd' }} />
  );
};

export default MapView;
