import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// 1. 인터페이스에 부모(App.tsx)로부터 받는 함수 타입을 정의합니다.
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  };

  const menuItems = [
    { name: "홈", target: "section-hero" },
    { name: "흡연구역", target: "section-location" },
    { name: "혼잡도", target: "section-crowd" },
    { name: "산책로", target: "section-guide" },
    { name: "FAQ", target: "section-faq" },
  ];

  return (
    <>
      {/* 1. Scrolling Navbar Portion (Logo & Menu) */}
      <nav
        className={`absolute top-0 left-0 w-full transition-all duration-300 ${isScrolled ? "bg-black/20 backdrop-blur-md" : "bg-transparent"
          }`}
        style={{ zIndex: 99999 }}
      >
        <div className="relative">
          <div className="flex justify-between items-center px-8 py-6 w-full mx-auto relative">
            {/* Logo 및 서비스 명 - 클릭시 홈으로 이동 */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                if (location.pathname === "/") {
                  handleScrollToSection("section-hero");
                } else {
                  navigate("/");
                }
              }}
            >
              <div className="w-14 h-14 overflow-hidden rounded-full">
                <img
                  src={`${import.meta.env.BASE_URL}image/logo.png`}
                  alt="FLOW 로고"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-4xl text-white leading-none tracking-wide">
                FLOW
              </span>
            </div>

            {/* 데스크탑 메뉴 */}
            <ul className="hidden xl:flex items-center justify-center gap-[150px] absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap z-40">
              {menuItems.map((item) => (
                <li
                  key={item.name}
                  onClick={() => handleScrollToSection(item.target)}
                  className="cursor-pointer hover:text-primary transition font-bold text-2xl text-white"
                >
                  <span className="relative inline-block group transition-transform duration-300 hover:scale-[1.2] hover:z-50">
                    {item.name}
                    <span className="absolute left-0 bottom-0.5 w-full h-[3px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </span>
                </li>
              ))}
            </ul>

            {/* Right side placeholder to maintain spacing if needed */}
            <div className="w-12 h-12"></div>
          </div>

          {/* 메뉴 오버레이 (모바일용 + 데스크탑용) - Still inside nav to scroll with it or absolute position relative to it */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full right-0 w-full md:w-80 bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl z-[10000] rounded-[30px]"
              >
                <ul className="flex flex-col items-center py-8 gap-8">
                  {menuItems.map((item) => (
                    <motion.li
                      key={item.name}
                      whileHover={{ scale: 1.1, color: "#3B82F6" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleScrollToSection(item.target)}
                      className="text-2xl cursor-pointer font-bold text-gray-900 transition-colors drop-shadow-sm"
                    >
                      {item.name}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* 2. Permanent Fixed Buttons (Mode & Hamburger) */}
      <div className="fixed top-[45px] right-8 flex items-center z-[100000]">
        {/* Theme Toggle Button - Fixed and Spaced */}
        <button
          onClick={toggleTheme}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all backdrop-blur-md relative z-[99999] mr-[26px] ${theme === 'light'
            ? (isScrolled ? 'bg-black/5 text-indigo-950' : 'bg-white/10 text-white')
            : 'bg-white/10 text-white'
            }`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <span className="Sicon flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" fill="white" fillOpacity="0.2"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </span>
          ) : (
            <span className="Micon flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="white" fillOpacity="0.2"></path>
              </svg>
            </span>
          )}
        </button>

        {/* 햄버거 버튼 - Maximized Icon Size & Boldness */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all backdrop-blur-md relative z-[99999] group cursor-pointer ${theme === 'light'
            ? (isScrolled ? 'bg-black/5 text-indigo-950' : 'bg-white/10 text-white')
            : 'bg-white/10 text-white'
            }`}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9 drop-shadow-lg scale-[3.0]">
              <line x1="4" y1="4" x2="20" y2="20"></line>
              <line x1="4" y1="20" x2="20" y2="4"></line>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9 drop-shadow-lg scale-[3.0]">
              <line x1="2" y1="2" x2="22" y2="2"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="2" y1="22" x2="22" y2="22"></line>
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
