import { useState, useEffect, useRef } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";

declare global {
  interface Window {
    kakao: any;
  }
}

interface CongestionMonitoringProps {
  onBack: () => void;
}

interface HourlyData {
  hour: number;
  population: number;
  level: "매우혼잡" | "혼잡" | "보통" | "여유";
}

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  currentPopulation: number;
  currentLevel: "매우혼잡" | "혼잡" | "보통" | "여유";
  hourlyData: HourlyData[];
}

export default function CongestionMonitoring({ onBack }: CongestionMonitoringProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // 1분마다 현재 시각 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // 시간대별 혼잡도 데이터 생성
  const generateHourlyData = (): HourlyData[] => {
    const hourlyData: HourlyData[] = [];

    for (let hour = 0; hour < 24; hour++) {
      let basePopulation = 1000;
      let congestionPercent = 0;

      if (
        (hour >= 8 && hour < 10) ||
        (hour >= 12 && hour < 13) ||
        (hour >= 18 && hour < 20)
      ) {
        congestionPercent = 80 + Math.random() * 30;
        basePopulation = Math.floor((congestionPercent / 100) * 5000);
      } else {
        congestionPercent = 20 + Math.random() * 30;
        basePopulation = Math.floor((congestionPercent / 100) * 5000);
      }

      const variation = (Math.random() - 0.5) * 0.2;
      const population = Math.floor(basePopulation * (1 + variation));

      let level: "매우혼잡" | "혼잡" | "보통" | "여유";
      if (congestionPercent > 100) level = "매우혼잡";
      else if (congestionPercent >= 76) level = "혼잡";
      else if (congestionPercent >= 51) level = "보통";
      else level = "여유";

      hourlyData.push({ hour, population, level });
    }

    return hourlyData;
  };

  // 전국 주요 지역
  const majorLocations = [
    { name: "강남역", lat: 37.4979, lng: 127.0276 },
    { name: "홍대입구역", lat: 37.5572, lng: 126.9247 },
    { name: "명동", lat: 37.5637, lng: 126.9838 },
    { name: "잠실역", lat: 37.5145, lng: 127.0595 },
    { name: "서울역", lat: 37.5547, lng: 126.9707 },
    { name: "신촌역", lat: 37.5219, lng: 126.9245 },
    { name: "건대입구역", lat: 37.5406, lng: 127.0693 },
    { name: "이태원역", lat: 37.5344, lng: 126.9944 },
    { name: "서면역", lat: 35.1796, lng: 129.0756 },
    { name: "해운대해수욕장", lat: 35.1585, lng: 129.1606 },
    { name: "부산역", lat: 35.1150, lng: 129.0403 },
    { name: "광안리해수욕장", lat: 35.1532, lng: 129.1189 },
    { name: "인천공항", lat: 37.4602, lng: 126.4407 },
    { name: "송도센트럴파크", lat: 37.3894, lng: 126.6544 },
    { name: "부평역", lat: 37.4895, lng: 126.7226 },
    { name: "동성로", lat: 35.8714, lng: 128.6014 },
    { name: "반월당역", lat: 35.8580, lng: 128.5944 },
    { name: "대구역", lat: 35.8755, lng: 128.5944 },
    { name: "대전역", lat: 36.3312, lng: 127.4333 },
    { name: "유성온천", lat: 36.3539, lng: 127.3435 },
    { name: "광주 금남로", lat: 35.1546, lng: 126.9161 },
  ];

  // 위치 데이터 생성
  const generateLocationData = (name: string, lat: number, lng: number): LocationData => {
    const hourlyData = generateHourlyData();
    const currentHour = currentTime.getHours();
    const currentData = hourlyData[currentHour];

    return {
      name,
      lat,
      lng,
      currentPopulation: currentData.population,
      currentLevel: currentData.level,
      hourlyData,
    };
  };

  // 혼잡도 레벨에 따른 색상
  const getLevelColor = (level: string) => {
    switch (level) {
      case "매우혼잡": return "#DC2626";
      case "혼잡": return "#EA580C";
      case "보통": return "#CA8A04";
      case "여유": return "#16A34A";
      default: return "#9CA3AF";
    }
  };

  useEffect(() => {
    const initializeMap = () => {
      if (!mapContainerRef.current) return;

      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 11,
      };

      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      mapRef.current = map;

      // 마커 및 오버레이 생성
      majorLocations.forEach((loc) => {
        const data = generateLocationData(loc.name, loc.lat, loc.lng);
        const color = getLevelColor(data.currentLevel);

        const content = document.createElement("div");
        content.className = "relative group cursor-pointer";
        content.innerHTML = `
          <div class="flex flex-col items-center">
            <div class="px-2 py-1 bg-white rounded-lg shadow-lg border-2 text-[10px] font-bold mb-1 whitespace-nowrap" style="border-color: ${color}">
              ${loc.name}
            </div>
            <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse" style="background-color: ${color}"></div>
          </div>
        `;

        const overlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(loc.lat, loc.lng),
          content: content,
          yAnchor: 1.2,
        });

        overlay.setMap(map);

        content.onclick = () => {
          setSelectedLocation(data);
          map.panTo(new window.kakao.maps.LatLng(loc.lat, loc.lng));
        };
      });
    };

    const scriptId = "kakao-map-sdk";
    const appKey = "7eb77dd1772e545a47f6066b2e87d8f";

    if (window.kakao && window.kakao.maps) {
      initializeMap();
    } else {
      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
        script.async = true;
        script.onload = () => {
          window.kakao.maps.load(initializeMap);
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", () => {
          window.kakao.maps.load(initializeMap);
        });
      }
    }
  }, [currentTime]);

  // 전국 통계
  const allLocations = majorLocations.map(loc => generateLocationData(loc.name, loc.lat, loc.lng));
  const totalPopulation = allLocations.reduce((sum, loc) => sum + loc.currentPopulation, 0);
  const avgPopulation = Math.floor(totalPopulation / allLocations.length);

  const levelCounts = {
    "매우혼잡": allLocations.filter(l => l.currentLevel === "매우혼잡").length,
    "혼잡": allLocations.filter(l => l.currentLevel === "혼잡").length,
    "보통": allLocations.filter(l => l.currentLevel === "보통").length,
    "여유": allLocations.filter(l => l.currentLevel === "여유").length,
  };

  // 최적 방문 시간 추천
  const getOptimalTime = (location: LocationData) => {
    const sortedByPopulation = [...location.hourlyData].sort((a, b) => a.population - b.population);
    const top3 = sortedByPopulation.slice(0, 3);
    return top3;
  };

  // 줌 컨트롤 핸들러
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
    <div className="flex flex-col items-center justify-start w-screen min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 sm:p-6 md:p-8">
      {/* 헤더 */}
      <div className="w-full w-full mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border-2 border-indigo-100">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900">혼잡도 모니터링</h1>
              <p className="text-sm font-medium text-gray-500">전국 주요 지역 실시간 유동인구 분석</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-indigo-600/10 px-4 py-2 rounded-2xl border border-indigo-100">
              <span className="text-sm font-bold text-indigo-700">{currentTime.toLocaleString()}</span>
            </div>
            <div className="bg-purple-600/10 px-4 py-2 rounded-2xl border border-purple-100">
              <span className="text-sm font-bold text-purple-700">평균 유동인구: {avgPopulation.toLocaleString()}명</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* 통계 요약 */}
        <div className="lg:col-span-1 grid grid-cols-2 gap-4">
          <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-200">
            <p className="text-xs font-bold text-red-600 mb-1">매우혼잡</p>
            <p className="text-3xl font-black text-red-700">{levelCounts.매우혼잡}</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-200">
            <p className="text-xs font-bold text-orange-600 mb-1">혼잡</p>
            <p className="text-3xl font-black text-orange-700">{levelCounts.혼잡}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-3xl border-2 border-yellow-200">
            <p className="text-xs font-bold text-yellow-600 mb-1">보통</p>
            <p className="text-3xl font-black text-yellow-700">{levelCounts.보통}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-200">
            <p className="text-xs font-bold text-green-600 mb-1">여유</p>
            <p className="text-3xl font-black text-green-700">{levelCounts.여유}</p>
          </div>
        </div>

        {/* 메인 지도부 */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-indigo-200 overflow-hidden">
            <div
              ref={mapContainerRef}
              className="w-full h-[400px] rounded-lg shadow-lg"
              style={{ border: "2px solid #e0e7ff" }}
            />

            {/* Custom Zoom Controls (Bottom Left) */}
            <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-4">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 z-30 !p-0"
                title="확대"
              >
                <PlusIcon className="w-7 h-7 text-black relative z-40" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 z-30 !p-0"
                title="축소"
              >
                <MinusIcon className="w-7 h-7 text-black relative z-40" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 p-4">
              * 지도 위 마커를 클릭하면 상세 정보를 확인하실 수 있습니다.
            </p>
          </div>

          {/* 선택된 지역 상세 정보 */}
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedLocation ? `${selectedLocation.name} 상세 정보` : "지도에서 지역을 선택하세요"}
            </h3>
            {selectedLocation ? (
              <div className="space-y-4">
                {/* 현재 혼잡도 */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2 text-center">현재 유동인구</p>
                  <p className="text-5xl font-black text-center mb-2" style={{ color: getLevelColor(selectedLocation.currentLevel) }}>
                    {selectedLocation.currentPopulation.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 text-center mb-3">예상 방문객 수 (명)</p>
                  <div className="text-center">
                    <span className={`inline-block px-6 py-2 rounded-full text-lg font-black ${selectedLocation.currentLevel === "매우혼잡" ? "bg-red-100 text-red-700" :
                      selectedLocation.currentLevel === "혼잡" ? "bg-orange-100 text-orange-700" :
                        selectedLocation.currentLevel === "보통" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                      }`}>
                      {selectedLocation.currentLevel}
                    </span>
                  </div>
                </div>

                {/* 24시간 혼잡도 그래프 */}
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-3">24시간 혼잡도 추이</p>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-end justify-between gap-1 h-32">
                      {selectedLocation.hourlyData.map((data) => {
                        const maxPop = Math.max(...selectedLocation.hourlyData.map(d => d.population));
                        const height = (data.population / maxPop) * 100;
                        const color = getLevelColor(data.level);
                        const isCurrentHour = data.hour === currentTime.getHours();

                        return (
                          <div key={data.hour} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full rounded-t"
                              style={{
                                height: `${height}%`,
                                backgroundColor: color,
                                opacity: isCurrentHour ? 1 : 0.6,
                              }}
                            />
                            {data.hour % 6 === 0 && (
                              <span className="text-[8px] text-gray-500">{data.hour}h</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 최적 방문 시간 */}
                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                  <p className="text-sm font-bold text-gray-900 mb-3">추천 방문 시간 (여유로운 시간대)</p>
                  <div className="flex gap-2 justify-center">
                    {getOptimalTime(selectedLocation).map((time) => (
                      <div key={time.hour} className="bg-white px-3 py-2 rounded-lg border border-green-300">
                        <p className="text-xl font-black text-green-600">{time.hour}시</p>
                        <p className="text-[10px] text-gray-600">{time.level}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                <p className="text-center italic">
                  지도에서 특정 마커를 선택하시면<br />
                  상세한 인구 밀집도를 분석해 드립니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 전체 실시간 혼잡도 순위 */}
      <div className="w-full w-full mb-8">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-pink-200 p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">지역별 실시간 혼잡 순위</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allLocations
              .sort((a, b) => b.currentPopulation - a.currentPopulation)
              .map((location, index) => {
                const color = getLevelColor(location.currentLevel);
                return (
                  <div
                    key={location.name}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 hover:shadow-lg transition-all cursor-pointer group"
                    style={{ borderColor: color + "44" }}
                    onClick={() => {
                      setSelectedLocation(location);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-black text-gray-400 group-hover:text-indigo-400 transition-colors">#{index + 1}</span>
                      <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ backgroundColor: color + "22", color }}>
                        {location.currentLevel}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1">{location.name}</p>
                    <p className="text-2xl font-black" style={{ color }}>
                      {location.currentPopulation.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">명</span>
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white px-12 py-4 rounded-full font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
