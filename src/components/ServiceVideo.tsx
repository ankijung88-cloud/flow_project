export default function ServiceVideo() {
  return (
    <section className="w-full bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20 md:py-32 lg:py-40 4xl:py-56 5xl:py-72 flex items-center justify-center">
      <div className="w-full max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col items-center mb-16 gap-5 4xl:gap-10 5xl:gap-16 text-center">
          <h2 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl 3xl:text-7xl 4xl:text-8xl 5xl:text-9xl font-bold text-gray-900">
            서비스 소개
          </h2>
          <p className="text-base xs:text-lg md:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl text-gray-600 max-w-3xl 3xl:max-w-4xl 4xl:max-w-6xl 5xl:max-w-7xl text-center">
            흡연부스를 회피하는 안전한 경로를 제공하는 혁신적인 네비게이션 서비스입니다.
          </p>
        </div>

        {/* Layout synchronized with CrowdContent */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 lg:gap-20">

          {/* Video Section (65%) - Matches CrowdContent video size */}
          <div className="lg:w-[65%] w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-200 bg-black aspect-[1900/1060]">
              <video className="w-full h-full object-cover" controls playsInline>
                <source src="/video/guideVD.mp4" type="video/mp4" />
                브라우저가 비디오 태그를 지원하지 않습니다.
              </video>
            </div>
          </div>

          {/* Features Section (35%) */}
          <div className="lg:w-[35%] w-full space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">주요 기능</h3>

            {/* Feature 1 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                <span className="font-bold text-xl">✓</span>
              </div>
              <div className="text-left">
                <h4 className="text-lg font-bold text-gray-900 mb-2">실시간 GPS 위치 추적</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  정확한 현재 위치를 기반으로 실시간 최적 경로를 제공합니다.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                <span className="font-bold text-xl">✓</span>
              </div>
              <div className="text-left">
                <h4 className="text-lg font-bold text-gray-900 mb-2">흡연부스 회피 경로</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  스마트 알고리즘이 쾌적하고 안전한 이동 경로를 생성합니다.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                <span className="font-bold text-xl">✓</span>
              </div>
              <div className="text-left">
                <h4 className="text-lg font-bold text-gray-900 mb-2">시각적 방향 안내</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  직관적인 인터페이스로 누구나 쉽게 길을 찾을 수 있습니다.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
