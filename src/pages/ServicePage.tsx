import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
 * Merge 스크롤 애니메이션 래퍼 컴포넌트
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
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const [startKeyword, setStartKeyword] = useState("");
  const [destKeyword, setDestKeyword] = useState("");

  const [_startPoint, setStartPoint] = useState<Point | null>(null);
  const [_destPoint, setDestPoint] = useState<Point | null>(null);

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
    // 1시간마다 환경 데이터 갱신 (수정: 5분 -> 1시간)
    const interval = setInterval(loadEnvironmentData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * 전국 흡연부스 마커 렌더링
   */
  const renderSmokingBooths = (map: any) => {
    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 커스텀 마커 이미지 (투명 원형 처리)
    const markerImage = new window.kakao.maps.MarkerImage(
      "/image/smoke_icon.png",
      new window.kakao.maps.Size(32, 32),
      {
        offset: new window.kakao.maps.Point(16, 16),
      }
    );

    // 전국 흡연부스 마커 생성
    nationalBooths.forEach((booth) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(booth.latitude, booth.longitude),
        image: markerImage,
        map: map,
        title: booth.name,
      });

      markersRef.current.push(marker);
    });
  };

  /**
   * 경로 그리기 (초록색 입체감)
   */
  const drawPath = (map: any, path: Point[]) => {
    // 기존 경로 제거
    if (pathOverlayRef.current) {
      pathOverlayRef.current.setMap(null);
    }

    // Kakao Maps LatLng 배열로 변환
    const linePath = path.map(
      (p) => new window.kakao.maps.LatLng(p.lat, p.lng)
    );

    // 입체감 있는 초록색 라인
    const polyline = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 8, // 두께
      strokeColor: "#10B981", // 초록색
      strokeOpacity: 0.9,
      strokeStyle: "solid",
    });

    polyline.setMap(map);
    pathOverlayRef.current = polyline;

    // 경로 거리 계산
    const distance = calculatePathDistance(path);
    setRouteDistance(distance);
  };

  /**
   * 지도 초기화
   */
  useEffect(() => {
    const initializeMap = (lat: number, lng: number) => {
      setUserLocation({ lat, lng });

      window.kakao.maps.load(() => {
        if (mapContainerRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(lat, lng),
            level: 8,
            zoomable: false, // 마우스 휠 확대/축소 금지
          };
          const map = new window.kakao.maps.Map(
            mapContainerRef.current,
            options
          );
          mapRef.current = map;

          // 사용자 위치 마커
          const userMarkerImage = new window.kakao.maps.MarkerImage(
            "/image/user-marker.svg",
            new window.kakao.maps.Size(40, 40)
          );

          new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(lat, lng),
            map: map,
            image: userMarkerImage,
            title: "내 위치",
          });

          // 전국 흡연부스 마커 렌더링
          renderSmokingBooths(map);
        }
      });
    };

    const startApp = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => initializeMap(pos.coords.latitude, pos.coords.longitude),
          () => initializeMap(37.5665, 126.978)
        );
      } else {
        initializeMap(37.5665, 126.978);
      }
    };

    const scriptId = "kakao-map-sdk";
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      startApp();
    } else {
      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=03d04dc86a7d0b4c4da076a9690cf5c6&autoload=false&libraries=services`;
        script.async = true;
        script.onload = startApp;
        document.head.appendChild(script);
      }
    }
  }, [nationalBooths]);

  /**
   * 장소 검색 및 경로 탐색 (실시간 현재 위치 기준)
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destKeyword.trim() || !mapRef.current) {
      alert("목적지를 입력해주세요.");
      return;
    }

    const ps = new window.kakao.maps.services.Places();

    // 출발지: 사용자가 입력했으면 검색, 아니면 현재 위치 사용
    const processRoute = (start: Point) => {
      setStartPoint(start);

      // 목적지 검색 (전국 단위 지원)
      ps.keywordSearch(destKeyword, (destData: any, destStatus: any) => {
        if (destStatus === window.kakao.maps.services.Status.OK) {
          const dest: Point = {
            lat: parseFloat(destData[0].y),
            lng: parseFloat(destData[0].x),
          };
          setDestPoint(dest);

          // 흡연부스 위치를 Point 배열로 변환
          const obstacles: Point[] = nationalBooths.map((booth) => ({
            lat: booth.latitude,
            lng: booth.longitude,
          }));

          // A* 알고리즘 경로 탐색 (흡연부스 회피)
          const path = findPath(start, dest, obstacles);

          // 경로 그리기
          drawPath(mapRef.current, path);

          // 지도 중심 이동
          const bounds = new window.kakao.maps.LatLngBounds();
          path.forEach((p) => {
            bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng));
          });
          mapRef.current.setBounds(bounds);
        } else {
          alert("목적지 검색 결과가 없습니다.");
        }
      });
    };

    if (startKeyword.trim()) {
      // 출발지 검색
      ps.keywordSearch(startKeyword, (startData: any, startStatus: any) => {
        if (startStatus === window.kakao.maps.services.Status.OK) {
          const start: Point = {
            lat: parseFloat(startData[0].y),
            lng: parseFloat(startData[0].x),
          };
          processRoute(start);
        } else {
          alert("출발지 검색 결과가 없습니다.");
        }
      });
    } else if (userLocation) {
      // 현재 위치 사용
      processRoute(userLocation);
    } else {
      alert("출발지를 입력하거나 위치 권한을 허용해주세요.");
    }
  };

  /**
   * 현재 위치로 출발지 설정
   */
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setStartKeyword("현재 위치");
        },
        () => {
          alert("위치 정보를 가져올 수 없습니다.");
        }
      );
    }
  };

  /**
   * 줌 컨트롤 핸들러
   */
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
    <div className="flex flex-col w-screen h-screen min-h-screen bg-gradient-to-br from-blue-50 to-green-50 overflow-x-hidden overflow-y-auto">
      {/* ========== 섹션 1: 헤더 및 검색 영역 ========== */}
      <section className="w-full px-4 py-6 md:px-8 lg:px-16">
        {/* 상단 헤더 */}
        <MergeAnimation direction="left" className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                흡연부스 회피 네비게이션
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                A* 알고리즘 기반 지능형 경로 탐색 시스템
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-800 hover:bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg transition-all text-sm sm:text-base"
            >
              홈으로
            </button>
          </div>
        </MergeAnimation>

        {/* 실시간 정보 카드 */}
        <MergeAnimation direction="right" delay={0.1} className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-500">실시간 정보</p>
                <p className="text-lg sm:text-xl font-bold text-gray-800">
                  {currentTime.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {currentTime.toLocaleTimeString("ko-KR")}
                </p>
              </div>
              {environmentData && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">미세먼지</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">
                      {environmentData.airQuality.value}
                    </p>
                    <p className="text-xs text-gray-400">
                      {environmentData.airQuality.level}
                    </p>
                  </div>
                  <div className="border-x border-gray-200 px-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">날씨</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">
                      {environmentData.weather.condition}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">기온</p>
                    <p className="text-lg sm:text-2xl font-bold text-orange-600">
                      {environmentData.weather.temp}°C
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </MergeAnimation>

        {/* 검색 폼 */}
        <MergeAnimation direction="left" delay={0.2} className="mb-6">
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="출발지 (비워두면 현재 위치)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={startKeyword}
                  onChange={(e) => setStartKeyword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800"
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
                  최적의 경로를 찾는 인공지능 알고리즘으로 흡연부스를 자동으로 회피합니다.
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
                <h3 className="text-lg font-bold text-gray-800 mb-2">전국 단위 지원</h3>
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
