import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { getNationalSmokingBooths } from "../services/smokingBoothService";
import { findPath, calculatePathDistance } from "../utils/pathfinding";
import { getEnvironmentData } from "../services/weatherService";
import type { SmokingBooth } from "../services/smokingBoothService";
import type { Point } from "../utils/pathfinding";
import type { WeatherData } from "../services/weatherService";

declare global {
  interface Window {
    kakao: any;
  }
}

/**
 * Merge 스크롤 애니메이션 헬퍼 컴포넌트
 */
function MergeAnimation({
  children,
  direction = "left",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "left" | "right";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const initialX = direction === "left" ? -100 : 100;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: initialX }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: initialX }}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ServicePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const [startKeyword, setStartKeyword] = useState("");
  const [destKeyword, setDestKeyword] = useState("");

  const [nationalBooths] = useState<SmokingBooth[]>(getNationalSmokingBooths());
  const markersRef = useRef<any[]>([]);
  const pathOverlayRef = useRef<any>(null);

  const [environmentData, setEnvironmentData] = useState<WeatherData | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [userLocation, setUserLocation] = useState<Point | null>(null);

  /**
   * 실시간 시간 업데이트
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * 환경 데이터 로드
   */
  useEffect(() => {
    const loadEnvironmentData = async () => {
      try {
        const data = await getEnvironmentData();
        setEnvironmentData(data);
      } catch (error) {
        console.error("환경 데이터 로드 실패:", error);
      }
    };

    loadEnvironmentData();
    const interval = setInterval(loadEnvironmentData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * 지도 초기화
   */
  const initializeMap = useCallback((lat: number, lng: number) => {
    if (!mapContainerRef.current) return;

    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 11,
    };

    const map = new window.kakao.maps.Map(mapContainerRef.current, options);
    mapRef.current = map;

    renderSmokingBooths(map);
  }, []);

  /**
   * 흡연부스 마커 렌더링
   */
  const renderSmokingBooths = (map: any) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    nationalBooths.forEach((booth) => {
      const content = document.createElement("div");
      content.innerHTML = `
        <div class="w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm opacity-60"></div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(booth.latitude, booth.longitude),
        content: content,
        yAnchor: 0.5,
      });

      overlay.setMap(map);
      markersRef.current.push(overlay);
    });
  };

  useEffect(() => {
    const startApp = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserLocation({ lat, lng });
            initializeMap(lat, lng);
          },
          () => initializeMap(37.5665, 126.978)
        );
      } else {
        initializeMap(37.5665, 126.978);
      }
    };

    const scriptId = "kakao-map-sdk";
    const appKey = "7eb77dd1772e545a47f6066b2e87d8f";

    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      startApp();
    } else {
      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
        script.async = true;
        script.onload = () => {
          window.kakao.maps.load(startApp);
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", () => {
          window.kakao.maps.load(startApp);
        });
      }
    }
  }, [nationalBooths, initializeMap]);

  /**
   * 장소 검색 및 경로 탐색
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destKeyword.trim() || !mapRef.current) {
      alert("목적지를 입력해주세요.");
      return;
    }

    const ps = new window.kakao.maps.services.Places();

    const processRoute = (start: Point) => {
      ps.keywordSearch(destKeyword, (destData: any, destStatus: any) => {
        if (destStatus === window.kakao.maps.services.Status.OK) {
          const dest: Point = {
            lat: parseFloat(destData[0].y),
            lng: parseFloat(destData[0].x),
          };

          const obstacles: Point[] = nationalBooths.map((booth) => ({
            lat: booth.latitude,
            lng: booth.longitude,
          }));

          const path = findPath(start, dest, obstacles);
          const distance = calculatePathDistance(path);
          setRouteDistance(distance);

          drawPath(path);

          const bounds = new window.kakao.maps.LatLngBounds();
          path.forEach(p => bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng)));
          mapRef.current.setBounds(bounds);
        } else {
          alert("목적지를 찾을 수 없습니다.");
        }
      });
    };

    if (startKeyword.trim()) {
      ps.keywordSearch(startKeyword, (startData: any, startStatus: any) => {
        if (startStatus === window.kakao.maps.services.Status.OK) {
          processRoute({
            lat: parseFloat(startData[0].y),
            lng: parseFloat(startData[0].x),
          });
        } else {
          alert("출발지를 찾을 수 없습니다.");
        }
      });
    } else if (userLocation) {
      processRoute(userLocation);
    } else {
      alert("출발지 또는 현재 위치가 필요합니다.");
    }
  };

  /**
   * 지도에 경로 그리기
   */
  const drawPath = (path: Point[]) => {
    if (pathOverlayRef.current) {
      pathOverlayRef.current.setMap(null);
    }

    const linePath = path.map(
      (p) => new window.kakao.maps.LatLng(p.lat, p.lng)
    );

    const polyline = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: "#22c55e",
      strokeOpacity: 0.8,
      strokeStyle: "solid",
    });

    polyline.setMap(mapRef.current);
    pathOverlayRef.current = polyline;
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setLevel(mapRef.current.getLevel() - 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setLevel(mapRef.current.getLevel() + 1);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ========== 섹션 1: 헤더 및 검색 ========== */}
      <section className="w-full px-4 pt-10 pb-6 md:px-8 lg:px-16">
        <MergeAnimation direction="left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  AI Navigation
                </span>
                {environmentData && (
                  <span className="text-xs text-gray-400">
                    서울 | 미세먼지: {environmentData.airQuality.value}
                  </span>
                )}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                흡연부스 회피 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                  최적 경로 탐색
                </span>
              </h2>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-gray-400 mb-1">CURRENT TIME</p>
              <p className="text-2xl font-black text-gray-800">
                {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100 mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 relative">
                <input
                  type="text"
                  placeholder="출발지 (미입력 시 현재 위치)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={startKeyword}
                  onChange={(e) => setStartKeyword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setStartKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  현재 위치
                </button>
              </div>
              <input
                type="text"
                placeholder="목적지 (전국 어디든 검색 가능)"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                value={destKeyword}
                onChange={(e) => setDestKeyword(e.target.value)}
              />
              <button
                type="submit"
                className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all text-sm sm:text-base"
              >
                흡연부스 회피 경로 탐색
              </button>
            </div>
          </form>
        </MergeAnimation>

        {/* 경로 정보 */}
        {routeDistance && (
          <MergeAnimation direction="right" delay={0.3}>
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500">예상 거리</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {(routeDistance / 1000).toFixed(2)} km
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-sm text-gray-500">흡연부스 회피 경로</p>
                  <p className="text-lg sm:text-xl font-semibold text-gray-700">
                    최적 경로 적용됨
                  </p>
                </div>
              </div>
            </div>
          </MergeAnimation>
        )}
      </section>

      {/* ========== 섹션 2: 지도 영역 ========== */}
      <section className="flex-1 w-full px-4 pb-6 md:px-8 lg:px-16 min-h-[400px] md:min-h-[500px]">
        <MergeAnimation direction="left" delay={0.4} className="h-full">
          <div className="relative shadow-2xl border border-gray-200 rounded-2xl overflow-hidden h-full">
            <div ref={mapContainerRef} className="w-full h-full min-h-[400px] md:min-h-[500px]" />

            {/* Custom Zoom Controls (Bottom Left) */}
            <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="확대"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              </button>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="축소"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM7.5 10.5h6" />
                </svg>
              </button>
            </div>

            {/* 흡연부스 통계 오버레이 */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
              <p className="text-xs text-gray-500">전국 흡연부스</p>
              <p className="text-xl font-bold text-red-500">{nationalBooths.length}개</p>
              <p className="text-xs text-gray-400">실시간 회피 중</p>
            </div>
          </div>
        </MergeAnimation>
      </section>

      {/* ========== 섹션 3: 안내 및 정보 영역 ========== */}
      <section className="w-full px-4 py-8 md:px-8 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MergeAnimation direction="left" delay={0.5}>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">A* 알고리즘</h3>
                <p className="text-sm text-gray-600">
                  최적의 경로를 찾는 인공지능 알고리즘으로 흡연부스를 능동적으로 회피합니다.
                </p>
              </div>
            </MergeAnimation>

            <MergeAnimation direction="right" delay={0.6}>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">전국 단위 지도</h3>
                <p className="text-sm text-gray-600">
                  서울부터 제주까지 전국 어디든 흡연부스 회피 경로를 제공합니다.
                </p>
              </div>
            </MergeAnimation>

            <MergeAnimation direction="left" delay={0.7}>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">실시간 업데이트</h3>
                <p className="text-sm text-gray-600">
                  1시간마다 환경 정보가 갱신되어 항상 최신 정보를 제공합니다.
                </p>
              </div>
            </MergeAnimation>
          </div>

          <MergeAnimation direction="right" delay={0.8}>
            <div className="mt-8 text-center">
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                A* 알고리즘을 사용하여 전국 흡연부스를 회피하는 최적의 경로를
                제공합니다. 초록색 라인을 따라 쾌적한 경로로 이동하세요.
              </p>
            </div>
          </MergeAnimation>
        </div>
      </section>
    </div>
  );
}
