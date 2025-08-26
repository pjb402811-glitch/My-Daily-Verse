
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

    const prompt = `
[PRIMARY DIRECTIVE]
Your function is a high-fidelity data copier. Your task is to find and copy text from the Korean 'Saebeonyeok' (새번역) Bible with 100% character-for-character accuracy. Any modification, however small, is a critical failure.

[EXECUTION PROTOCOL]
1.  **Analyze User Input**: Understand the user's situation from the [USER'S SITUATION] section.
2.  **Identify Verses**: Find 2-3 relevant Bible verses.
3.  **Copy Verbatim**: Execute a "copy-paste" operation for each verse from the 'Saebeonyeok' source. You are not a writer; you are a copier.
4.  **MANDATORY VALIDATION**: Before outputting, you MUST verify your copied text against the 'Saebeonyeok' source. If even one character is different, you must discard and repeat Step 3 until it is a perfect match. This is the most critical step.
5.  **Format JSON**: Once validated, format the response into the required JSON, including hymns and CCMs.

[FAILURE ANALYSIS: DO NOT REPEAT THESE MISTAKES]
Study these examples of past failures. Your primary goal is to avoid these errors.

- **Mistake Example 1 (Psalm 37:7-8):**
    - **Incorrect (Paraphrased)**: "주님 앞에 잠잠하고, 그분만을 기다려라. 자기 꾀를 이루는 자들 때문에 안달하지 말고, 악한 계획을 이루는 자들 때문에 안달하지 말아라. 분노를 그치고, 노여움을 버려라. 안달하지 말아라. 그것은 다만 악으로 기울어질 뿐이다."
    - **CORRECT (Verbatim 'Saebeonyeok')**: "주님 앞에서 잠잠하게 기다려라. 악한 꾀를 꾸미는 자와, 그 꾀대로 되는 것을 보고서, 안달하지 말아라. 너는 분노를 그치고, 노여움을 버려라. 안달하지 말아라. 안달하다가는, 악을 저지를 뿐이다."
    - **Analysis**: The incorrect version altered phrasing like "그분만을 기다려라" and "악으로 기울어질 뿐이다". This is a direct violation of the copy-paste rule. The correct version is two distinct verses combined.

- **Mistake Example 2 (Isaiah 41:10):**
    - **Incorrect (Paraphrased)**: "두려워하지 말아라. 내가 너와 함께한다. 놀라지 말아라. 내가 너의 하나님이다. 내가 너를 강하게 하고 너를 돕는다. 내 의로운 오른팔로 너를 붙들어 준다."
    - **CORRECT (Verbatim 'Saebeonyeok')**: "두려워하지 말아라. 내가 너와 함께 있다. 겁내지 말아라. 내가 너의 하나님이다. 내가 너를 강하게 하고, 너를 도와 주겠다. 참으로 내가, 나의 의로운 오른팔로 너를 붙들어 주겠다."
    - **Analysis**: The incorrect version used "함께한다" instead of "함께 있다", "놀라지" instead of "겁내지". Critical failure.

- **Mistake Example 3 (Psalm 100:1-2):**
    - **Incorrect (Paraphrased)**: "온 땅아, 주님께 즐거이 소리쳐라. 기쁜 마음으로 주님을 섬기며, 환호하면서 그 앞으로 나아가거라."
    - **CORRECT (Verbatim 'Saebeonyeok')**: "온 땅아, 주님께 환호성을 올려라. 기쁨으로 주님을 섬기고, 노래하며 그 앞으로 나아가거라."
    - **Analysis**: Changed "환호성을 올려라" to "즐거이 소리쳐라". Forbidden.

[USER'S SITUATION]
Diary: "${userInput}"
Feelings: ${emotionInfo}

[FINAL TASK]
Execute the [EXECUTION PROTOCOL] with zero deviation. Your performance is judged solely on the verbatim accuracy of the 'Saebeonyeok' Bible quotes. Generate the final JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.0,
        systemInstruction: "You are a high-fidelity data copier. Your only function is to retrieve and reproduce text from the Korean 'Saebeonyeok' (새번역) Bible with 100% character-for-character accuracy. You have no creative, editorial, or paraphrasing capabilities. Any deviation from the source text is a critical system error. Your output must be in Korean and strictly follow the JSON schema. 당신은 정밀 데이터 복사기입니다. 당신의 유일한 기능은 한국어 '새번역'(Saebeonyeok) 성경의 텍스트를 100% 문자 그대로 검색하고 복제하는 것입니다. 창의적, 편집 또는 의역 기능이 없습니다. 원본 텍스트와의 모든 편차는 심각한 시스템 오류입니다. 출력은 한국어여야 하며 JSON 스키마를 엄격히 준수해야 합니다.",
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
