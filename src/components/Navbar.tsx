import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// 1. 인터페이스에 부모(App.tsx)로부터 받는 함수 타입을 정의합니다.
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);
  const [menuOpen, setMenuOpen] = useState(window.innerWidth >= 1280);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isHeroMode = isHome && !isScrolled;
  const useDropdown = !isHeroMode || isMobile;

  // Hero 모드에서 벗어나면 메뉴 닫기 (데스크탑)
  useEffect(() => {
    if (!isHeroMode && !isMobile) {
      setMenuOpen(false);
    } else if (isHeroMode && !isMobile) {
      setMenuOpen(true);
    }
  }, [isHeroMode, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1280;
      setIsMobile(mobile);
      if (mobile) {
        setMenuOpen(false);
      } else {
        // 리사이즈 시 Hero 모드면 열기, 아니면 닫기
        setMenuOpen(location.pathname === "/" && window.scrollY <= 50);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
                  src={`${import.meta.env.BASE_URL}image/logo.png?v=restore`}
                  alt="FLOW 로고"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-4xl text-white leading-none tracking-wide">
                FLOW
              </span>
            </div>

            {/* 데스크탑/모바일 통합 메뉴 - 조건부 레이아웃 및 애니메이션 */}
            <motion.ul
              initial={useDropdown ? "closed" : "open"}
              animate={menuOpen ? "open" : "closed"}
              variants={{
                open: {
                  opacity: 1,
                  scale: 1,
                  x: useDropdown ? 0 : "-50%", // 데스크탑 Hero 모드에서만 중앙 정렬
                  pointerEvents: "auto",
                  transition: { duration: 0.3 }
                },
                closed: {
                  opacity: useDropdown ? 0 : 1,
                  scale: useDropdown ? 0.95 : 1,
                  x: useDropdown ? 0 : "-50%",
                  pointerEvents: useDropdown ? "none" : "auto",
                  transition: { duration: 0.3 }
                }
              }}
              className={`
                ${useDropdown
                  ? "flex flex-col items-center py-6 gap-6 absolute top-[110px] right-8 w-64 bg-gray-900/90 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-[30px]"
                  : "flex items-center justify-center gap-[150px] absolute left-1/2 whitespace-nowrap"
                }
                z-40
              `}
            >
              {menuItems.map((item, index) => (
                <motion.li
                  key={item.name}
                  custom={index}
                  initial={useDropdown ? "closed" : "open"}
                  animate={menuOpen ? "open" : "closed"}
                  variants={{
                    open: (i: number) => ({
                      opacity: 1,
                      x: 0,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                      transition: {
                        type: "spring",
                        stiffness: 180,
                        damping: 24,
                        delay: i * 0.04
                      }
                    }),
                    closed: (i: number) => ({
                      opacity: 0,
                      // Dropdown 모드: 위쪽으로 사라짐 / Hero 모드: 중앙 버튼으로 모임
                      x: useDropdown ? 0 : 600 - (i - 2) * 150,
                      y: useDropdown ? -50 : 20,
                      scale: 0,
                      filter: "blur(12px)",
                      transition: {
                        duration: 0.3,
                        ease: [0.32, 0, 0.67, 0],
                        delay: (menuItems.length - 1 - i) * 0.03
                      }
                    }
                    )
                  }}
                  onClick={() => handleScrollToSection(item.target)}
                  className={`cursor-pointer transition font-bold text-2xl ${useDropdown ? "text-white" : "text-white"} hover:text-indigo-400 hover:scale-[1.1]`}
                >
                  <span className="relative inline-block group">
                    {item.name}
                    {!isMobile && (
                      <span className="absolute left-0 bottom-0.5 w-full h-[3px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    )}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Right side placeholder to maintain spacing if needed */}
            <div className="w-12 h-12"></div>
          </div>

          {/* 기존 드롭다운 메뉴 삭제됨 */}
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
