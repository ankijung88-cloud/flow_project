import { useState, useEffect, useRef, useMemo } from "react";
import { getNationalSmokingBooths } from "../services/smokingBoothService";
import type { SmokingBooth } from "../services/smokingBoothService";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";

declare global {
  interface Window {
    kakao: any;
  }
}

interface LocationServiceProps {
  onBack: () => void;
}

export default function LocationService({ onBack }: LocationServiceProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [nationalBooths] = useState<SmokingBooth[]>(getNationalSmokingBooths());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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
          // 위치 권한 거부 시 서울 중심부로 설정
          setUserLocation({ lat: 37.5665, lng: 126.978 });
        }
      );
    } else {
      setUserLocation({ lat: 37.5665, lng: 126.978 });
    }
  }, []);

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

  // 가장 가까운 흡연부스 찾기
  const nearestBooths = useMemo(() => {
    if (!userLocation) return [];

    return nationalBooths
      .map((booth) => ({
        ...booth,
        distance: getDistance(
          userLocation.lat,
          userLocation.lng,
          booth.latitude,
          booth.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }, [userLocation, nationalBooths]);

  // 지도 초기화
  useEffect(() => {
    if (!userLocation) return;

    const initializeMap = () => {
      if (!mapContainerRef.current) return;

      const options = {
        center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
        level: 4,
      };
      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      mapRef.current = map;

      // 사용자 위치 오버레이
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

      // 가까운 부스 표시
      nearestBooths.forEach((booth) => {
        const boothContent = document.createElement("div");
        boothContent.innerHTML = `
            <div class="flex flex-col items-center">
              <div class="bg-red-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
              <div class="bg-white px-2 py-1 rounded shadow-sm text-[8px] font-bold mt-1 border border-red-100 whitespace-nowrap">${booth.name}</div>
            </div>
          `;
        new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(booth.latitude, booth.longitude),
          content: boothContent,
          map: map,
          yAnchor: 1.2,
        });
      });
    };

    if (window.kakao && window.kakao.maps) {
      initializeMap();
    }
  }, [userLocation, nearestBooths]);

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
    <div className="flex flex-col w-full h-full bg-slate-50 relative overflow-hidden">
      <div
        ref={mapContainerRef}
        className="flex-1 w-full min-h-[400px]"
      />

      {/* Custom Zoom Controls (Bottom Left) */}
      <div className="absolute bottom-24 left-6 z-20 flex flex-col gap-3">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-100 z-30 !p-0"
        >
          <PlusIcon className="w-6 h-6 text-black" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-100 z-30 !p-0"
        >
          <MinusIcon className="w-6 h-6 text-black" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-20 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900 leading-none">
            주변 대피 시설 <span className="text-red-500 ml-1">{nearestBooths.length}</span>
          </h2>
          <button
            onClick={onBack}
            className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
          >
            닫기
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {nearestBooths.map((booth) => (
            <div
              key={booth.id}
              className="min-w-[200px] bg-slate-50 p-4 rounded-2xl border border-gray-100 hover:bg-red-50 hover:border-red-100 transition-all cursor-pointer group"
            >
              <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                {booth.name}
              </h3>
              <p className="text-[10px] text-gray-400 mb-2 truncate">{booth.address}</p>
              <p className="text-xs font-black text-red-500">
                약 {Math.round(booth.distance)}m
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
