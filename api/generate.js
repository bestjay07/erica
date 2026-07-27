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

    // 유사/연관 인강까지 폭넓게 찾도록 프롬프트 유연화
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `사용자가 입력한 검색어/키워드: "${lectureName}"

1. Google 검색을 활용하여 위 검색어와 일치하거나, 가장 유사/연관된 국내 인강(EBSi, 메가스터디, 대성마이맥, 이투스 등) 5개를 탐색하세요.
2. 완전히 동일한 강의명이 없더라도 사용자의 의도(과목, 난이도, 강사, 주제 등)와 유사한 대표 인강들을 폭넓게 추천하세요.
3. 데이터가 정확하지 않거나 검색 결과가 일부 부족하더라도 일반적인 인강의 구성(예: 보통 15~30강, 1강당 40~50분)을 참고하여 가장 합리적인 수치로 완성하세요.

반드시 다음 JSON 형식에 맞춰 출력하세요:
{
  "candidates": [
    {
      "id": 1,
      "lectureTitle": "강의명",
      "teacherName": "강사 이름",
      "platform": "사이트명(예: EBSi, 메가스터디, 대성마이맥 등)",
      "totalEpisodes": 총강수(숫자만),
      "avgDurationMinutes": 1강당 평균 수강시간(분 단위 숫자만)
    }
  ]
}`,
      config: {
        tools: [{ googleSearch: {} }],
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
    return res.status(500).json({ error: '유사 인강을 검색하는 중 오류가 발생했습니다. 다시 시도해주세요.' });
  }
}
