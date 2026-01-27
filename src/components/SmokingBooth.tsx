import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNationalSmokingBooths } from "../services/smokingBoothService";
import type { SmokingBooth as SmokingBoothType } from "../services/smokingBoothService";

declare global {
  interface Window {
    kakao: any;
  }
}

interface SmokingBoothProps {
  onShowMap: () => void;
  onShowCrowdMap: () => void;
}

interface SmokingCard {
  id: string;
  title: string;
  description: string;
  onClick: () => void;
}

export default function SmokingBooth({ onShowMap, onShowCrowdMap }: SmokingBoothProps) {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [stats, setStats] = useState({ within500m: 0, within1km: 0, within2km: 0 });

  const mapContainerRef1 = useRef<HTMLDivElement>(null);
  const mapContainerRef2 = useRef<HTMLDivElement>(null);
  const mapRef1 = useRef<any>(null);
  const mapRef2 = useRef<any>(null);
  const [nationalBooths] = useState<SmokingBoothType[]>(getNationalSmokingBooths());

  const cards: SmokingCard[] = [
    {
      id: "smoking-location",
      title: "내 주변 흡연부스 위치",
      description: "전국 300개 이상의 흡연부스 위치를 실시간으로 확인하세요. 가장 가까운 흡연부스를 빠르게 찾아 불필요한 이동 시간을 줄이고, 더 쾌적한 환경을 경험할 수 있습니다.",
      onClick: onShowMap,
    },
    {
      id: "crowd-monitoring",
      title: "실시간 혼잡도 모니터링",
      description: "전국 주요 지역의 실시간 인구 밀집도를 확인하고 최적의 방문 시간을 찾으세요. 데이터 기반 분석으로 혼잡한 장소를 피하고 쾌적한 환경에서 더 나은 경험을 만들어보세요.",
      onClick: onShowCrowdMap,
    },
  ];

  useEffect(() => {
    // 사용자 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // 위치 권한 거부 시 서울 중심으로 설정
          setUserLocation({ lat: 37.5665, lng: 126.978 });
        }
      );
    } else {
      setUserLocation({ lat: 37.5665, lng: 126.978 });
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const initializeMaps = () => {
      window.kakao.maps.load(() => {
        // 카드 1: 흡연부스 위치 지도
        if (mapContainerRef1.current && !mapRef1.current) {
          const options1 = {
            center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
            level: 5,
            draggable: false,
            zoomable: false,
            disableDoubleClickZoom: true,
            scrollwheel: false,
          };
          const map1 = new window.kakao.maps.Map(mapContainerRef1.current, options1);
          mapRef1.current = map1;

          // 사용자 위치 마커
          const userMarkerImage = new window.kakao.maps.MarkerImage(
            `${import.meta.env.BASE_URL}image/user-marker.svg`,
            new window.kakao.maps.Size(32, 32)
          );
          new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
            map: map1,
            image: userMarkerImage,
          });

          // 주변 흡연부스 마커 (가까운 10개만)
          const sortedBooths = nationalBooths
            .map(b => ({
              ...b,
              distance: Math.sqrt(Math.pow(b.latitude - userLocation.lat, 2) + Math.pow(b.longitude - userLocation.lng, 2)) * 111320
            }))
            .sort((a, b) => a.distance - b.distance);

          // 통계 업데이트
          setStats({
            within500m: sortedBooths.filter(b => b.distance <= 500).length,
            within1km: sortedBooths.filter(b => b.distance <= 1000).length,
            within2km: sortedBooths.filter(b => b.distance <= 2000).length,
          });

          sortedBooths.slice(0, 10).forEach((booth) => {
            const markerContent = document.createElement('div');
            markerContent.style.cssText = 'position: relative; width: 32px; height: 32px;';
            markerContent.innerHTML = `
              <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                <div class="smoke-marker-ripple"></div>
                <div class="smoke-marker-ripple"></div>
                <div class="smoke-marker-ripple"></div>
                <div class="smoke-marker-ripple"></div>
                <img src="${import.meta.env.BASE_URL}image/smoke_icon.png" alt="흡연부스" style="width: 28px; height: 28px; position: relative; z-index: 10; mix-blend-mode: multiply; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); background: transparent;" />
              </div>
            `;

            const customOverlay = new window.kakao.maps.CustomOverlay({
              position: new window.kakao.maps.LatLng(booth.latitude, booth.longitude),
              content: markerContent,
              yAnchor: 0.5,
            });
            customOverlay.setMap(map1);
          });
        }

        // 카드 2: 혼잡도 모니터링 지도
        if (mapContainerRef2.current && !mapRef2.current) {
          const options2 = {
            center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
            level: 5,
            draggable: false,
            zoomable: false,
            disableDoubleClickZoom: true,
            scrollwheel: false,
          };
          const map2 = new window.kakao.maps.Map(mapContainerRef2.current, options2);
          mapRef2.current = map2;

          // 사용자 위치 마커
          const userMarkerImage = new window.kakao.maps.MarkerImage(
            `${import.meta.env.BASE_URL}image/user-marker.svg`,
            new window.kakao.maps.Size(32, 32)
          );
          new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
            map: map2,
            image: userMarkerImage,
          });

          // 혼잡도 히트맵 (사용자 위치 기반 시뮬레이션 - 겹치지 않도록 위치 조정)
          const crowdLocations = [
            { name: "현재 위치", lat: userLocation.lat, lng: userLocation.lng, level: "medium", radius: 60 },
            { name: "북쪽 지역", lat: userLocation.lat + 0.025, lng: userLocation.lng, level: "low", radius: 55 },
            { name: "남쪽 지역", lat: userLocation.lat - 0.025, lng: userLocation.lng, level: "high", radius: 65 },
            { name: "동쪽 지역", lat: userLocation.lat, lng: userLocation.lng + 0.03, level: "very_high", radius: 75 },
            { name: "서쪽 지역", lat: userLocation.lat, lng: userLocation.lng - 0.03, level: "medium", radius: 58 },
            { name: "북동쪽", lat: userLocation.lat + 0.02, lng: userLocation.lng + 0.025, level: "low", radius: 50 },
            { name: "남서쪽", lat: userLocation.lat - 0.02, lng: userLocation.lng - 0.025, level: "high", radius: 62 },
          ];

          crowdLocations.forEach((location) => {
            const color =
              location.level === "very_high"
                ? "rgba(239, 68, 68, 0.6)"
                : location.level === "high"
                  ? "rgba(249, 115, 22, 0.6)"
                  : location.level === "medium"
                    ? "rgba(234, 179, 8, 0.6)"
                    : "rgba(34, 197, 94, 0.6)";

            const borderColor =
              location.level === "very_high"
                ? "rgba(239, 68, 68, 0.8)"
                : location.level === "high"
                  ? "rgba(249, 115, 22, 0.8)"
                  : location.level === "medium"
                    ? "rgba(234, 179, 8, 0.8)"
                    : "rgba(34, 197, 94, 0.8)";

            const markerContent = document.createElement('div');
            markerContent.style.cssText = `position: relative; width: ${location.radius}px; height: ${location.radius}px;`;
            markerContent.innerHTML = `
              <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                <div style="width: 100%; height: 100%; border-radius: 50%; background: ${color}; border: 3px solid ${borderColor}; box-shadow: 0 0 20px ${color}, 0 4px 12px rgba(0,0,0,0.3);"></div>
                <div style="position: absolute; font-size: 11px; font-weight: bold; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.8); white-space: nowrap;">${location.name}</div>
              </div>
            `;

            const customOverlay = new window.kakao.maps.CustomOverlay({
              position: new window.kakao.maps.LatLng(location.lat, location.lng),
              content: markerContent,
              yAnchor: 0.5,
            });
            customOverlay.setMap(map2);
          });
        }
      });
    };

    const scriptId = "kakao-map-sdk";
    const appKey = "7eb77dd1772e545a47f6066b2e87d8f";

    if (window.kakao && window.kakao.maps) {
      initializeMaps();
    } else {
      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
        script.async = true;
        script.onload = initializeMaps;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", initializeMaps);
      }
    }
  }, [userLocation, nationalBooths]);


  // 줌 컨트롤 핸들러 (지도 1)
  const handleZoomIn1 = () => {
    if (mapRef1.current) {
      mapRef1.current.setLevel(mapRef1.current.getLevel() - 1);
    }
  };

  const handleZoomOut1 = () => {
    if (mapRef1.current) {
      mapRef1.current.setLevel(mapRef1.current.getLevel() + 1);
    }
  };

  // 줌 컨트롤 핸들러 (지도 2)
  const handleZoomIn2 = () => {
    if (mapRef2.current) {
      mapRef2.current.setLevel(mapRef2.current.getLevel() - 1);
    }
  };

  const handleZoomOut2 = () => {
    if (mapRef2.current) {
      mapRef2.current.setLevel(mapRef2.current.getLevel() + 1);
    }
  };

  return (
    <section className="w-full bg-gradient-to-br from-green-50 via-white to-blue-50 py-16 md:py-24 lg:py-32 4xl:py-48 5xl:py-64 px-4 5xl:px-12 flex items-center justify-center">
      <div className="w-full max-w-7xl 3xl:max-w-[90%] mx-auto">
        {/* 섹션 헤더 */}
        <div className="flex flex-col items-center text-center mb-16 gap-5 4xl:gap-10 5xl:gap-16">
          <h2 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl 3xl:text-7xl 4xl:text-8xl 5xl:text-9xl font-bold text-gray-900">
            위치 서비스 안내
          </h2>
        </div>

        {/* 카드 2개 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 4xl:gap-16 5xl:gap-24">
          {cards.map((card, index) => {
            const mapContainerRef = index === 0 ? mapContainerRef1 : mapContainerRef2;
            const isHovered = hoveredCard === index;

            return (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className="relative w-full h-[450px] sm:h-[550px] md:h-[650px] lg:h-[700px] cursor-pointer overflow-hidden group"
                style={{ borderRadius: "12px" }}
              >
                {/* 카드 컨테이너 */}
                <div
                  className="relative w-full h-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                  style={{ borderRadius: "12px" }}
                >
                  {/* 실시간 지도 배경 */}
                  <div className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105">
                    <div
                      ref={mapContainerRef}
                      className="w-full h-full"
                      style={{ pointerEvents: "none" }}
                    />

                    {/* 거리별 흡연구역 수량 박스 (Top Left Overlay) - 첫 번째 카드에만 표시 */}
                    {index === 0 && (
                      <div className="absolute top-4 left-4 z-50 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border-2 border-green-100 min-w-[140px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">📊</span>
                          <h4 className="text-[10px] font-bold text-gray-900">주변 흡정보</h4>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between px-2 py-1 bg-green-50 rounded-lg">
                            <span className="text-[8px] font-bold text-green-700">500m</span>
                            <span className="text-xs font-black text-green-900">{stats.within500m}개</span>
                          </div>
                          <div className="flex items-center justify-between px-2 py-1 bg-emerald-50 rounded-lg">
                            <span className="text-[8px] font-bold text-emerald-700">1km</span>
                            <span className="text-xs font-black text-emerald-900">{stats.within1km}개</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Zoom Controls (Bottom Left) */}
                    <div className="absolute bottom-4 left-4 z-40 flex flex-col gap-2 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          index === 0 ? handleZoomIn1() : handleZoomIn2();
                        }}
                        className="relative w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 z-30 !p-0 overflow-hidden"
                        title="확대"
                      >
                        <img src={`${import.meta.env.BASE_URL}image/zoom-in.png`} alt="확대" className="w-full h-full object-contain p-2" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          index === 0 ? handleZoomOut1() : handleZoomOut2();
                        }}
                        className="relative w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 z-30 !p-0 overflow-hidden"
                        title="축소"
                      >
                        <img src={`${import.meta.env.BASE_URL}image/zoom-out.png`} alt="축소" className="w-full h-full object-contain p-2" />
                      </button>
                    </div>
                  </div>

                  {/* 그라데이션 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* 카드 하단 - 타이틀 */}
                  <div className={`absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10 transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"} pointer-events-none`}>
                    <div className="flex flex-col items-center">
                      <p className="text-sm sm:text-base text-white/90 text-center">
                        호버하여 자세히 보기
                      </p>
                    </div>
                  </div>

                  {/* 오버레이 - 호버 시 표시 */}
                  <div
                    className={`absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 transition-all duration-300 z-20 overflow-y-auto scrollbar-hide ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="text-center max-w-xl 4xl:max-w-3xl 5xl:max-w-5xl pointer-events-auto flex flex-col items-center gap-[20px]">
                      <h3 className="text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl 4xl:text-6xl 5xl:text-7xl font-bold text-white">
                        {card.title}
                      </h3>
                      <p
                        className="text-white text-base sm:text-lg 3xl:text-xl 4xl:text-3xl 5xl:text-4xl leading-relaxed text-center"
                      >
                        {card.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(index === 0 ? "/smoking-booth" : "/crowd");
                          }}
                          className="bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-3 px-8 sm:py-4 sm:px-12 rounded-full text-base sm:text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                          {index === 0 ? "상세페이지 보기" : "상세페이지 보기"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            card.onClick();
                          }}
                          className="bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-8 sm:py-4 sm:px-12 rounded-full text-base sm:text-lg border-2 border-white/50 hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                        >
                          {index === 0 ? "지도 보기" : "혼잡도 보기"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
