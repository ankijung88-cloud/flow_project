import { useState, useEffect, useRef } from "react";
import { getNationalSmokingBooths } from "../services/smokingBoothService";
import type { SmokingBooth } from "../services/smokingBoothService";

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
  const [nearestBooths, setNearestBooths] = useState<(SmokingBooth & { distance: number })[]>([]);

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
          // 위치 권한 거부 시 서울 중심으로 설정
          setUserLocation({ lat: 37.5665, lng: 126.978 });
        }
      );
    } else {
      setUserLocation({ lat: 37.5665, lng: 126.978 });
    }
  }, []);

  // 거리 계산 (Haversine formula)
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth radius in meters
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
  useEffect(() => {
    if (!userLocation) return;

    const boothsWithDistance = nationalBooths
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
      .slice(0, 10);

    setNearestBooths(boothsWithDistance);
  }, [userLocation, nationalBooths]);

  // 지도 초기화
  useEffect(() => {
    if (!userLocation) return;

    const initializeMap = () => {
      window.kakao.maps.load(() => {
        if (mapContainerRef.current && !mapRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
            level: 8,
          };
          const map = new window.kakao.maps.Map(mapContainerRef.current, options);
          mapRef.current = map;

          // 줌 컨트롤 비활성화 (마우스 휠 확대/축소 금지)
          map.setZoomable(false);

          // 사용자 위치 마커
          const userMarkerImage = new window.kakao.maps.MarkerImage(
            "/image/user-marker.svg",
            new window.kakao.maps.Size(32, 32)
          );
          new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
            map: map,
            image: userMarkerImage,
          });

          // 전국 흡연부스 마커 (가까운 50개)
          const sortedBooths = nationalBooths
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
            .slice(0, 50);

          sortedBooths.forEach((booth) => {
            const markerContent = document.createElement('div');
            markerContent.style.cssText = 'position: relative; width: 32px; height: 32px;';
            markerContent.innerHTML = `
              <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                <div class="smoke-marker-ripple"></div>
                <div class="smoke-marker-ripple"></div>
                <div class="smoke-marker-ripple"></div>
                <div class="smoke-marker-ripple"></div>
                <img src="/image/smoke_icon.png" alt="흡연부스" style="width: 28px; height: 28px; position: relative; z-index: 10; mix-blend-mode: multiply; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); background: transparent;" />
              </div>
            `;

            const customOverlay = new window.kakao.maps.CustomOverlay({
              position: new window.kakao.maps.LatLng(booth.latitude, booth.longitude),
              content: markerContent,
              yAnchor: 0.5,
            });
            customOverlay.setMap(map);
          });
        }
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
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=03d04dc86a7d0b4c4da076a9690cf5c6&autoload=false&libraries=services`;
        script.async = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      }
    }
  }, [userLocation, nationalBooths]);

  // 지역별 흡연부스 통계
  const getRegionalStats = () => {
    const regions: { [key: string]: number } = {};

    nationalBooths.forEach((booth) => {
      const region = booth.address.split(" ")[0]; // 시/도 단위
      regions[region] = (regions[region] || 0) + 1;
    });

    return Object.entries(regions)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const regionalStats = getRegionalStats();

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
    <div className="flex flex-col items-center justify-start w-screen min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 sm:p-6 md:p-8">
      {/* 헤더 */}
      <div className="w-full w-full mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4">
            🗺️ 위치 서비스
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            전국 300개 이상의 흡연부스 위치를 실시간으로 확인하고 가장 가까운 곳을 찾아보세요
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="w-full w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-2xl shadow-xl">
            <p className="text-sm font-semibold mb-2">전국 흡연부스</p>
            <p className="text-4xl font-black">{nationalBooths.length}개</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-2xl shadow-xl">
            <p className="text-sm font-semibold mb-2">서비스 지역</p>
            <p className="text-4xl font-black">{regionalStats.length}곳</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-2xl shadow-xl">
            <p className="text-sm font-semibold mb-2">가장 가까운 부스</p>
            <p className="text-4xl font-black">
              {nearestBooths.length > 0 ? `${(nearestBooths[0].distance / 1000).toFixed(1)}km` : "-"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-2xl shadow-xl">
            <p className="text-sm font-semibold mb-2">평균 거리</p>
            <p className="text-4xl font-black">
              {nearestBooths.length > 0
                ? `${(nearestBooths.slice(0, 5).reduce((sum, b) => sum + b.distance, 0) / 5 / 1000).toFixed(1)}km`
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* 지도 + 가까운 흡연부스 목록 */}
      <div className="w-full w-full mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 지도 */}
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-200 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">실시간 지도</h3>
            <div className="relative group">
              <div
                ref={mapContainerRef}
                className="w-full h-[400px] rounded-lg shadow-lg"
                style={{ border: "2px solid #dbeafe" }}
              />

              {/* Custom Zoom Controls (Bottom Left) */}
              <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-[30px]">
                <button
                  onClick={handleZoomIn}
                  className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 overflow-hidden"
                  title="확대"
                >
                  <img src="/image/zoom-plus.jpg" alt="확대" className="w-full h-full object-contain" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 overflow-hidden"
                  title="축소"
                >
                  <img src="/image/zoom-minus.png" alt="축소" className="w-full h-full object-contain" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * 파란색 마커는 흡연부스 위치입니다. 지도를 드래그하거나 확대/축소하여 자세히 확인하세요.
            </p>
          </div>

          {/* 가까운 흡연부스 Top 10 */}
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">가까운 흡연부스 Top 10</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {nearestBooths.map((booth, index) => (
                <div
                  key={booth.id}
                  className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-gray-400">#{index + 1}</span>
                      <span className="text-sm font-bold text-gray-900">{booth.name}</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      {(booth.distance / 1000).toFixed(2)}km
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{booth.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 지역별 흡연부스 통계 */}
      <div className="w-full w-full mb-8">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">지역별 흡연부스 분포</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {regionalStats.map((region, index) => (
              <div
                key={region.name}
                className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200 text-center hover:shadow-lg transition-all"
              >
                <p className="text-xs font-semibold text-gray-600 mb-1">#{index + 1}</p>
                <p className="text-lg font-black text-gray-900 mb-2">{region.name}</p>
                <p className="text-3xl font-black text-purple-600">{region.count}</p>
                <p className="text-xs text-gray-500 mt-1">개소</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-10 py-3 rounded-full font-bold text-lg hover:from-gray-900 hover:to-black transition-all shadow-xl hover:shadow-2xl hover:scale-105"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
