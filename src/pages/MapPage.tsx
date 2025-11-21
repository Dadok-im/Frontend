import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MapView from "../components/Map/MapView";
import { ROUTES } from "../constants";
import { searchClinics } from "../services/api";
import type { Clinic, MapBounds } from "../types";

const DEFAULT = { lat: 37.5665, lng: 126.978 };

const getIsDesktopView = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 768px)").matches;
};

export default function MapPage() {
  const [center, setCenter] = useState(DEFAULT);
  const [mapCenter, setMapCenter] = useState(DEFAULT);
  const [q, setQ] = useState("정신건강의학과");
  const keywordRef = useRef(q);
  const boundsRef = useRef<MapBounds | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(getIsDesktopView);
  const [isListOpen, setIsListOpen] = useState(() => getIsDesktopView());

  const fetchClinicsNow = useCallback(
    async (opt: { lat: number; lng: number; radius?: number | null; keyword: string }) => {
      const { lat, lng, keyword, radius: rad } = opt;
      setLoading(true);
      try {
        const data = await searchClinics({
          lat,
          lng,
          q: keyword,
          page: 1,
          size: 15,
          radius: rad as any,
        });
        setClinics(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setClinics([]);
        alert("검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    keywordRef.current = q;
  }, [q]);

  useEffect(() => {
    if (!navigator.geolocation) {
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
      },
      () => {
        runSearch(DEFAULT.lat, DEFAULT.lng);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
    return () => {
      cancelled = true;
    };
  }, [fetchClinicsNow]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    setIsDesktop(mediaQuery.matches);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    setIsListOpen(isDesktop);
  }, [isDesktop]);

  const startSearch = () => {
    fetchClinicsNow({ lat: center.lat, lng: center.lng, keyword: q });
  };

  const searchHere = () => {
    fetchClinicsNow({ lat: mapCenter.lat, lng: mapCenter.lng, keyword: q });
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
    () =>
      [...clinics].sort(
        (a, b) =>
          (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY),
      ),
    [clinics],
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-[#F5F7FA]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)",
        }}
      />

      <nav className="relative z-10 flex items-center justify-between gap-3 border-b border-white/20 bg-white/10 px-4 py-3 shadow-lg backdrop-blur">
        <Link
          to={ROUTES.HOME}
          className="hidden rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium text-white shadow-md transition duration-200 hover:-translate-y-1 hover:bg-white/20 sm:inline-flex"
        >
          ← 홈으로
        </Link>
        <h1 className="mx-auto text-lg font-semibold tracking-tight text-white sm:text-xl md:text-2xl">
          주변 병원 검색
        </h1>
        <span className="w-16" aria-hidden />
      </nav>

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden md:flex-row">
        {(isListOpen || isDesktop) && (
          <aside
            id="clinic-list-panel"
            className="order-2 flex h-full w-full flex-col border-t border-slate-500/40 bg-slate-800/90 p-5 text-white backdrop-blur sm:p-6 md:order-1 md:w-[360px] md:border-t-0 md:border-r"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <input
                className="w-full rounded-2xl border border-slate-500 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-white/70 shadow-inner transition duration-200 focus:border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-200/60 sm:flex-1"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") startSearch();
                }}
                placeholder="검색어 (병원명, 진료과 등)"
              />
              <button
                className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/70 disabled:shadow-none sm:text-base"
                onClick={startSearch}
                disabled={loading}
              >
                {loading ? "검색 중..." : "검색"}
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-white/20 bg-white/5 px-3 py-3 text-xs text-white/80 shadow-inner sm:px-4 sm:text-sm">
              ※ 본 서비스는 의료행위가 아니며, 응급 시 112/119 또는 1393(자살예방)을 이용하세요.
            </div>

            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/70 sm:text-sm">
              결과 {list.length}건
            </div>

            <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1 sm:pr-2 text-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {list.map((c) => {
                const isSelected = selectedId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedId(c.id);
                      setCenter({ lat: c.lat, lng: c.lng });
                    }}
                    className={`group cursor-pointer rounded-2xl border border-white/15 bg-white/5 p-4 shadow-lg transition duration-200 hover:-translate-y-1 hover:bg-white/10 sm:p-5 ${
                      isSelected ? "border-amber-200/60 bg-white/15 shadow-2xl" : ""
                    }`}
                  >
                    <div className="text-base font-semibold text-white sm:text-lg">{c.name}</div>
                    <div className="mt-1 text-xs text-white/75 sm:text-sm">
                      {c.roadAddress || c.address}
                    </div>
                    {c.phone && <div className="mt-1 text-xs text-white/65 sm:text-sm">{c.phone}</div>}
                    <div className="mt-2 text-[11px] font-medium uppercase tracking-wide text-white/60">
                      {typeof c.distance === "number" ? `${c.distance} m` : ""}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs sm:gap-3 sm:text-sm">
                      <a
                        className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-white transition duration-200 hover:bg-white/20"
                        href={c.placeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        상세보기
                      </a>
                      {c.phone && (
                        <a
                          className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-white transition duration-200 hover:bg-white/20"
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
                <div className="rounded-2xl border border-white/15 bg-white/8 p-5 text-center text-xs text-white/80 backdrop-blur sm:p-6 sm:text-sm">
                  주변 검색 결과가 없습니다.
                </div>
              )}
            </div>
          </aside>
        )}

        <section className="order-1 relative flex min-h-0 flex-1 flex-col overflow-hidden border-t border-white/15 bg-white text-gray-900 md:order-2 md:border-l md:border-t-0">
          <div className="relative min-h-0 flex-1">
            <MapView
              center={center}
              clinics={clinics}
              onMarkerClick={(c) => setSelectedId(c.id)}
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
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-medium text-slate-800 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none sm:text-xs"
            >
              {loading ? "검색 중..." : "이 지역 재검색"}
            </button>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4 md:hidden">
            <button
              type="button"
              onClick={() => setIsListOpen((prev) => !prev)}
              aria-controls="clinic-list-panel"
              aria-expanded={isListOpen}
              className="pointer-events-auto flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isListOpen ? "지도만 보기" : "목록 보기"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
