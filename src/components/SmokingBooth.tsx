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

  const mapContainerRef1 = useRef<HTMLDivElement>(null);
  const mapContainerRef2 = useRef<HTMLDivElement>(null);
  const mapRef1 = useRef<any>(null);
  const mapRef2 = useRef<any>(null);
  const [nationalBooths] = useState<SmokingBoothType[]>(getNationalSmokingBooths());

  const cards: SmokingCard[] = [
    {
      id: "smoking-location",
      title: "내 주변 흡연부스 위치",
      description: "전국 300개 이상의 흡연부스 위치를 실시간으로 확인하세요. 가장 가까운 흡연부스를 빠르게 찾아 불필요한 이동 시간을 줄이고 더 쾌적한 환경을 경험하실 수 있습니다.",
      onClick: onShowMap,
    },
    {
      id: "crowd-monitoring",
      title: "실시간 혼잡도 모니터링",
      description: "전국 주요 지역의 실시간 유동인구 밀집도를 확인하고 최적의 방문 시간을 찾으세요. 데이터 기반 분석으로 혼잡한 장소를 회피하고 쾌적한 환경에서 더 나은 경험을 만들어보세요.",
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
          // 위치 권한 거부 시 서울 중심부로 설정
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
        const sortedBooths = [...nationalBooths].sort((a, b) => {
          const distA = Math.pow(a.latitude - userLocation.lat, 2) + Math.pow(a.longitude - userLocation.lng, 2);
          const distB = Math.pow(b.latitude - userLocation.lat, 2) + Math.pow(b.longitude - userLocation.lng, 2);
          return distA - distB;
        }).slice(0, 10);

        sortedBooths.forEach((booth) => {
          new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(booth.latitude, booth.longitude),
            map: map1,
          });
        });
      }

      // 카드 2: 혼잡도 모니터링 지도 (더 넓은 지역)
      if (mapContainerRef2.current && !mapRef2.current) {
        const options2 = {
          center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
          level: 8,
          draggable: false,
          zoomable: false,
          disableDoubleClickZoom: true,
          scrollwheel: false,
        };
        const map2 = new window.kakao.maps.Map(mapContainerRef2.current, options2);
        mapRef2.current = map2;

        // 서울 주요 지점 혼잡도 원 표시 (데모)
        const hotSpots = [
          { name: "강남", lat: 37.4979, lng: 127.0276, color: "#ef4444" },
          { name: "홍대", lat: 37.5572, lng: 126.9247, color: "#f97316" },
          { name: "잠실", lat: 37.5145, lng: 127.0595, color: "#eab308" },
        ];

        hotSpots.forEach((spot) => {
          new window.kakao.maps.Circle({
            center: new window.kakao.maps.LatLng(spot.lat, spot.lng),
            radius: 1000,
            strokeWeight: 0,
            fillColor: spot.color,
            fillOpacity: 0.4,
            map: map2,
          });
        });
      }
    };

    if (window.kakao && window.kakao.maps) {
      initializeMaps();
    }
  }, [userLocation, nationalBooths]);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            쾌적한 일상을 위한 <br />
            <span className="text-indigo-600">지능형 내비게이션</span>
          </h2>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            A* 알고리즘과 실시간 데이터를 활용하여 <br />
            당신의 발걸음을 더 자유롭게 만듭니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`relative bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border-2 transition-all duration-500 cursor-pointer group hover:scale-[1.02] ${hoveredCard === index ? "border-indigo-500 shadow-indigo-100" : "border-gray-50 shadow-gray-100"
                }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={card.onClick}
            >
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-8 overflow-hidden rounded-3xl border border-gray-100 shadow-inner bg-slate-50 relative h-64">
                  <div
                    ref={index === 0 ? mapContainerRef1 : mapContainerRef2}
                    className="w-full h-full grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-500 leading-relaxed font-medium mb-8 flex-1">
                  {card.description}
                </p>

                <div className="flex items-center text-indigo-600 font-bold group">
                  <span className="mr-2">서비스 이용하기</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-2 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
