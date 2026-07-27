import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lectureName } = req.body;
  if (!lectureName) {
    return res.status(400).json({ error: '인강 이름을 입력해주세요.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // 1단계: Google 검색을 활용하여 실제 존재하는 인강 정보 검색
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `사용자가 찾고자 하는 인강 검색어: "${lectureName}"

Google 검색을 활용하여 실제 국내 인강 사이트(EBSi, 메가스터디, 대성마이맥, 이투스 등)에 존재하는 실제 강의 중 위 검색어와 가장 관련 높은 실제 인강 5개의 정보를 찾으세요.

지어내지 말고 검색된 실제 정보만을 바탕으로 다음 JSON 형식으로 정확히 출력하세요:
{
  "candidates": [
    {
      "id": 1,
      "lectureTitle": "실제 정확한 강의명",
      "teacherName": "실제 강사 이름",
      "platform": "사이트명(예: EBSi, 메가스터디 등)",
      "totalEpisodes": 총강수(숫자만),
      "avgDurationMinutes": 1강당 평균 수강시간(분 단위 숫자만)
    }
  ]
}`,
      config: {
        tools: [{ googleSearch: {} }], // 실제 웹 검색 기능 사용
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  lectureTitle: { type: Type.STRING },
                  teacherName: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  totalEpisodes: { type: Type.INTEGER },
                  avgDurationMinutes: { type: Type.INTEGER }
                },
                required: ['id', 'lectureTitle', 'teacherName', 'platform', 'totalEpisodes', 'avgDurationMinutes']
              }
            }
          },
          required: ['candidates']
        }
      }
    });

    const data = JSON.parse(response.text);
    return res.status(200).json(data);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: '인강 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
  }
}
