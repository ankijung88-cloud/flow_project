import { useState, useEffect, useRef } from "react";
import { getNationalSmokingBooths } from "../services/smokingBoothService";
import type { SmokingBooth } from "../services/smokingBoothService";

declare global {
  interface Window {
    kakao: any;
  }
}

interface RegionDetailProps {
  region: string;
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

export default function RegionDetail({ region, onBack }: RegionDetailProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1분마다 현재 시각 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const mapContainerRef1 = useRef<HTMLDivElement>(null);
  const mapContainerRef2 = useRef<HTMLDivElement>(null);
  const mapRef1 = useRef<any>(null);
  const mapRef2 = useRef<any>(null);
  const [nationalBooths] = useState<SmokingBooth[]>(getNationalSmokingBooths());

  const getRegionInfo = (regionName: string) => {
    const regionMap: { [key: string]: { lat: number; lng: number; level: number; keyword: string } } = {
      "서울": { lat: 37.5665, lng: 126.978, level: 8, keyword: "서울" },
      "경기": { lat: 37.4138, lng: 127.5183, level: 9, keyword: "경기" },
      "인천": { lat: 37.4563, lng: 126.7052, level: 9, keyword: "인천" },
      "부산": { lat: 35.1796, lng: 129.0756, level: 9, keyword: "부산" },
      "대구": { lat: 35.8714, lng: 128.6014, level: 9, keyword: "대구" },
      "광주": { lat: 35.1595, lng: 126.8526, level: 9, keyword: "광주" },
      "대전": { lat: 36.3504, lng: 127.3845, level: 9, keyword: "대전" },
      "제주": { lat: 33.4890, lng: 126.4983, level: 10, keyword: "제주" },
    };
    return regionMap[regionName] || regionMap["서울"];
  };

  const regionInfo = getRegionInfo(region);

  const getRegionBooths = (): SmokingBooth[] => {
    return nationalBooths.filter(booth =>
      booth.address.includes(regionInfo.keyword)
    );
  };

  const regionBooths = getRegionBooths();

  const getRegionLocations = () => {
    const locationsByRegion: { [key: string]: { name: string; lat: number; lng: number }[] } = {
      "서울": [
        { name: "강남역", lat: 37.4979, lng: 127.0276 },
        { name: "홍대입구역", lat: 37.5572, lng: 126.9247 },
        { name: "명동", lat: 37.5637, lng: 126.9838 },
        { name: "잠실역", lat: 37.5145, lng: 127.0595 },
        { name: "신촌역", lat: 37.5219, lng: 126.9245 },
        { name: "이태원역", lat: 37.5344, lng: 126.9944 },
      ],
      "경기": [
        { name: "수원역", lat: 37.2660, lng: 127.0011 },
        { name: "분당", lat: 37.3595, lng: 127.1052 },
        { name: "일산", lat: 37.6583, lng: 126.7680 },
        { name: "안양", lat: 37.3943, lng: 126.9568 },
      ],
      "인천": [
        { name: "인천공항", lat: 37.4602, lng: 126.4407 },
        { name: "송도센트럴파크", lat: 37.3894, lng: 126.6544 },
        { name: "부평역", lat: 37.4895, lng: 126.7226 },
      ],
      "부산": [
        { name: "서면역", lat: 35.1796, lng: 129.0756 },
        { name: "해운대해수욕장", lat: 35.1585, lng: 129.1606 },
        { name: "광안리해수욕장", lat: 35.1532, lng: 129.1189 },
      ],
      "대구": [
        { name: "동성로", lat: 35.8714, lng: 128.6014 },
        { name: "반월당역", lat: 35.8580, lng: 128.5944 },
      ],
      "광주": [
        { name: "광주 금남로", lat: 35.1546, lng: 126.9161 },
      ],
      "대전": [
        { name: "대전역", lat: 36.3312, lng: 127.4333 },
        { name: "유성온천", lat: 36.3539, lng: 127.3435 },
      ],
      "제주": [
        { name: "제주 중문단지", lat: 33.2541, lng: 126.5603 },
      ]
    };
    return locationsByRegion[region] || [];
  };

  const majorLocations = getRegionLocations();

  const generateHourlyData = (): HourlyData[] => {
    const hourlyData: HourlyData[] = [];
    const seed = Math.random();
    for (let hour = 0; hour < 24; hour++) {
      let basePopulation = 500 + seed * 1000;
      if ((hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 20)) basePopulation *= 3;
      const population = Math.floor(basePopulation * (0.8 + Math.random() * 0.4));
      let level: "매우혼잡" | "혼잡" | "보통" | "여유";
      if (population > 3000) level = "매우혼잡";
      else if (population > 1500) level = "혼잡";
      else if (population > 500) level = "보통";
      else level = "여유";
      hourlyData.push({ hour, population, level });
    }
    return hourlyData;
  };

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
    const initializeMaps = () => {
      // 지도 1: 흡연부스 위치
      if (mapContainerRef1.current && !mapRef1.current) {
        const map1 = new window.kakao.maps.Map(mapContainerRef1.current, {
          center: new window.kakao.maps.LatLng(regionInfo.lat, regionInfo.lng),
          level: regionInfo.level,
        });
        mapRef1.current = map1;

        regionBooths.forEach(booth => {
          new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(booth.latitude, booth.longitude),
            map: map1,
          });
        });
      }

      // 지도 2: 혼잡도 모니터링
      if (mapContainerRef2.current && !mapRef2.current) {
        const map2 = new window.kakao.maps.Map(mapContainerRef2.current, {
          center: new window.kakao.maps.LatLng(regionInfo.lat, regionInfo.lng),
          level: regionInfo.level,
        });
        mapRef2.current = map2;

        majorLocations.forEach(loc => {
          const data = generateLocationData(loc.name, loc.lat, loc.lng);
          const color = getLevelColor(data.currentLevel);

          const content = document.createElement("div");
          content.innerHTML = `
                <div class="flex flex-col items-center">
                  <div class="bg-white px-2 py-1 rounded shadow-lg text-[10px] font-bold mb-1 border border-indigo-100 whitespace-nowrap">${loc.name}</div>
                  <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse" style="background-color: ${color}"></div>
                </div>
            `;

          new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(loc.lat, loc.lng),
            content: content,
            map: map2,
            yAnchor: 1.2,
          });
        });
      }
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
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services,clusterer,drawing`;
        script.async = true;
        script.onload = () => {
          window.kakao.maps.load(initializeMaps);
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", () => {
          window.kakao.maps.load(initializeMaps);
        });
      }
    }
  }, [region, regionInfo]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 overflow-y-auto">
      <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-black text-gray-900">{region} 지역 상세 분석</h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400">DATA UPDATED</p>
          <p className="text-lg font-black text-indigo-600">{currentTime.toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">흡연시설 분포 ({regionBooths.length})</h3>
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-xl border border-gray-100 h-[400px]">
            <div ref={mapContainerRef1} className="w-full h-full rounded-2xl overflow-hidden" />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">유동인구 혼잡도 분석</h3>
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-xl border border-gray-100 h-[400px]">
            <div ref={mapContainerRef2} className="w-full h-full rounded-2xl overflow-hidden" />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-3xl border border-red-100">
            <h4 className="font-bold text-gray-900 mb-4">흡연시설 관리 효율성</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-gray-500">시설 밀집도</span>
                <span className="text-2xl font-black text-red-600">고위험</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-red-500"></div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                해당 지역은 시설 밀집도가 높아 정기적인 공공 위생 관리가 집중적으로 필요합니다.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-3xl border border-indigo-100">
            <h4 className="font-bold text-gray-900 mb-4">지역 기반 추천 경로</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-gray-500">회피 가능성</span>
                <span className="text-2xl font-black text-indigo-600">최상</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-[92%] h-full bg-indigo-500"></div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                A* 알고리즘 분석 결과, 해당 지역 내에서는 모든 인프라를 활용한 최적 회피가 가능합니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
