import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MergeSection, MergeCardGrid, FadeInSection } from "../components/MergeScrollAnimation";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";

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

// 24시간 인구 데이터 상수로 관리
const HOURLY_POPULATIONS = Array.from({ length: 24 }, (_, i) => {
  if ((i >= 8 && i < 10) || (i >= 12 && i < 13) || (i >= 18 && i < 20)) {
    return 4000 + Math.random() * 1000;
  } else if (i >= 0 && i < 6) {
    return 500 + Math.random() * 300;
  } else {
    return 1500 + Math.random() * 1000;
  }
});

export default function CrowdDetailPage() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 37.5665, lng: 126.978 });
        }
      );
    } else {
      setUserLocation({ lat: 37.5665, lng: 126.978 });
    }
  }, []);

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

  const generateLocationData = (name: string, lat: number, lng: number): LocationData => {
    const hourlyData: HourlyData[] = HOURLY_POPULATIONS.map((pop, hour) => {
      let level: "매우혼잡" | "혼잡" | "보통" | "여유";
      if (pop > 4000) level = "매우혼잡";
      else if (pop > 2500) level = "혼잡";
      else if (pop > 1000) level = "보통";
      else level = "여유";
      return { hour, population: Math.floor(pop), level };
    });

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

  const getLevelColor = (level: string) => {
    switch (level) {
      case "매우혼잡": return "#ef4444";
      case "혼잡": return "#f97316";
      case "보통": return "#eab308";
      case "여유": return "#22c55e";
      default: return "#94a3b8";
    }
  };

  useEffect(() => {
    const initializeMap = () => {
      if (!mapContainerRef.current || !userLocation) return;

      const options = {
        center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
        level: 8,
      };

      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      mapRef.current = map;

      majorLocations.forEach(loc => {
        const data = generateLocationData(loc.name, loc.lat, loc.lng);
        const color = getLevelColor(data.currentLevel);
        const radius = 30 + (data.currentPopulation / 5000) * 40;

        const markerContent = document.createElement('div');
        markerContent.style.cssText = `position: relative; width: ${radius}px; height: ${radius}px; cursor: pointer;`;
        markerContent.innerHTML = `
          <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
            <div style="width: 100%; height: 100%; border-radius: 50%; background: ${color}; border: 3px solid white; box-shadow: 0 0 20px ${color}, 0 4px 12px rgba(0,0,0,0.3); animation: pulse 2s ease-in-out infinite;"></div>
            <div style="position: absolute; font-size: 10px; font-weight: bold; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.8); white-space: nowrap; top: -20px;">${loc.name}</div>
          </div>
        `;

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(loc.lat, loc.lng),
          content: markerContent,
          yAnchor: 0.5,
        });
        customOverlay.setMap(map);

        markerContent.addEventListener('click', () => {
          setSelectedLocation(data);
          map.panTo(new window.kakao.maps.LatLng(loc.lat, loc.lng));
        });
      });
    };

    if (window.kakao && window.kakao.maps && userLocation) {
      initializeMap();
    }
  }, [userLocation]);

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

  const stats = {
    veryBusy: majorLocations.map(l => generateLocationData(l.name, l.lat, l.lng)).filter(l => l.currentLevel === "매우혼잡").length,
    busy: majorLocations.map(l => generateLocationData(l.name, l.lat, l.lng)).filter(l => l.currentLevel === "혼잡").length,
    normal: majorLocations.map(l => generateLocationData(l.name, l.lat, l.lng)).filter(l => l.currentLevel === "보통").length,
    free: majorLocations.map(l => generateLocationData(l.name, l.lat, l.lng)).filter(l => l.currentLevel === "여유").length,
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <FadeInSection>
        <header className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-105"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">실시간 인구 혼잡도</h1>
                <p className="text-sm font-medium text-indigo-600">전국 주요 지역의 현재 유동인구를 분석합니다</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-indigo-600/10 px-6 py-3 rounded-2xl border border-indigo-200 shadow-sm">
                <span className="text-sm font-black text-indigo-700">{currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-1 grid grid-cols-2 gap-4">
            <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-200 shadow-sm">
              <p className="text-xs font-bold text-red-600 mb-1">매우혼잡</p>
              <p className="text-4xl font-black text-red-700">{stats.veryBusy}</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-200 shadow-sm">
              <p className="text-xs font-bold text-orange-600 mb-1">혼잡</p>
              <p className="text-4xl font-black text-orange-700">{stats.busy}</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-3xl border-2 border-yellow-200 shadow-sm">
              <p className="text-xs font-bold text-yellow-600 mb-1">보통</p>
              <p className="text-4xl font-black text-yellow-700">{stats.normal}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-200 shadow-sm">
              <p className="text-xs font-bold text-green-600 mb-1">여유</p>
              <p className="text-4xl font-black text-green-700">{stats.free}</p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-indigo-100 overflow-hidden relative group">
              <div ref={mapContainerRef} className="w-full h-[500px]" />

              <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-4">
                <button
                  onClick={handleZoomIn}
                  className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-indigo-50 transition-all hover:scale-110 active:scale-95 border-2 border-indigo-50 z-30 !p-0"
                >
                  <PlusIcon className="w-8 h-8 text-black" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-indigo-50 transition-all hover:scale-110 active:scale-95 border-2 border-indigo-50 z-30 !p-0"
                >
                  <MinusIcon className="w-8 h-8 text-black" />
                </button>
              </div>

              {selectedLocation && (
                <div className="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border-2 border-indigo-100 w-72 animate-slideInRight">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-gray-900">{selectedLocation.name}</h3>
                    <span className="text-[10px] font-black px-3 py-1 rounded-full" style={{ backgroundColor: getLevelColor(selectedLocation.currentLevel) + '22', color: getLevelColor(selectedLocation.currentLevel) }}>
                      {selectedLocation.currentLevel}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">현재 유동인구</p>
                      <p className="text-3xl font-black" style={{ color: getLevelColor(selectedLocation.currentLevel) }}>
                        {selectedLocation.currentPopulation.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">명</span>
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">24시간 추이</p>
                      <div className="flex items-end gap-1 h-20">
                        {selectedLocation.hourlyData.slice(6, 22).map((h, i) => {
                          const height = (h.population / 5000) * 100;
                          return (
                            <div
                              key={i}
                              className="flex-1 rounded-t-sm transition-all"
                              style={{ height: `${height}%`, backgroundColor: getLevelColor(h.level), opacity: h.hour === currentTime.getHours() ? 1 : 0.4 }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
}
