import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Hero() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0); // 0: Video only, 1: Text revealed
  const lastScrollTime = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 500) return; // Debounce

      if (step === 0 && e.deltaY > 0) {
        // First scroll down: reveal text
        e.preventDefault();
        setStep(1);
        lastScrollTime.current = now;
      } else if (step === 1 && e.deltaY < 0) {
        // Scroll up: hide text
        e.preventDefault();
        setStep(0);
        lastScrollTime.current = now;
      }
      // If step === 1 and deltaY > 0, we don't preventDefault, so it scrolls to next section
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [step]);

  useEffect(() => {
    if (videoRef.current) {
      if (step === 1) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => { });
      }
    }
  }, [step]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={`${import.meta.env.BASE_URL}video/test.mp4`}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Global Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Content Layer */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center w-full px-4 md:px-8 max-w-[90%] 3xl:max-w-[1600px] 4xl:max-w-[2200px] 5xl:max-w-[3200px] text-center text-white gap-5 4xl:gap-8 5xl:gap-12 pointer-events-auto"
            >
              <h1 className="text-4xl xs:text-5xl md:text-7xl 3xl:text-8xl 4xl:text-9xl 5xl:text-[10rem] font-bold leading-tight">
                Flow
              </h1>
              <p className="text-base xs:text-lg md:text-2xl 3xl:text-3xl 4xl:text-4xl 5xl:text-5xl max-w-3xl 3xl:max-w-4xl 4xl:max-w-6xl 5xl:max-w-[80rem] text-center font-medium opacity-90">
                흡연부스 회피 네비게이션과 실시간 환경 정보로<br />
                더 쾌적한 도시 생활을 경험하세요
              </p>
              <button
                onClick={() => navigate("/service")}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-3 px-8 xs:py-4 xs:px-12 md:py-5 md:px-16 3xl:py-6 3xl:px-20 4xl:py-8 4xl:px-24 5xl:py-10 5xl:px-32 rounded-full text-base xs:text-lg md:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                서비스 자세히 보기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
