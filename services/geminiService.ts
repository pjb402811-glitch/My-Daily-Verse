
import { GoogleGenAI, Type } from "@google/genai";
import type { Recommendation } from '../types';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    verses: {
      type: Type.ARRAY,
      description: "추천 성경 구절 목록",
      items: {
        type: Type.OBJECT,
        properties: {
          book: { type: Type.STRING, description: "성경책의 전체 이름 (예: '시편')" },
          chapter: { type: Type.INTEGER, description: "장 번호" },
          verse: { type: Type.STRING, description: "절 번호 또는 범위 (예: '1' or '1-3')" },
          text: { type: Type.STRING, description: "구절의 전체 텍스트" }
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
        description: "추천 CCM(현대 기독교 음악) 목록",
        items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "CCM 곡 제목과 아티스트" },
              youtubeSearchQuery: { type: Type.STRING, description: "추천 CCM을 YouTube에서 검색하기 위한 검색어 (예: '어노인팅 내가 주인 삼은')" }
            },
            required: ["title", "youtubeSearchQuery"]
        }
    }
  },
  required: ["verses", "traditionalHymns", "ccms"]
};

export const getRecommendations = async (userInput: string, emotions?: string[]): Promise<Recommendation> => {
  const apiKey = localStorage.getItem('GEMINI_API_KEY');

  if (!apiKey) {
    throw new Error("Google API 키가 설정되지 않았습니다. 우측 상단 설정 메뉴에서 API 키를 입력해주세요.");
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
      ? ` 참고로 사용자의 오늘의 감정은 '${emotions.map(e => emotionKoreanMap[e] || e).join(', ')}'입니다.`
      : '';
    const prompt = `사용자의 다음 일기 내용을 분석하여, 위로와 힘이 되는 성경 구절 2-3개, 어울리는 전통 찬송가 2개, 그리고 현대적인 CCM 2곡을 추천해주세요.${emotionInfo} 전통 찬송가와 CCM에 대해서는, 추천하는 곡을 YouTube에서 찾기 위한 검색어를 'youtubeSearchQuery' 필드에 포함시켜 주세요 (예: '내 주를 가까이 하게 함은', '어노인팅 내가 주인 삼은'). 절대로 URL 전체를 생성하지 마세요. 응답은 반드시 JSON 형식이어야 합니다. 성경책 이름은 한국어 약어가 아닌 전체 이름(예: 창세기, 시편)으로 제공해주세요. 결과는 매번 다양하고 창의적으로 제안해주세요. 결과는 반드시 정의된 JSON 스키마를 따라야 합니다. 사용자 일기: "${userInput}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.9,
        systemInstruction: "You are a wise and compassionate theological guide. Your purpose is to provide comfort and guidance from the Christian Bible, traditional hymns, and Contemporary Christian Music (CCM) based on a user's diary entry. All Bible verse recommendations must be from the canonical Christian Bible and should not be fabricated. Your responses must be in Korean.",
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
    if (error instanceof Error && error.message.includes('API key not valid')) {
        return Promise.reject(new Error("입력하신 Google API 키가 유효하지 않습니다. 확인 후 다시 시도해주세요."));
    }
    throw new Error("AI 모델로부터 추천을 받는 데 실패했습니다.");
  }
};