
import { GoogleGenAI, Type } from "@google/genai";
import type { Recommendation } from '../types';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    verses: {
      type: Type.ARRAY,
      description: "추천 성경 구절 목록. 매우 중요: 모든 구절은 반드시 '새번역' 성경에서만 가져와야 합니다. '개역개정' 등 다른 번역본을 사용하는 것은 치명적인 오류입니다.",
      items: {
        type: Type.OBJECT,
        properties: {
          book: { type: Type.STRING, description: "성경책의 전체 이름 (예: '시편')" },
          chapter: { type: Type.INTEGER, description: "장 번호" },
          verse: { type: Type.STRING, description: "절 번호 또는 범위 (예: '1' or '1-3')" },
          text: { type: Type.STRING, description: "구절의 전체 텍스트. 치명적으로 중요: 이 텍스트는 반드시 '새번역' 성경의 원문과 정확히 일치해야 합니다. 요약, 변경, 의역은 절대 허용되지 않습니다." }
        },
        required: ["book", "chapter", "verse", "text"]
      }
    },
    traditionalHymns: {
      type: Type.ARRAY,
      description: "추천 전통 찬송가 목록",
      items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "전통 찬송가 제목" },
            number: { type: Type.INTEGER, description: "찬송가 장 번호 (없는 경우 생략 가능)" },
            youtubeSearchQuery: { type: Type.STRING, description: "추천 찬송가를 YouTube에서 검색하기 위한 검색어 (예: '내 주를 가까이 하게 함은')" }
        },
        required: ["title", "youtubeSearchQuery"]
      }
    },
    ccms: {
        type: Type.ARRAY,
        description: "추천 CCM(현대 기독교 음악) 목록. 지침에 따라 반드시 3곡을 추천해야 합니다.",
        items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "CCM 곡 제목과 아티스트" },
              youtubeSearchQuery: { type: 'STRING', description: "추천 CCM을 YouTube에서 검색하기 위한 검색어 (예: '어노인팅 내가 주인 삼은')" }
            },
            required: ["title", "youtubeSearchQuery"]
        }
    }
  },
  required: ["verses", "traditionalHymns", "ccms"]
};

export const getRecommendations = async (userInput: string, emotions?: string[], gratitude?: string): Promise<Recommendation> => {
  const apiKey = localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error("Google API 키가 설정되지 않았습니다. 설정 메뉴에서 API 키를 입력해주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const emotionKoreanMap: { [key: string]: string } = {
        joy: '기쁨',
        gratitude: '감사',
        peace: '평안',
        excitement: '설렘',
        contentment: '만족',
        sadness: '슬픔',
        anger: '화남',
        anxiety: '불안',
        loneliness: '외로움',
        tiredness: '피곤',
        disappointment: '실망',
    };
    const emotionInfo = emotions && emotions.length > 0
      ? `참고로 사용자의 오늘의 감정은 '${emotions.map(e => emotionKoreanMap[e] || e).join(', ')}'입니다.`
      : '사용자가 감정을 선택하지 않았습니다.';

    const gratitudeInfo = gratitude && gratitude.trim().length > 0
      ? `어려움 속에서도 사용자가 감사하게 생각하는 점은 다음과 같습니다: '${gratitude}'`
      : '사용자가 감사한 점을 별도로 입력하지 않았습니다.';

    const prompt = `
[AI 모델 지침: 조정민 목사 관점 적용]
당신은 베이직교회 조정민 목사님의 관점을 완벽하게 이해하고 재현하며, 사용자가 제시하는 상황(Situation)과 감정(Emotion)에 가장 적합한 성경 구절과 찬양을 추천합니다.

[성경 구절 선택의 핵심 원칙]
1.  **본질 회귀(Back to the Basic):** 기독교의 기초와 본질("Back to the Basic") 혹은 믿음의 첫 자리(베델)로 돌아가도록 촉구하는 구절을 선택합니다.
2.  **인간의 조건:** 상황(인생의 조건) 변화보다, 존재(인간의 조건, 구원 및 성화) 변화에 초점을 맞춥니다.
3.  **반(反) 종교성:** '마일리지 시스템'이나 형식적인 종교 행위 대신, 예수 그리스도로 옷 입고, 말씀(성경)을 직접 묵상하여 내면의 변화를 이루도록 권면하는 구절을 선택합니다.
4.  **자기 십자가:** 고난과 위기를 하나님이 우리를 흔들어 깨우고, 우리가 스스로 변화(나만 바뀌면 된다)를 추구해야 할 '자기 십자가'로 이해하도록 돕는 구절을 선택합니다.

[ADVANCED CCM RECOMMENDATION GUIDELINES]
When recommending CCMs, you must adhere to the following guidelines to provide diverse and insightful recommendations, avoiding bias toward only a few famous artists.
1.  **Include Diverse Artists**: Do not concentrate recommendations on specific groups like '마커스' or '어노인팅'. Actively include songs from a wide variety of artists and groups to broaden the scope of recommendations. The list of artists to consider should include, but is not limited to: '박종호', '송정미', '소향', '김도현', '강찬', '한웅재', '김복유', '소리엘', '꿈이 있는 자유', '시와그림', '제이어스 (J-US)', '위러브 (WELOVE)', '예수전도단 (YWAM)', '김윤진', and '소진영'. Your primary goal is to provide fresh and varied suggestions beyond the most famous contemporary worship songs.
2.  **Utilize Mood and Emotion Tags**: Recommend songs with an appropriate mood by using tags related to the user's situation, such as '깊은 묵상을 위한 (for deep meditation)', '잔잔한 (calm)', '기도 (prayer)', '위로 (comfort)', and '고백 (confession)'. Using the keyword '플레이리스트 (playlist)' can also be a good method.
3.  **Discover New CCMs**: Include lesser-known but inspiring songs by using keywords like '숨겨진 명곡 CCM (hidden gem CCM)' or 'MZ세대 워십 (Gen Z worship)' to discover and recommend fresh tracks.

[USER'S SITUATION]
Diary: "${userInput}"
Feelings: ${emotionInfo}
Gratitude: ${gratitudeInfo}

[TASK]
1.  **Analyze**: Analyze the user's situation based on the [USER'S SITUATION] section, through the lens of Pastor Cho Jung-min's core principles.
2.  **Select & Recommend**: Based on your analysis, select 2-3 Bible verses, 1-2 traditional hymns, and **exactly 3 diverse CCMs** following the [ADVANCED CCM RECOMMENDATION GUIDELINES]. These recommendations should offer the most profound insight from this perspective.
3.  **CRITICAL BIBLE VERSION RULE**: All Bible verses **MUST** be quoted verbatim from the Korean 'Saebeonyeok' (새번역) translation. Do not use any other translation. Do not paraphrase, summarize, or add interpretations to the verse text itself. The 'text' field in the JSON must be a perfect copy from the 'Saebeonyeok' Bible.
4.  **Format Output**: Generate a JSON object that strictly adheres to the provided schema. Ensure all required fields are present.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // 약간의 창의성을 허용하되 일관성을 유지
        systemInstruction: "You are an AI assistant that perfectly understands and embodies the perspective of Pastor Cho Jung-min of Basic Community Church. You recommend Bible verses and hymns to users based on their situation and emotions, applying Pastor Cho's core theological principles. Your output must be in Korean and strictly follow the provided JSON schema. 당신은 베이직교회 조정민 목사님의 관점을 완벽하게 이해하고 재현하는 AI 어시스턴트입니다. 사용자의 상황과 감정에 따라 조정민 목사님의 핵심 신학 원칙을 적용하여 성경 구절과 찬송을 추천합니다. 출력은 한국어여야 하며 제공된 JSON 스키마를 엄격히 준수해야 합니다.",
      }
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText) as Recommendation;

    // Basic validation
    if (!parsedData.verses || !parsedData.traditionalHymns || !parsedData.ccms) {
        throw new Error("Invalid data structure received from API.");
    }

    return parsedData;

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('API_KEY'))) {
        return Promise.reject(new Error("Google API 키가 유효하지 않거나 설정되지 않았습니다. 확인 후 다시 시도해주세요."));
    }
    throw new Error("AI 모델로부터 추천을 받는 데 실패했습니다.");
  }
};