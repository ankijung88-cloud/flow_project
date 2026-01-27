import { useState } from "react";

interface FeatureCardProps {
  image: string;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function FeatureCard({ image, title, description, onClick }: FeatureCardProps) {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // 오버레이가 표시되지 않은 상태에서만 오버레이 표시
    if (!showOverlay) {
      e.stopPropagation();
      setShowOverlay(true);
    }
  };

  const handleOverlayClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOverlay(false);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] cursor-pointer overflow-hidden group"
      style={{ borderRadius: "10px" }}
    >
      {/* 카드 컨테이너 */}
      <div
        className="relative w-full h-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
        style={{ borderRadius: "10px" }}
      >
        {/* 배경 이미지 */}
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* 그라데이션 오버레이 (타이틀 가독성용) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* 카드 하단 타이틀 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center drop-shadow-lg">
            {title}
          </h3>
          <p className="text-sm text-white/80 text-center mt-2">탭하여 자세히 보기</p>
        </div>

        {/* 오버레이 - 클릭 시 표시 */}
        <div
          onClick={handleOverlayClose}
          className={`absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 transition-all duration-300 z-20 ${
            showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="text-center max-w-xl">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8">
              {title}
            </h3>
            <p
              className="text-white leading-relaxed mb-8 sm:mb-10"
              style={{ fontSize: "16px" }}
            >
              {description}
            </p>

            <button
              onClick={handleMapClick}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-3 px-8 sm:py-4 sm:px-12 rounded-full text-base sm:text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 mb-6"
            >
              지도 보기
            </button>

            <div className="text-sm text-gray-400">
              화면을 탭하여 닫기
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
