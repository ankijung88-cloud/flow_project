import { useEffect, useRef } from "react";

export default function WalkCourseMap({
  course,
  onBack,
}: {
  course: any;
  onBack: () => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=03d04dc86a7d0b4c4da076a9690cf5c6&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapContainerRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(course.lat, course.lng),
            level: 3,
          };
          const map = new window.kakao.maps.Map(mapContainerRef.current, options);
          kakaoMapRef.current = map;

          // 줌 컨트롤 비활성화 (마우스 휠 확대/축소 금지)
          map.setZoomable(false);

          new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(course.lat, course.lng),
            map: map,
          });
        }
      });
    };
    document.head.appendChild(script);
  }, [course]);

  // 줌 컨트롤 핸들러
  const handleZoomIn = () => {
    if (kakaoMapRef.current) {
      kakaoMapRef.current.setLevel(kakaoMapRef.current.getLevel() - 1);
    }
  };

  const handleZoomOut = () => {
    if (kakaoMapRef.current) {
      kakaoMapRef.current.setLevel(kakaoMapRef.current.getLevel() + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[10000] flex flex-col items-center">
      <div className="w-full max-w-[1024px] p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{course.name} 지도</h2>
        <button onClick={onBack} className="text-gray-500 hover:text-black">
          닫기
        </button>
      </div>

      {/* 지도 컨테이너 */}
      <div className="relative rounded-2xl shadow-2xl border overflow-hidden" style={{ width: "1024px", height: "700px" }}>
        <div ref={mapContainerRef} className="w-full h-full" />

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

      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-4">{course.desc}</p>
        <button
          onClick={onBack}
          className="bg-blue-600 text-white px-12 py-3 rounded-full shadow-lg"
        >
          확인 완료
        </button>
      </div>
    </div>
  );
}
