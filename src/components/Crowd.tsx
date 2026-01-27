import { useState, useEffect, useRef } from "react";
import { FadeInSection } from "./MergeScrollAnimation";

declare global {
  interface Window {
    kakao: any;
  }
}

interface CrowdProps {
  onBack: () => void;
  onShowRegionDetail: (region: string) => void;
}

export default function Crowd({ onBack, onShowRegionDetail }: CrowdProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const regions = [
    { name: "서울", lat: 37.5665, lng: 126.978, level: "혼잡", color: "#f97316" },
    { name: "경기", lat: 37.4138, lng: 127.5183, level: "보통", color: "#eab308" },
    { name: "인천", lat: 37.4563, lng: 126.7052, level: "여유", color: "#22c55e" },
    { name: "부산", lat: 35.1796, lng: 129.0756, level: "매우혼잡", color: "#ef4444" },
    { name: "대구", lat: 35.8714, lng: 128.6014, level: "보통", color: "#eab308" },
    { name: "광주", lat: 35.1595, lng: 126.8526, level: "여유", color: "#22c55e" },
    { name: "대전", lat: 36.3504, lng: 127.3845, level: "혼잡", color: "#f97316" },
    { name: "제주", lat: 33.4890, lng: 126.4983, level: "보통", color: "#eab308" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapContainerRef.current) return;

      const options = {
        center: new window.kakao.maps.LatLng(36.5, 127.5),
        level: 13,
      };

      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      mapRef.current = map;

      regions.forEach((region) => {
        const content = document.createElement("div");
        content.className = "group cursor-pointer";
        content.innerHTML = `
          <div class="flex flex-col items-center">
            <div class="px-2 py-1 bg-white rounded shadow-lg border-2 text-[10px] font-bold mb-1 opacity-90 group-hover:scale-110 transition-transform" style="border-color: ${region.color}">
              ${region.name}
            </div>
            <div class="w-3 h-3 rounded-full shadow-lg" style="background-color: ${region.color}"></div>
          </div>
        `;

        const overlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(region.lat, region.lng),
          content: content,
          yAnchor: 1.2,
        });

        overlay.setMap(map);

        content.onclick = () => {
          onShowRegionDetail(region.name);
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
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-hidden p-6">
      <FadeInSection className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">전국 혼잡도 현황</h2>
            <p className="text-sm font-medium text-indigo-600">지역별 유동인구 밀집도를 한눈에 확인하세요</p>
          </div>
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-105"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-[500px] relative rounded-[2.5rem] border-4 border-indigo-50 shadow-2xl overflow-hidden mb-8">
          <div ref={mapContainerRef} className="w-full h-full" />

          <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-indigo-100">
            <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">LIVE STATUS</p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-black text-gray-800">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 z-10 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-indigo-100">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-[10px] font-bold text-gray-600">매우혼잡</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-[10px] font-bold text-gray-600">혼잡</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-[10px] font-bold text-gray-600">보통</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-[10px] font-bold text-gray-600">여유</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {regions.map((region) => (
            <button
              key={region.name}
              onClick={() => onShowRegionDetail(region.name)}
              className="bg-gray-50 hover:bg-indigo-50 p-3 rounded-2xl border-2 border-transparent hover:border-indigo-100 transition-all text-center group"
            >
              <p className="text-[10px] font-bold text-gray-400 mb-1 group-hover:text-indigo-400">{region.name}</p>
              <p className="text-sm font-black text-gray-800" style={{ color: region.color }}>{region.level}</p>
            </button>
          ))}
        </div>
      </FadeInSection>
    </div>
  );
}
