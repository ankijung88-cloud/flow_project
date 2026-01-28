export default function Footer() {
  return (
    <footer className="w-full bg-black/80 backdrop-blur-2xl border-t border-white/10 text-gray-300 flex items-center justify-center">
      <div className="w-full max-w-[1400px] mx-auto px-4 py-6 md:py-10 lg:py-12" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}>
        {/* TOP GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* LOGO & DESCRIPTION */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6">
                <img
                  src={`${import.meta.env.BASE_URL}image/logo.png`}
                  alt="AI Partner 로고"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-bold text-white">FLOW</span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              가족의 건강을 위한
              <br />
              AI 산책 파트너
            </p>
          </div>

          {/* SERVICE */}
          <div>
            <h4 className="text-white font-semibold mb-2 text-sm">서비스</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <a href="#" className="text-blue-500 hover:text-blue-400 transition">
                  서비스 소개
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-500 hover:text-blue-400 transition">
                  요금제
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-500 hover:text-blue-400 transition">
                  고객사례
                </a>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="text-white font-semibold mb-2 text-sm">고객지원</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <a href="#" className="text-blue-500 hover:text-blue-400 transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-500 hover:text-blue-400 transition">
                  이용가이드
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-500 hover:text-blue-400 transition">
                  문의하기
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-white font-semibold mb-2 text-sm">문의</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-2">
                <span className="text-pink-500">📞</span> 1588-0000
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">📧</span> support@flow.com
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-300">🕐</span> 평일 09:00 - 18:00
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2025 FLOW. All rights reserved.</p>

          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">
              이용약관
            </a>
            <a href="#" className="hover:text-white transition">
              개인정보처리방침
            </a>
            <a href="#" className="hover:text-white transition">
              사업자정보
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
