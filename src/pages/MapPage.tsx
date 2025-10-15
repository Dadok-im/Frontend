import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../components/Map/MapView';
import { searchClinics } from '../services/api';
import { ROUTES } from '../constants';
import type { Clinic, MapBounds } from '../types';
import './MapPage.css';

const DEFAULT = { lat: 37.5665, lng: 126.9780 };

export default function MapPage() {
  const [center, setCenter] = useState(DEFAULT);        // 검색 기준점
  const [mapCenter, setMapCenter] = useState(DEFAULT);  // 화면 지도 중심(현 지도 재검색 기준)
  const [, setBounds] = useState<MapBounds | null>(null);
  const [fitNext] = useState(true);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [q, setQ] = useState('정신건강의학과');
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [hasInitialSearch, setHasInitialSearch] = useState(false);

  // 최초 진입 시 현재 위치 버튼을 유도하되, 권한 허용 시 자동 적용
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("이 브라우저는 위치 서비스를 지원하지 않습니다.");
      return;
    }
    
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cur = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(cur);
        setMapCenter(cur);
        setLocationError(null);
        setIsGettingLocation(false);
        console.log("현재 위치:", cur);
      },
      (error) => {
        console.error("위치 조회 실패:", error);
        setLocationError("위치를 가져올 수 없습니다. 수동으로 위치를 설정해주세요.");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, []);

  // 공용 검색 함수
  const fetchClinicsNow = useCallback(async (opt: {lat:number; lng:number; radius?:number|null; keyword:string}) => {
    const { lat, lng, keyword, radius: rad } = opt;

    setLoading(true);
    try {
      const data = await searchClinics({ lat, lng, q: keyword, page: 1, size: 15, radius: rad as any });
      setClinics(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setClinics([]);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 검색 실행 (한 번만)
  useEffect(() => {
    if (!hasInitialSearch) {
      fetchClinicsNow({ lat: center.lat, lng: center.lng, keyword: q });
      setHasInitialSearch(true);
    }
  }, [hasInitialSearch, center.lat, center.lng, q]);

  // 검색어 변경 시에만 재검색
  useEffect(() => {
    if (hasInitialSearch) {
      fetchClinicsNow({ lat: center.lat, lng: center.lng, keyword: q });
    }
  }, [q, hasInitialSearch, center.lat, center.lng]);

  // 위치 사용 함수
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("이 브라우저는 위치 서비스를 지원하지 않습니다.");
      return;
    }
    
    setIsGettingLocation(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cur = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(cur);
        setMapCenter(cur);
        setLocationError(null);
        setIsGettingLocation(false);
        console.log("현재 위치 업데이트:", cur);
      },
      (error) => {
        console.error("위치 조회 실패:", error);
        let errorMessage = "위치를 가져올 수 없습니다.";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "위치 정보를 사용할 수 없습니다.";
            break;
          case error.TIMEOUT:
            errorMessage = "위치 조회 시간이 초과되었습니다.";
            break;
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // 검색 시작 (현재 기준점)
  const startSearch = () => {
    fetchClinicsNow({ lat: center.lat, lng: center.lng, keyword: q });
  };

  // 하단 지도: 현 지도에서 재검색
  const searchHere = () => {
    fetchClinicsNow({ lat: mapCenter.lat, lng: mapCenter.lng, keyword: q });
    // setCenter를 호출하지 않음 - 무한 루프 방지
  };



  const list = useMemo(
    () => [...clinics].sort(
      (a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY)
    ),
    [clinics]
  );

  return (
    <div className="map-page">
      <nav className="map-nav">
        <Link to={ROUTES.HOME} className="nav-link">← 홈으로</Link>
        <h1>주변 병원 검색</h1>
      </nav>

      <div className="map-container">
        <div className="map-sidebar">
          <div className="search-controls">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') startSearch(); }}
              placeholder="검색어 (정신건강의학과 등)"
            />
            <button onClick={startSearch} disabled={loading}>
              {loading ? '검색중…' : '검색'}
            </button>
          </div>

          <div className="location-controls">
            <button 
              onClick={useMyLocation} 
              className="location-btn"
              disabled={isGettingLocation}
            >
              {isGettingLocation ? "📍 위치 조회 중..." : "📍 위치 사용"}
            </button>
            {locationError && (
              <div className="location-error">
                {locationError}
              </div>
            )}
          </div>

          <div className="disclaimer">
            ※ 본 서비스는 의료행위가 아니며, 응급 시 112/119 또는 1393(자살예방)을 이용하세요.
          </div>

          <div className="results-count">결과 {list.length}건</div>

          <div className="results-list">
            {list.map(c => (
              <div
                key={c.id}
                onClick={() => { setSelectedId(c.id); setCenter({ lat:c.lat, lng:c.lng }); }}
                className={`result-item ${selectedId === c.id ? 'selected' : ''}`}
              >
                <div className="clinic-name">{c.name}</div>
                <div className="clinic-address">{c.roadAddress || c.address}</div>
                <div className="clinic-phone">{c.phone || ''}</div>
                <div className="clinic-distance">
                  {typeof c.distance === 'number' ? `${c.distance} m` : ''}
                </div>
                <div className="clinic-actions">
                  <a href={c.placeUrl} target="_blank" rel="noopener noreferrer">상세보기</a>
                  {c.phone && <a href={`tel:${c.phone}`}>전화걸기</a>}
                </div>
              </div>
            ))}
            {list.length === 0 && !loading && <div>주변 검색 결과가 없습니다.</div>}
          </div>
        </div>

        <div className="map-area">
          <MapView
            center={center}
            clinics={clinics}
            onMarkerClick={c => setSelectedId(c.id)}
            onIdleCenterChange={setMapCenter}
            onIdleBoundsChange={setBounds}
            fitToMarkers={fitNext}
          />
          {/* 상단 가운데 플로팅 버튼 */}
          <div className="map-controls-center">
            <button
              type="button"
              onClick={searchHere}
              disabled={loading}
              className="search-here-btn"
            >
              {loading ? "검색중…" : "현 지도에서 재검색"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
