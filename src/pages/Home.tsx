import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SmokingMap from "../components/SmokingMap";
import CrowdMap from "../components/CrowdMap";
import WalkCourseList from "../components/WalkCourseList";
import WalkCourseMap from "../components/WalkCourseMap";
import Hero from "../components/Hero";
import SmokingBooth from "../components/SmokingBooth";
import Crowd from "../components/Crowd";
import GuideVd from "../components/GuidVd";
import Guide from "../components/Guide";
import Footer from "../components/footer";
import ScrollNavigator from "../components/ScrollNavigator";
import ScrollZoom from "../components/ScrollZoom";
import LocationService from "../components/LocationService";
import CongestionMonitoring from "../components/CongestionMonitoring";
import WalkRecommendation from "../components/WalkRecommendation";
import RegionDetail from "../components/RegionDetail";
import FocusScroll from "../components/FocusScroll";
import ServiceVideo from "../components/ServiceVideo";
import CrowdContent from "../components/CrowdContent";

interface Course {
  id: number;
  name: string;
  dist: string;
  lat: number;
  lng: number;
  desc: string;
  difficulty: "쉬움" | "보통" | "어려움";
  time: string;
  features: string[];
}

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const [showCrowdMap, setShowCrowdMap] = useState(false);
  const [showWalkList, setShowWalkList] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [crowdSearchKeyword, setCrowdSearchKeyword] = useState<string>("");
  const [showLocationService, setShowLocationService] = useState(false);
  const [showCongestionMonitoring, setShowCongestionMonitoring] = useState(false);
  const [showWalkRecommendation, setShowWalkRecommendation] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    // RegionDetail은 스크롤 가능하도록 overflow를 hidden으로 설정하지 않음
    if (showMap || showCrowdMap || showWalkList || selectedCourse || showLocationService || showCongestionMonitoring || showWalkRecommendation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showMap, showCrowdMap, showWalkList, selectedCourse, showLocationService, showCongestionMonitoring, showWalkRecommendation]);

  // 지도를 닫을 때 특정 섹션으로 복귀하는 핸들러
  const handleCloseSmokingMap = () => {
    setShowMap(false);
    setTimeout(() => {
      document
        .getElementById("section-smoking")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCloseCrowdMap = () => {
    setShowCrowdMap(false);
    setCrowdSearchKeyword(""); // 검색어 초기화
    setTimeout(() => {
      document
        .getElementById("section-crowd")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 조건부 렌더링: 지도가 열려있을 때
  if (selectedCourse)
    return (
      <WalkCourseMap
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );
  if (showWalkList)
    return (
      <WalkCourseList
        onBack={() => setShowWalkList(false)}
        onSelect={(course) => setSelectedCourse(course)}
      />
    );
  if (showMap) return <SmokingMap onBack={handleCloseSmokingMap} />;
  if (showCrowdMap) return <CrowdMap onBack={handleCloseCrowdMap} initialKeyword={crowdSearchKeyword} />;
  if (showLocationService) return <LocationService onBack={() => setShowLocationService(false)} />;
  if (showCongestionMonitoring) return <CongestionMonitoring onBack={() => setShowCongestionMonitoring(false)} />;
  if (showWalkRecommendation) return <WalkRecommendation onBack={() => setShowWalkRecommendation(false)} onShowWalkList={() => setShowWalkList(true)} />;
  if (selectedRegion) return <RegionDetail region={selectedRegion} onBack={() => setSelectedRegion(null)} />;

  return (
    <div className="relative w-full min-h-screen bg-white overflow-x-hidden">
      <main className="w-full">
        {/* Navbar 연동 */}
        <Navbar />

        {/* Hero 섹션 - 영상 사이즈에 맞춰 고정 (내부에서 휠 인터랙션 처리) */}
        <section id="section-hero" style={{ scrollSnapAlign: "start" }} className="relative w-full h-screen">
          <Hero />
        </section>

        {/* Spacer for 20px gap */}
        <div className="w-full h-[20px]" />
        <div className="w-full h-[20px]" />

        {/* GuideVd 섹션 - 흡연부스 회피 네비게이션 (여기서 Snap을 걸어 히어로 종료 후 정착 지원) */}
        <section id="section-guidevd" style={{ scrollSnapAlign: "start" }} className="relative w-full px-4 page-section">
          <GuideVd />
        </section>

        {/* Spacer for 20px gap */}
        <div className="w-full h-[20px]" />
        <div className="w-full h-[20px]" />

        {/* ServiceVideo 섹션 - 서비스 소개 영상 */}
        <section id="section-servicevideo" className="relative w-full px-4 page-section">
          <ServiceVideo />
        </section>

        {/* Spacer for 20px gap */}
        <div className="w-full h-[20px]" />
        <div className="w-full h-[20px]" />

        {/* SmokingBooth 섹션 */}
        <section id="section-smoking" className="relative w-full px-4 page-section">
          <SmokingBooth onShowMap={() => setShowMap(true)} onShowCrowdMap={() => setShowCrowdMap(true)} />
        </section>

        {/* Spacer for 20px gap */}
        <div className="w-full h-[20px]" />
        <div className="w-full h-[20px]" />

        {/* Crowd 섹션 */}
        <section id="section-crowd" className="relative w-full px-4 page-section">
          <Crowd onBack={() => { }} onShowRegionDetail={(region) => setSelectedRegion(region)} />
        </section>

        {/* Spacer for 20px gap */}
        <div className="w-full h-[20px]" />
        <div className="w-full h-[20px]" />

        {/* New Crowd Sibling Section */}
        <section className="relative w-full px-4 page-section">
          <CrowdContent />
        </section>

        {/* Spacer for 20px gap */}
        <div className="w-full h-[20px]" />
        <div className="w-full h-[20px]" />

        {/* Guide 섹션 */}
        <section id="section-guide" className="relative w-full page-section">
          <Guide
            onWalkClick={() => setShowWalkList(true)}
            onLocationServiceClick={() => setShowLocationService(true)}
            onCongestionMonitoringClick={() => setShowCongestionMonitoring(true)}
            onWalkRecommendationClick={() => setShowWalkRecommendation(true)}
            onRegionClick={(region) => setSelectedRegion(region)}
          />
        </section>

        {/* Spacer for 20px gap */}
        <div className="w-full h-[20px]" />
        <div className="w-full h-[20px]" />

        {/* FAQ 섹션 */}
        <section id="section-faq" className="relative w-full px-4 page-section">
          <div className="w-full max-w-4xl mx-auto pt-[32px] pb-[51px] mb-32">
            <h2 className="text-4xl md:text-5xl font-black text-center relative -top-[50px] mb-[128px] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              자주 묻는 질문 (FAQ)
            </h2>
            <div className="space-y-[30px]">
              {[
                {
                  q: "Flow 서비스는 무엇인가요?",
                  a: "Flow는 실시간 보행 혼잡도와 흡연 부스 위치 정보를 결합하여, 사용자에게 가장 쾌적하고 건강한 이동 경로를 제안하는 스마트 어반 가이드 서비스입니다."
                },
                {
                  q: "데이터의 실시간성은 보장되나요?",
                  a: "네, 전국 주요 요충지의 유동인구 데이터를 1분 단위로 실시간 수집 및 분석하여 매우 정밀한 혼잡도 정보를 제공합니다."
                },
                {
                  q: "흡연 부스 회피 경로는 어떤 원리인가요?",
                  a: "사용자의 현재 위치와 목적지 사이에 위치한 모든 흡연 시설의 영향 반경을 계산하여, 담배 연기 노출을 최소화할 수 있는 최적의 우회 경로를 실시간으로 길안내합니다."
                },
                {
                  q: "별도의 앱 설치가 필요한가요?",
                  a: "Flow는 웹 기반 반응형 서비스로 제공되어, 앱 설치 없이 브라우저에서 바로 모든 기능을 이용할 수 있습니다."
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-md hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex gap-3">
                    <span className="text-blue-600 font-black">Q.</span>
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium pl-8">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer 섹션 */}
        <section id="section-footer" className="relative w-full page-section">
          <Footer />
        </section>

        <ScrollNavigator />
        <ScrollZoom />
        <FocusScroll />
      </main>
    </div>
  );
}
