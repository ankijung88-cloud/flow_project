import { useState } from "react";

interface ServiceCardsProps {
  onShowSmokingMap: () => void;
  onShowCrowdMap: () => void;
}

export default function ServiceCards({ onShowSmokingMap, onShowCrowdMap }: ServiceCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const cards = [
    {
      id: "smoking-booth",
      smallTitle: "내 주변 흡연부스 위치",
      title: "흡연부스 위치 확인",
      description: "주변 흡연부스 위치를 빠르게 확인하여 불필요한 이동과 혼잡을 줄일 수 있습니다. 실시간으로 업데이트되는 위치 정보를 통해 가장 가까운 흡연부스를 찾아보세요.",
      previewImage: "/image/smokeArea.png",
      onClick: onShowSmokingMap,
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      buttonColor: "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
    },
    {
      id: "crowd-monitoring",
      smallTitle: "현지 혼잡도 현황",
      title: "혼잡도확인",
      description: "전국 주요 지역의 실시간 인구 밀집도를 확인하고 최적의 방문 시간을 선택하세요. 4단계 컬러 시스템으로 한눈에 혼잡도를 파악할 수 있습니다.",
      previewImage: "/image/crowdArea.png",
      onClick: onShowCrowdMap,
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      buttonColor: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
    }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            주요 서비스
          </h2>
          <p className="text-xl text-gray-600">
            쾌적한 도시 생활을 위한 스마트 솔루션
          </p>
        </div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative"
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`bg-gradient-to-br ${card.bgColor} rounded-3xl border-2 ${card.borderColor} shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                {/* 카드 상단 작은 제목 */}
                <div className="pt-8 px-8">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide text-center">
                    {card.smallTitle}
                  </p>
                </div>

                {/* 미리보기 이미지 카드 */}
                <div className="p-8">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 relative group">
                    <img
                      src={card.previewImage}
                      alt={card.title}
                      className="w-full h-64 object-cover"
                    />

                    {/* Map 버튼 - 이미지 위에 오버레이 */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        onClick={card.onClick}
                        className={`bg-gradient-to-r ${card.buttonColor} text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:scale-105`}
                      >
                        Map
                        <span className="text-xl">→</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 카드 하단 타이틀 및 설명 */}
                <div className="px-8 pb-8">
                  <h3 className="text-3xl font-black text-gray-900 mb-4 text-center">
                    {card.title}
                  </h3>

                  {/* 설명 - hover 시에만 표시 */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      hoveredCard === card.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-gray-600 text-base leading-relaxed text-center">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
