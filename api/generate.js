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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `사용자가 수강하려는 인강명 또는 키워드: "${lectureName}"

이 인강(또는 해당 과목/선생님 대표 강의)의 정보를 바탕으로 다음 정보를 추론하여 JSON 형식으로 출력하세요:
- lectureTitle: 정확한 또는 가장 대표적인 강의명
- teacherName: 강사 이름
- totalEpisodes: 총 강수 (숫자만, 기본값 약 20~30강)
- avgDurationMinutes: 1강당 평균 수강시간 (분 단위 숫자만, 예: 45)

JSON 형식:
{
  "lectureTitle": "강의명",
  "teacherName": "강사명",
  "totalEpisodes": 30,
  "avgDurationMinutes": 45
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lectureTitle: { type: Type.STRING },
            teacherName: { type: Type.STRING },
            totalEpisodes: { type: Type.INTEGER },
            avgDurationMinutes: { type: Type.INTEGER }
          },
          required: ['lectureTitle', 'teacherName', 'totalEpisodes', 'avgDurationMinutes']
        }
      }
    });

    const data = JSON.parse(response.text);
    return res.status(200).json(data);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: '인강 정보 생성 중 오류가 발생했습니다.' });
  }
}
