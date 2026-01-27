import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function HistoryNavigator() {
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    // 브라우저 히스토리 상태 확인
    // window.history.length를 사용하여 앞뒤 이동 가능 여부 확인
    const updateNavigation = () => {
      // 히스토리가 1보다 크면 뒤로가기 가능
      setCanGoBack(window.history.length > 1);
      // 앞으로가기는 세션 스토리지로 추적 (간단한 구현)
      const forwardAvailable = sessionStorage.getItem('canGoForward') === 'true';
      setCanGoForward(forwardAvailable);
    };

    updateNavigation();

    // popstate 이벤트 리스너 추가
    window.addEventListener('popstate', updateNavigation);

    return () => {
      window.removeEventListener('popstate', updateNavigation);
    };
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      sessionStorage.setItem('canGoForward', 'true');
      navigate(-1);
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      navigate(1);
    }
  };

  return (
    <div className="fixed top-1/2 left-0 right-0 z-40 pointer-events-none">
      <div className="w-full mx-auto px-4 flex justify-between items-center">
        {/* 왼쪽 화살표 (뒤로가기) */}
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className={`pointer-events-auto w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center transition-all duration-300 ${
            canGoBack
              ? 'hover:bg-white hover:shadow-xl hover:scale-110 text-gray-700'
              : 'opacity-30 cursor-not-allowed text-gray-400'
          }`}
          aria-label="뒤로가기"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* 오른쪽 화살표 (앞으로가기) */}
        <button
          onClick={handleForward}
          disabled={!canGoForward}
          className={`pointer-events-auto w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center transition-all duration-300 ${
            canGoForward
              ? 'hover:bg-white hover:shadow-xl hover:scale-110 text-gray-700'
              : 'opacity-30 cursor-not-allowed text-gray-400'
          }`}
          aria-label="앞으로가기"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
