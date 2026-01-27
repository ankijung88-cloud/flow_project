import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getNationalSmokingBooths } from "../services/smokingBoothService";
import type { SmokingBooth } from "../services/smokingBoothService";
import { FadeInSection } from "../components/MergeScrollAnimation";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function SmokingBoothDetailPage() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // 거리 계산 (Haversine 공식)
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nationalBooths] = useState<SmokingBooth[]>(getNationalSmokingBooths());
  const [selectedBooth, setSelectedBooth] = useState<(SmokingBooth & { distance: number }) | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 사용자 위치 가져오기
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

  // 가까운 흡연부스 계산
  const nearbyBooths = useMemo(() => {
    if (!userLocation) return [];

    return nationalBooths
      .map((booth) => ({
        ...booth,
        distance: getDistance(userLocation.lat, userLocation.lng, booth.latitude, booth.longitude),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);
  }, [userLocation, nationalBooths]);

  // 지도 초기화 및 마커 표시
  useEffect(() => {
    if (!userLocation) return;

    const initializeMap = () => {
      if (!mapContainerRef.current) return;

      const options = {
        center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
        level: 5,
      };
      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      mapRef.current = map;

      // 사용자 위치 마커 (커스텀 오버레이)
      const userContent = document.createElement("div");
      userContent.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-xl animate-pulse"></div>
          <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-sm text-[10px] font-bold whitespace-nowrap">현위치</div>
        </div>
      `;
      new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
        content: userContent,
        map: map,
        yAnchor: 1,
      });

      // 부스 마커 표시
      nearbyBooths.forEach((booth) => {
        const boothContent = document.createElement("div");
        boothContent.className = "cursor-pointer group";
        boothContent.innerHTML = `
          <div class="flex flex-col items-center">
            <div class="hidden group-hover:block bg-white px-2 py-1 rounded shadow-lg text-[10px] font-bold mb-1 border border-red-100 whitespace-nowrap">
              ${booth.name}
            </div>
            <div class="w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125"></div>
          </div>
        `;

        new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(booth.latitude, booth.longitude),
          content: boothContent,
          map: map,
          yAnchor: 1.2,
        });

        boothContent.onclick = () => {
          setSelectedBooth(booth);
          map.panTo(new window.kakao.maps.LatLng(booth.latitude, booth.longitude));
        };
      });
    };

    if (window.kakao && window.kakao.maps) {
      initializeMap();
    }
  }, [userLocation, nearbyBooths]);

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

  const formatDistance = (distance: number): string => {
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <FadeInSection>
        <header className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-red-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">내 주변 흡연시설</h1>
                <p className="text-sm font-medium text-red-600">가장 가까운 전용 시설을 안내해 드립니다</p>
              </div>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-red-100 shadow-sm">
              <span className="text-sm font-black text-gray-700">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            {nearbyBooths.map((booth) => (
              <div
                key={booth.id}
                onClick={() => {
                  setSelectedBooth(booth);
                  mapRef.current?.panTo(new window.kakao.maps.LatLng(booth.latitude, booth.longitude));
                }}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer hover:shadow-lg ${selectedBooth?.id === booth.id ? "bg-red-50 border-red-400 shadow-inner" : "bg-white border-gray-100"
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{booth.name}</h3>
                  <span className="text-xs font-black text-red-500">{formatDistance(booth.distance)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">{booth.address}</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-600">
                    전용 시설
                  </span>
                  {booth.distance < 500 && (
                    <span className="px-3 py-1 bg-green-100 rounded-full text-[10px] font-bold text-green-700">
                      도보권
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 relative">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-red-50 overflow-hidden relative group h-[600px]">
              <div ref={mapContainerRef} className="w-full h-full" />

              <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-4">
                <button
                  onClick={handleZoomIn}
                  className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all border-2 border-red-50 z-30 !p-0"
                >
                  <PlusIcon className="w-8 h-8 text-black" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all border-2 border-red-50 z-30 !p-0"
                >
                  <MinusIcon className="w-8 h-8 text-black" />
                </button>
              </div>

              {selectedBooth && (
                <div className="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border-2 border-red-100 w-80 animate-slideInRight">
                  <h3 className="text-xl font-black text-gray-900 mb-2">{selectedBooth.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{selectedBooth.address}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${Math.max(10, 100 - selectedBooth.distance / 10)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-black text-red-500">{formatDistance(selectedBooth.distance)}</span>
                  </div>
                  <button className="w-full bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                    길찾기 안내 시작
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
}
