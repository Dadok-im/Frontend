import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MapView from '../components/Map/MapView';
import { searchClinics } from '../services/api';
import { haversine } from '../utils';
import { ROUTES } from '../constants';
import type { Clinic, MapBounds } from '../types';
import './MapPage.css';

const DEFAULT = { lat: 37.5665, lng: 126.9780 };

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const [center, setCenter] = useState(DEFAULT);
  const [mapCenter, setMapCenter] = useState(DEFAULT);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const [fitNext, setFitNext] = useState(true);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [q, setQ] = useState('정신건강의학과');
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // 공용 검색 함수
  const fetchClinicsNow = useCallback(async (opt?: {lat:number; lng:number; radius?:number|null; keyword?:string}) => {
    const keyword = (opt?.keyword ?? q).trim();
    const lat = opt?.lat ?? center.lat;
    const lng = opt?.lng ?? center.lng;
    const rad = (typeof opt?.radius === 'number') ? opt?.radius : undefined;

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
  }, [center.lat, center.lng, q]);

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
              onKeyDown={e => { if (e.key === 'Enter') fetchClinicsNow(); }}
              placeholder="검색어 (정신건강의학과 등)"
            />
            <button onClick={() => fetchClinicsNow()} disabled={loading}>
              {loading ? '검색중…' : '검색'}
            </button>
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
        </div>
      </div>
    </div>
  );
}
