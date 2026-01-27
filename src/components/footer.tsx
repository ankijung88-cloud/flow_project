export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto px-4 py-20 md:py-32 lg:py-40" style={{ paddingBottom: "max(80px, env(safe-area-inset-bottom))" }}>
        {/* TOP GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* LOGO & DESCRIPTION */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8">
                <img
                  src={`${import.meta.env.BASE_URL}image/logo.png`}
                  alt="AI Partner 로고"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">FLOW</span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              가족의 건강을 위한
              <br />
              AI 산책 파트너
            </p>
          </div>

          {/* SERVICE */}
          <div>
            <h4 className="text-white font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
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
            <h4 className="text-white font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm">
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
            <h4 className="text-white font-semibold mb-4">문의</h4>
            <ul className="space-y-2 text-sm">
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
        <div className="mt-5 pt-5 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
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
