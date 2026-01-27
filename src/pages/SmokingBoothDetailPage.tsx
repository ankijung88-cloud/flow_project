import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getNationalSmokingBooths } from "../services/smokingBoothService";
import type { SmokingBooth } from "../services/smokingBoothService";
import { MergeSection, MergeCardGrid, FadeInSection } from "../components/MergeScrollAnimation";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function SmokingBoothDetailPage() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // Haversine formula
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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1초마다 현재 시각 업데이트
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
          setTimeout(() => setUserLocation({ lat: 37.5665, lng: 126.978 }), 0);
        }
      );
    } else {
      setTimeout(() => setUserLocation({ lat: 37.5665, lng: 126.978 }), 0);
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
      .sort((a, b) => a.distance - b.distance);
  }, [userLocation, nationalBooths]);

  // 지도 초기화
  useEffect(() => {
    if (!userLocation) return;

    const initializeMap = () => {
      window.kakao.maps.load(() => {
        if (mapContainerRef.current && !mapRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
            level: 5,
            zoomable: false, // 마우스 휠 확대/축소 금지
          };
          const map = new window.kakao.maps.Map(mapContainerRef.current, options);
          mapRef.current = map;

          // 사용자 위치 마커
          const userMarkerImage = new window.kakao.maps.MarkerImage(
            `${import.meta.env.BASE_URL}image/user-marker.svg`,
            new window.kakao.maps.Size(40, 40)
          );
          new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
            map: map,
            image: userMarkerImage,
            title: "내 위치",
          });

          // 흡연부스 마커
          nearbyBooths.forEach((booth: SmokingBooth & { distance: number }) => {
            const markerContent = document.createElement('div');
            markerContent.style.cssText = 'position: relative; width: 36px; height: 36px; cursor: pointer;';
            markerContent.innerHTML = `
              <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                <div class="smoke-marker-ripple"></div>
                <div class="smoke-marker-ripple"></div>
                <div class="smoke-marker-ripple"></div>
                <img src="${import.meta.env.BASE_URL}image/smoke_icon.png" alt="흡연부스" style="width: 32px; height: 32px; position: relative; z-index: 10; mix-blend-mode: multiply; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" />
              </div>
            `;

            const customOverlay = new window.kakao.maps.CustomOverlay({
              position: new window.kakao.maps.LatLng(booth.latitude, booth.longitude),
              content: markerContent,
              yAnchor: 0.5,
            });
            customOverlay.setMap(map);

            markerContent.addEventListener('click', () => {
              setSelectedBooth(booth);
              map.setCenter(new window.kakao.maps.LatLng(booth.latitude, booth.longitude));
            });
          });
        }
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
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
        script.async = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", initializeMap);
      }
    }
  }, [userLocation, nearbyBooths]);


  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
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

  const getCurrentTimeString = () => {
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  };

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim() || !mapRef.current) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const result = data[0];
        const lat = parseFloat(result.y);
        const lng = parseFloat(result.x);
        mapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
        mapRef.current.setLevel(5);
      }
    });
  };

  // 통계 계산
  const stats = {
    within500m: nearbyBooths.filter(b => b.distance <= 500).length,
    within1km: nearbyBooths.filter(b => b.distance <= 1000).length,
    within2km: nearbyBooths.filter(b => b.distance <= 2000).length,
    total: nationalBooths.length,
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-x-hidden">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-black text-gray-900">흡연부스 위치 안내</h1>
                <p className="text-sm text-gray-500">전국 흡연부스 위치 및 피해 경로 안내</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full">
                <span className="text-sm font-bold text-green-700">{getCurrentTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* 실시간 표시 (모바일) */}
        <FadeInSection className="md:hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-2xl text-center">
            <p className="text-sm opacity-90">실시간 기준</p>
            <p className="text-2xl font-black">{getCurrentTimeString()}</p>
          </div>
        </FadeInSection>

        {/* 통계 카드 - Merge 애니메이션 적용 */}
        <MergeCardGrid columns={4} className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <p className="text-sm text-gray-500 mb-1">반경 500m</p>
            <p className="text-4xl font-black text-green-600">{stats.within500m}</p>
            <p className="text-xs text-gray-400">개의 흡연부스</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
            <p className="text-sm text-gray-500 mb-1">반경 1km</p>
            <p className="text-4xl font-black text-emerald-600">{stats.within1km}</p>
            <p className="text-xs text-gray-400">개의 흡연부스</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-teal-200">
            <p className="text-sm text-gray-500 mb-1">반경 2km</p>
            <p className="text-4xl font-black text-teal-600">{stats.within2km}</p>
            <p className="text-xs text-gray-400">개의 흡연부스</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <p className="text-sm text-gray-500 mb-1">전국 총</p>
            <p className="text-4xl font-black text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-400">개의 흡연부스</p>
          </div>
        </MergeCardGrid>

        {/* 검색바 */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="목적지를 검색하세요 (예: 강남역, 서울역)"
              className="flex-1 px-6 py-4 rounded-full border-2 border-green-200 focus:border-green-500 focus:outline-none text-lg shadow-md"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              검색
            </button>
          </form>
        </div>
        {/* 메인 컨텐츠 - Merge 애니메이션 적용 */}
        <MergeSection
          className="mb-8"
          gap="gap-8"
          leftContent={
            <div className="space-y-8">
              {/* 지도 */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-green-100 relative group">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <h2 className="text-white font-bold text-xl">실시간 흡연부스 지도</h2>
                  <p className="text-green-100 text-sm">내 위치 기준 주변 흡연부스가 표시됩니다</p>
                </div>
                <div ref={mapContainerRef} className="w-full h-[500px]" />

                {/* 거리별 흡연구역 수량 박스 (Top Left Overlay) */}
                <div className="absolute top-[80px] left-4 z-50 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border-2 border-green-100 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📊</span>
                    <h4 className="text-sm font-bold text-gray-900 text-left">주변 흡연구역</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="text-[10px] font-bold text-green-700">반경 500m</span>
                      <span className="text-sm font-black text-green-900">{stats.within500m}개</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                      <span className="text-[10px] font-bold text-emerald-700">반경 1km</span>
                      <span className="text-sm font-black text-emerald-900">{stats.within1km}개</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-teal-50 rounded-lg">
                      <span className="text-[10px] font-bold text-teal-700">반경 2km</span>
                      <span className="text-sm font-black text-teal-900">{stats.within2km}개</span>
                    </div>
                  </div>
                </div>

                {/* Custom Zoom Controls (Bottom Left) */}
                <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
                  <button
                    onClick={handleZoomIn}
                    className="relative w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 z-30 !p-0 overflow-hidden"
                    title="확대"
                  >
                    <img src={`${import.meta.env.BASE_URL}image/zoom-in.png`} alt="확대" className="w-full h-full object-contain p-2" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="relative w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 z-30 !p-0 overflow-hidden"
                    title="축소"
                  >
                    <img src={`${import.meta.env.BASE_URL}image/zoom-out.png`} alt="축소" className="w-full h-full object-contain p-2" />
                  </button>
                </div>
              </div>

              {/* 피해 경로 안내 */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                  <span className="text-3xl">🚶</span>
                  흡연부스 피해 경로 안내
                </h3>
                <p className="text-lg opacity-90 mb-6">
                  흡연 구역을 피해서 이동하고 싶으신가요? 아래 기능을 활용해보세요.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                    <h4 className="font-bold text-lg mb-2">실시간 위치 확인</h4>
                    <p className="text-sm opacity-90">
                      현재 위치 기준으로 주변 흡연부스 위치를 확인하고, 해당 지역을 피해 이동할 수 있습니다.
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                    <h4 className="font-bold text-lg mb-2">목적지 검색</h4>
                    <p className="text-sm opacity-90">
                      목적지를 검색하면 해당 지역 주변의 흡연부스 위치를 미리 파악할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          }
          rightContent={
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-green-100 sticky top-24">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h2 className="text-white font-bold text-xl">내 주변 흡연부스</h2>
                <p className="text-green-100 text-sm">거리순으로 정렬됩니다</p>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {nearbyBooths.map((booth, index) => (
                  <div
                    key={booth.id}
                    onClick={() => {
                      setSelectedBooth(booth);
                      if (mapRef.current) {
                        mapRef.current.setCenter(new window.kakao.maps.LatLng(booth.latitude, booth.longitude));
                        mapRef.current.setLevel(4);
                      }
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-green-50 ${selectedBooth?.id === booth.id ? "bg-green-100" : ""
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{booth.name}</h4>
                        <p className="text-sm text-gray-500">{booth.address}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-black ${booth.distance <= 500 ? "text-green-600" :
                          booth.distance <= 1000 ? "text-yellow-600" :
                            "text-orange-600"
                          }`}>
                          {formatDistance(booth.distance)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        {/* 선택된 흡연부스 상세 정보 */}
        {selectedBooth && (
          <div className="mt-8 bg-white rounded-3xl shadow-2xl p-8 border-2 border-green-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-3xl font-black text-gray-900">{selectedBooth.name}</h3>
                <p className="text-lg text-gray-500">{selectedBooth.address}</p>
              </div>
              <button
                onClick={() => setSelectedBooth(null)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <span className="text-2xl text-gray-500">×</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                <p className="text-sm text-gray-500 mb-2">거리</p>
                <p className="text-4xl font-black text-green-600">{formatDistance(selectedBooth.distance)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
                <p className="text-sm text-gray-500 mb-2">지역</p>
                <p className="text-4xl font-black text-blue-600">{selectedBooth.city}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                <p className="text-sm text-gray-500 mb-2">도보 예상 시간</p>
                <p className="text-4xl font-black text-purple-600">
                  {Math.ceil(selectedBooth.distance / 80)}분
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 이용 안내 */}
        <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 text-white">
          <h3 className="text-2xl font-black mb-6">서비스 이용 안내</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-4">📍</div>
              <h4 className="font-bold text-lg mb-2">위치 기반 서비스</h4>
              <p className="text-sm opacity-80">
                현재 위치를 기반으로 가장 가까운 흡연부스를 자동으로 찾아드립니다.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-4">🗺️</div>
              <h4 className="font-bold text-lg mb-2">전국 커버리지</h4>
              <p className="text-sm opacity-80">
                전국 {stats.total}개 이상의 흡연부스 위치 정보를 제공합니다.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-4">⏱️</div>
              <h4 className="font-bold text-lg mb-2">실시간 업데이트</h4>
              <p className="text-sm opacity-80">
                위치 정보는 실시간으로 업데이트되어 정확한 정보를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2024 Flow - 흡연부스 위치 안내 서비스</p>
        </div>
      </footer>
    </div>
  );
}
