import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../components/Map/MapView';
import { searchClinics } from '../services/api';
import { ROUTES } from '../constants';
import type { Clinic, MapBounds } from '../types';

const DEFAULT = { lat: 37.5665, lng: 126.9780 };

export default function MapPage() {
  const [center, setCenter] = useState(DEFAULT);        // 검색 기준점
  const [mapCenter, setMapCenter] = useState(DEFAULT);  // 화면 지도 중심(현 지도 재검색 기준)
  const [q, setQ] = useState('정신건강의학과');
  const keywordRef = useRef(q);
  const boundsRef = useRef<MapBounds | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isListOpen, setIsListOpen] = useState(true);

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

  // 검색어 입력값 추적
  useEffect(() => {
    keywordRef.current = q;
  }, [q]);

  // 최초 진입 시 현재 위치 자동 적용
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("이 브라우저는 위치 서비스를 지원하지 않습니다.");
      fetchClinicsNow({ lat: DEFAULT.lat, lng: DEFAULT.lng, keyword: keywordRef.current });
      return;
    }
    
    let cancelled = false;

    const runSearch = (lat: number, lng: number) => {
      if (cancelled) return;
      fetchClinicsNow({ lat, lng, keyword: keywordRef.current });
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cur = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(cur);
        setMapCenter(cur);
        runSearch(cur.lat, cur.lng);
        console.log("현재 위치:", cur);
      },
      (error) => {
        console.error("위치 조회 실패:", error);
        console.warn("기본 위치(서울)로 검색을 진행합니다.");
        runSearch(DEFAULT.lat, DEFAULT.lng);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
    
    return () => {
      cancelled = true;
    };
  }, [fetchClinicsNow]);


  // 검색 시작 (현재 기준점)
  const startSearch = () => {
    fetchClinicsNow({ lat: center.lat, lng: center.lng, keyword: q });
  };

  // 하단 지도: 현 지도에서 재검색
  const searchHere = () => {
    fetchClinicsNow({ lat: mapCenter.lat, lng: mapCenter.lng, keyword: q });
    // setCenter를 호출하지 않음 - 무한 루프 방지
  };

  const handleIdleCenterChange = useCallback((nextCenter: typeof DEFAULT) => {
    setMapCenter((prev) => {
      if (
        Math.abs(prev.lat - nextCenter.lat) < 0.0001 &&
        Math.abs(prev.lng - nextCenter.lng) < 0.0001
      ) {
        return prev;
      }
      return nextCenter;
    });
  }, []);

  const handleIdleBoundsChange = useCallback((nextBounds: MapBounds) => {
    const prev = boundsRef.current;
    if (
      prev &&
      Math.abs(prev.sw.lat - nextBounds.sw.lat) < 0.0001 &&
      Math.abs(prev.sw.lng - nextBounds.sw.lng) < 0.0001 &&
      Math.abs(prev.ne.lat - nextBounds.ne.lat) < 0.0001 &&
      Math.abs(prev.ne.lng - nextBounds.ne.lng) < 0.0001
    ) {
      return;
    }
    boundsRef.current = nextBounds;
  }, []);



  const list = useMemo(
    () => [...clinics].sort(
      (a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY)
    ),
    [clinics]
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#4A5D73] via-[#5C6373] to-[#A3B8C6] text-[#F5F7FA]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(163,184,198,0.3) 0%, transparent 55%), radial-gradient(circle at 70% 20%, rgba(248,180,0,0.22) 0%, transparent 60%), radial-gradient(circle at 45% 40%, rgba(74,93,115,0.25) 0%, transparent 55%)",
        }}
      />

      <nav className="relative z-10 flex items-center justify-center border-b border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.08)] px-4 py-5 backdrop-blur-2xl shadow-lg sm:px-6">
        <Link
          to={ROUTES.HOME}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-4 py-2 text-xs font-medium text-[#F5F7FA] shadow-md transition duration-200 hover:-translate-y-1 hover:bg-[rgba(245,247,250,0.22)] sm:left-6 sm:px-5 sm:text-sm"
        >
          ← 홈으로
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-transparent drop-shadow-xl bg-gradient-to-r from-[#F5F7FA] to-[#A3B8C6] bg-clip-text sm:text-2xl md:text-3xl">
          주변 병원 검색
        </h1>
        <button
          type="button"
          onClick={() => setIsListOpen((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-4 py-2 text-xs font-medium text-[#F5F7FA] shadow-md transition duration-200 hover:-translate-y-1 hover:bg-[rgba(245,247,250,0.22)] sm:right-6 sm:text-sm"
          aria-expanded={isListOpen}
          aria-controls="clinic-list-panel"
        >
          {isListOpen ? '리스트 닫기' : '리스트 열기'}
        </button>
      </nav>

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden md:flex-row min-h-0">
        {isListOpen && (
          <aside
            id="clinic-list-panel"
            className="flex h-full w-full flex-col border-b border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.08)] p-5 backdrop-blur-2xl shadow-2xl sm:p-6 md:w-[360px] md:border-b-0 md:border-r md:p-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <input
                className="w-full rounded-2xl border border-[rgba(163,184,198,0.4)] bg-transparent px-4 py-3 text-sm text-[#F5F7FA] placeholder:text-[#F5F7FA]/70 shadow-inner transition duration-200 focus:border-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#A3B8C6]/40 sm:flex-1"
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') startSearch(); }}
              placeholder="검색어 (정신건강의학과 등)"
            />
            <button
              className="rounded-2xl bg-gradient-to-r from-[#F8B400] to-[#A3B8C6] px-4 py-3 text-sm font-semibold text-[#4A5D73] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/70 disabled:shadow-none sm:text-base"
              onClick={startSearch}
              disabled={loading}
            >
              {loading ? '검색중…' : '검색'}
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.08)] px-3 py-4 text-xs text-[#F5F7FA]/80 shadow-inner sm:px-4 sm:text-sm">
            ※ 본 서비스는 의료행위가 아니며, 응급 시 112/119 또는 1393(자살예방)을 이용하세요.
          </div>

          <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#F5F7FA]/70 sm:text-sm">
            결과 {list.length}건
          </div>

          <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1 sm:pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {list.map(c => {
              const isSelected = selectedId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => { setSelectedId(c.id); setCenter({ lat:c.lat, lng:c.lng }); }}
                  className={`group cursor-pointer rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.08)] p-4 shadow-lg transition duration-200 hover:-translate-y-1 hover:bg-[rgba(245,247,250,0.18)] sm:p-5 ${isSelected ? 'border-[#F5F7FA]/60 bg-[rgba(245,247,250,0.25)] shadow-2xl' : ''}`}
                >
                  <div className="text-base font-semibold text-[#F5F7FA] sm:text-lg">
                    {c.name}
                  </div>
                  <div className="mt-1 text-xs text-[#F5F7FA]/75 sm:text-sm">
                    {c.roadAddress || c.address}
                  </div>
                  {c.phone && (
                    <div className="mt-1 text-xs text-[#F5F7FA]/65 sm:text-sm">
                      {c.phone}
                    </div>
                  )}
                  <div className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[#F5F7FA]/60">
                    {typeof c.distance === 'number' ? `${c.distance} m` : ''}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs sm:gap-3 sm:text-sm">
                    <a
                      className="rounded-full border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-3 py-1.5 text-[#F5F7FA] transition duration-200 hover:bg-[rgba(245,247,250,0.25)]"
                      href={c.placeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      상세보기
                    </a>
                    {c.phone && (
                      <a
                        className="rounded-full border border-[rgba(163,184,198,0.45)] bg-[rgba(245,247,250,0.12)] px-3 py-1.5 text-[#F5F7FA] transition duration-200 hover:bg-[rgba(245,247,250,0.25)]"
                        href={`tel:${c.phone}`}
                      >
                        전화걸기
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {list.length === 0 && !loading && (
              <div className="rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.08)] p-5 text-center text-xs text-[#F5F7FA]/80 backdrop-blur sm:p-6 sm:text-sm">
                주변 검색 결과가 없습니다.
              </div>
            )}
          </div>
        </aside>
        )}

        <section className="relative flex flex-1 min-h-0 flex-col overflow-hidden border-t border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.95)] text-gray-900 md:border-l md:border-t-0">
          <div className="relative flex-1 min-h-0">
            <MapView
              center={center}
              clinics={clinics}
              onMarkerClick={c => setSelectedId(c.id)}
              onIdleCenterChange={handleIdleCenterChange}
              onIdleBoundsChange={handleIdleBoundsChange}
              fitToMarkers={false}
              relayoutTrigger={isListOpen}
            />
          </div>

          <div className="pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2 sm:top-6">
            <button
              type="button"
              onClick={searchHere}
              disabled={loading}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-[11px] font-medium text-gray-700 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none sm:text-xs"
            >
              {loading ? "검색중…" : "현 지도에서 재검색"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
