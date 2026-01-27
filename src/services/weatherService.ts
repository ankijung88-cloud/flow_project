// Korea Meteorological Administration API Service
const API_KEY = "ymoHff2O+GPqWZ9psSt2T2+oloa34elsshwdTp4esIJzGE8S8FsAIkVsK+0F7D7LG0lJ+cH784/fl5mfKxoWMg==";
const BASE_URL = "https://apis.data.go.kr/1360000/MidFcstInfoService";

export interface WeatherData {
  airQuality: {
    level: string;
    value: number;
    color: string;
  };
  weather: {
    condition: string;
    temp: number;
    icon: string;
  };
  humidity: number;
  windSpeed: number;
}

// 대기질 데이터 가져오기 (임시 - 추후 실제 API로 대체)
export async function getAirQuality(): Promise<{ level: string; value: number; color: string }> {
  // TODO: 실제 대기질 API 연동
  // 현재는 더미 데이터 반환
  return {
    level: "좋음",
    value: Math.floor(Math.random() * 50) + 10, // 10-60 랜덤
    color: "#10B981",
  };
}

// 중기예보 데이터 가져오기
export async function getMidTermForecast(regId: string = "11B00000"): Promise<unknown> {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const hour = String(today.getHours()).padStart(2, "0");
    const minute = String(today.getMinutes()).padStart(2, "0");

    const tmFc = `${year}${month}${day}${hour}${minute}`;

    const url = `${BASE_URL}/getMidFcst?serviceKey=${encodeURIComponent(API_KEY)}&pageNo=1&numOfRows=10&dataType=JSON&regId=${regId}&tmFc=${tmFc}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Weather API error:", error);
    return null;
  }
}

// 날씨 아이콘 매핑
function getWeatherIcon(condition: string): string {
  const iconMap: { [key: string]: string } = {
    맑음: "☀️",
    구름: "☁️",
    흐림: "☁️",
    비: "🌧️",
    눈: "❄️",
    default: "☀️",
  };

  return iconMap[condition] || iconMap.default;
}

// 환경 데이터 종합 가져오기
export async function getEnvironmentData(): Promise<WeatherData> {
  try {
    // 대기질 데이터
    const airQuality = await getAirQuality();

    // 중기예보 데이터 (서울 기준)
    // TODO: 중기예보 API 응답 파싱하여 실제 데이터 사용
    await getMidTermForecast("11B00000");

    // 임시 날씨 데이터 (API 응답 구조에 따라 수정 필요)
    const weatherCondition = "맑음";
    const temperature = Math.floor(Math.random() * 15) + 10; // 10-25도 랜덤

    return {
      airQuality,
      weather: {
        condition: weatherCondition,
        temp: temperature,
        icon: getWeatherIcon(weatherCondition),
      },
      humidity: Math.floor(Math.random() * 30) + 40, // 40-70% 랜덤
      windSpeed: Math.random() * 3 + 1, // 1-4 m/s 랜덤
    };
  } catch (error) {
    console.error("Failed to fetch environment data:", error);

    // 에러 발생 시 기본값 반환
    return {
      airQuality: { level: "보통", value: 50, color: "#FBBF24" },
      weather: { condition: "맑음", temp: 18, icon: "☀️" },
      humidity: 45,
      windSpeed: 2.3,
    };
  }
}
