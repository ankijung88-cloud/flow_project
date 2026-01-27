import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

// 1. 인터페이스에 부모(App.tsx)로부터 받는 함수 타입을 정의합니다.
interface NavbarProps {
  onWalkClick: () => void;
  onShowSmokingMap: () => void; // 이 부분을 추가하여 에러를 해결합니다.
  onShowCrowdMap: () => void; // 이 부분도 함께 추가합니다.
}

export default function Navbar({ onWalkClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 섹션 이동 함수: 모든 메뉴 클릭 시 해당 ID를 가진 섹션으로 이동합니다.
  const handleScrollToSection = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      // 2. 부드러운 스크롤 이동을 지원하는 내장 함수입니다.
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  };

  const menuItems = [
    { name: "홈", target: "section-hero" },
    { name: "흡연구역", target: "section-smoking" },
    { name: "혼잡도", target: "section-crowd" },
    { name: "산책로", target: "section-guide" },
    { name: "FAQ", target: "section-faq" },
  ];

  return (
    <nav className="absolute top-0 left-0 w-full" style={{ zIndex: 1000 }}>
      <div className="bg-transparent">
        <div className="flex justify-between items-center px-4 py-2 w-full mx-auto relative">
          {/* Logo 및 서비스 명 - 클릭시 홈으로 이동 */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (location.pathname === "/") {
                handleScrollToSection("section-hero");
              } else {
                navigate("/");
              }
            }}
          >
            <div className="w-8 h-8 overflow-hidden rounded-full">
              <img
                src="/image/logo.png"
                alt="FLOW 로고"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-2xl text-white leading-none">
              FLOW
            </span>
          </div>

          {/* 데스크탑 메뉴 */}
          <ul className="hidden md:flex items-center justify-center gap-[200px] absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            {menuItems.map((item) => (
              <li
                key={item.name}
                onClick={() => handleScrollToSection(item.target)}
                className="cursor-pointer hover:text-primary transition font-bold text-lg text-white"
              >
                <span className="relative inline-block group transition-transform duration-300 hover:scale-[2] hover:z-50">
                  {item.name}
                  <span className="absolute left-0 bottom-0.5 w-full h-[2px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </span>
              </li>
            ))}
          </ul>

          {/* 햄버거 버튼 (모바일 & 데스크탑 모두 표시) */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {menuOpen ? (
              <XMarkIcon className="w-8 h-8 text-white" />
            ) : (
              <Bars3Icon className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* 메뉴 오버레이 (모바일용 + 데스크탑용) */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-full right-0 w-full md:w-80 bg-white border-b border-l border-gray-200 shadow-xl z-50 rounded-bl-2xl"
            >
              <ul className="flex flex-col items-center py-6 gap-6">
                {menuItems.map((item) => (
                  <motion.li
                    key={item.name}
                    whileHover={{ scale: 1.1, color: "#2563EB" }} // Primary Blue
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleScrollToSection(item.target)}
                    className="text-xl cursor-pointer font-bold text-gray-800 transition-colors"
                  >
                    {item.name}
                  </motion.li>
                ))}
                {/* 추가 메뉴가 필요하면 여기에 배치 */}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
