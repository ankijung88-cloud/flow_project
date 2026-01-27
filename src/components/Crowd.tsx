import { useState, useEffect, useRef, useMemo } from "react";

declare global {
  interface Window {
    kakao: any;
  }
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

export default function Crowd() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hourlyUpdateTime, setHourlyUpdateTime] = useState(new Date()); // 1시간 단위 업데이트용
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // 1초마다 현재 시각 업데이트 (UI 시간 표시용)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 1초마다 갱신

    return () => clearInterval(timer);
  }, []);

  // 1시간마다 혼잡도 데이터 업데이트 (Top 5 혼잡 지역 등)
  useEffect(() => {
    const hourlyTimer = setInterval(() => {
      setHourlyUpdateTime(new Date());
    }, 3600000); // 1시간(3,600,000ms)마다 갱신

    return () => clearInterval(hourlyTimer);
  }, []);

  // 전국 혼잡도 지도 초기화
  useEffect(() => {
    const initializeMap = () => {
      if (!mapContainerRef.current || mapRef.current) return;

      window.kakao.maps.load(() => {
        // 대한민국 중심 좌표 (서울)
        const center = new window.kakao.maps.LatLng(36.5, 127.5);

        const options = {
          center: center,
          level: 13, // 전국이 보이는 레벨
          draggable: true,
          zoomable: false, // 마우스 휠 확대/축소 금지
        };

        const map = new window.kakao.maps.Map(mapContainerRef.current, options);
        mapRef.current = map;

        // 모든 주요 지역에 혼잡도 마커 표시
        majorLocations.forEach((loc) => {
          const data = generateLocationData(loc.name, loc.lat, loc.lng);
          const color = getLevelColor(data.currentLevel);

          // 혼잡도에 따라 마커 크기 조정
          const radius = data.currentLevel === "매우혼잡" ? 45 :
            data.currentLevel === "혼잡" ? 38 :
              data.currentLevel === "보통" ? 32 : 28;

          const markerContent = document.createElement('div');
          markerContent.style.cssText = `position: relative; width: ${radius}px; height: ${radius}px; cursor: pointer;`;
          markerContent.innerHTML = `
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
              <div style="width: 100%; height: 100%; border-radius: 50%; background: ${color}; border: 3px solid white; box-shadow: 0 0 15px ${color}, 0 4px 10px rgba(0,0,0,0.3); animation: pulse 2s ease-in-out infinite;"></div>
              <div style="position: absolute; font-size: 10px; font-weight: bold; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.8); white-space: nowrap; top: -20px;">${loc.name}</div>
              <div style="position: absolute; font-size: 8px; font-weight: bold; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.8); bottom: -18px;">${data.currentLevel}</div>
            </div>
          `;

          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(loc.lat, loc.lng),
            content: markerContent,
            yAnchor: 0.5,
          });
          customOverlay.setMap(map);
        });
      });
    };

    const scriptId = "kakao-map-sdk";
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      initializeMap();
    } else {
      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=7eb77dd1772e545a47f6066b2e87d8f&autoload=false&libraries=services`;
        script.async = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      }
    }
  }, [currentTime]); // currentTime이 변경될 때마다 지도 다시 렌더링

  // 시간대별 혼잡도 데이터 생성 (실시간 기반)
  const generateHourlyData = (): HourlyData[] => {
    const hourlyData: HourlyData[] = [];

    for (let hour = 0; hour < 24; hour++) {
      let basePopulation = 1000;
      let congestionPercent = 0;

      // 피크 타임: 출퇴근 시간 및 점심시간
      if (
        (hour >= 8 && hour < 10) || // 출근 시간 08:00~09:30
        (hour === 9 && currentTime.getMinutes() < 30) ||
        (hour >= 12 && hour < 13) || // 점심시간 12:00~13:00
        (hour >= 18 && hour < 20) || // 퇴근 시간 18:00~19:30
        (hour === 19 && currentTime.getMinutes() < 30)
      ) {
        // 80% ~ 110% 사이 무작위
        congestionPercent = 80 + Math.random() * 30;
        basePopulation = Math.floor((congestionPercent / 100) * 5000);
      }
      // 오프 피크: 그 외 시간대
      else {
        // 20% ~ 50% 사이 무작위
        congestionPercent = 20 + Math.random() * 30;
        basePopulation = Math.floor((congestionPercent / 100) * 5000);
      }

      const variation = (Math.random() - 0.5) * 0.2;
      const population = Math.floor(basePopulation * (1 + variation));

      // 4단계 신호등 컬러 시스템
      let level: "매우혼잡" | "혼잡" | "보통" | "여유";
      if (congestionPercent > 100) level = "매우혼잡"; // 진빨강: 100% 초과
      else if (congestionPercent >= 76) level = "혼잡"; // 연빨강: 76~100%
      else if (congestionPercent >= 51) level = "보통"; // 주황: 51~75%
      else level = "여유"; // 초록: 50% 이하

      hourlyData.push({ hour, population, level });
    }

    return hourlyData;
  };

  // 전국 주요 지역 데이터
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
    { name: "대전역", lat: 36.3504, lng: 127.3845 },
    { name: "유성온천", lat: 36.3539, lng: 127.3435 },
    { name: "광주 금남로", lat: 35.1546, lng: 126.9161 },
    { name: "제주 중문관광단지", lat: 33.2541, lng: 126.5603 },
  ];

  // 위치 데이터 생성
  const generateLocationData = (name: string, lat: number, lng: number): LocationData => {
    const hourlyData = generateHourlyData();
    const currentHour = new Date().getHours();
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

  // 혼잡도 레벨에 따른 4단계 신호등 컬러 시스템
  const getLevelColor = (level: string) => {
    switch (level) {
      case "매우혼잡": return "#DC2626"; // 진빨강: 100% 초과
      case "혼잡": return "#FF6B6B";     // 연빨강: 76~100%
      case "보통": return "#F97316";     // 주황: 51~75%
      case "여유": return "#10B981";     // 초록: 50% 이하
      default: return "#6B7280";
    }
  };

  // 현재 시각을 "HH:mm:ss" 형식으로 반환 (초 단위 실시간)

  // 현재 날짜를 "YYYY년 MM월 DD일" 형식으로 반환



  // const stats = calculateAverageStats();

  // 1시간 단위 업데이트용 Top 5 혼잡 지역 데이터 (hourlyUpdateTime 기준)
  const hourlyTop5Data = useMemo(() => {
    const allLocations = majorLocations.map(loc => generateLocationData(loc.name, loc.lat, loc.lng));
    return [...allLocations]
      .sort((a, b) => b.currentPopulation - a.currentPopulation)
      .slice(0, 5);
  }, [hourlyUpdateTime]);

  // 1시간 단위 업데이트 시간 표시 (HH:mm:ss 형식)
  const getHourlyUpdateTimeString = () => {
    const hours = String(hourlyUpdateTime.getHours()).padStart(2, '0');
    const minutes = String(hourlyUpdateTime.getMinutes()).padStart(2, '0');
    const seconds = String(hourlyUpdateTime.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
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
    <section className="w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-20 md:py-32 lg:py-40 4xl:py-52 5xl:py-64 px-4 5xl:px-12 flex items-center justify-center">
      <div className="w-full max-w-6xl 3xl:max-w-7xl 4xl:max-w-[90%] mx-auto">
        {/* 제목 및 설명 */}
        <div className="flex flex-col items-center text-center mb-16 gap-5 4xl:gap-10 5xl:gap-16">
          <h2 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl 3xl:text-7xl 4xl:text-8xl 5xl:text-9xl font-bold text-gray-900">
            실시간 혼잡도 모니터링
          </h2>
          <p className="text-base xs:text-lg md:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl text-gray-600 max-w-3xl 3xl:max-w-4xl 4xl:max-w-6xl 5xl:max-w-7xl text-center">
            전국 주요 지역의 인구 밀집도를 확인하고<br />
            최적의 방문 시간을 계획하세요
          </p>
        </div>

        {/* 전국 혼잡도 현황 - 실시간 지도 + 분포도 그래프 */}
        <div className="mb-16 4xl:mb-32 5xl:mb-40 bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 p-8 md:p-12 4xl:p-16 5xl:p-24">
          <div className="flex flex-col items-center justify-center text-center w-full mb-16 4xl:mb-24 5xl:mb-32">
            <h3 className="text-xl xs:text-2xl md:text-3xl lg:text-4xl 3xl:text-5xl 4xl:text-6xl 5xl:text-7xl font-bold text-gray-900">전국 혼잡도 현황</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 4xl:gap-20 5xl:gap-32">
            {/* 좌측: 실시간 지도 */}
            <div className="w-full">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-indigo-200 relative group">
                <h4 className="text-lg font-bold text-gray-900 mb-3 text-center">실시간 혼잡도 지도</h4>
                <div
                  ref={mapContainerRef}
                  className="w-full h-[400px] rounded-lg shadow-lg"
                  style={{ border: "2px solid #e0e7ff" }}
                />

                {/* Custom Zoom Controls (Bottom Left) */}
                <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-[30px]">
                  <button
                    onClick={handleZoomIn}
                    className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 overflow-hidden"
                    title="확대"
                  >
                    <img src={`${import.meta.env.BASE_URL}image/zoom-plus.jpg`} alt="확대" className="w-full h-full object-contain" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 overflow-hidden"
                    title="축소"
                  >
                    <img src={`${import.meta.env.BASE_URL}image/zoom-minus.png`} alt="축소" className="w-full h-full object-contain" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                  * 지도를 드래그하여 각 지역의 혼잡도를 확인하세요
                </p>
              </div>
            </div>

            {/* 우측: 분포도 그래프 */}
            <div className="w-full">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">혼잡도 분포</h4>

                {/* 혼잡도별 지역 개수 */}
                <div className="space-y-3 mb-6">
                  {(() => {
                    const allLocations = majorLocations.map(loc => generateLocationData(loc.name, loc.lat, loc.lng));
                    const levelCounts = {
                      "매우혼잡": allLocations.filter(l => l.currentLevel === "매우혼잡").length,
                      "혼잡": allLocations.filter(l => l.currentLevel === "혼잡").length,
                      "보통": allLocations.filter(l => l.currentLevel === "보통").length,
                      "여유": allLocations.filter(l => l.currentLevel === "여유").length,
                    };

                    return Object.entries(levelCounts).map(([level, count]) => {
                      const color = getLevelColor(level);
                      const percentage = (count / majorLocations.length) * 100;

                      return (
                        <div key={level}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-gray-700">{level}</span>
                            <span className="text-sm font-bold" style={{ color }}>{count}개 지역 ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Top 5 혼잡 지역 - 1시간 단위 업데이트 */}
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h5 className="text-sm font-bold text-gray-900 mb-3">Top 5 혼잡 지역</h5>
                  <div className="space-y-2">
                    {hourlyTop5Data.map((location, index) => {
                      const color = getLevelColor(location.currentLevel);
                      return (
                        <div key={location.name} className="flex items-center gap-2">
                          <span className="text-lg font-black text-gray-400 w-6">#{index + 1}</span>
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">{location.name}</span>
                            <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: color + "22", color }}>
                              {location.currentLevel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  * {getHourlyUpdateTimeString()} 기준 데이터입니다 (1시간 단위 업데이트)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 목적지 검색창 */}
        {/* Video Section */}
        {/* 목적지 검색창 */}
      </div>
    </section>
  );
}
