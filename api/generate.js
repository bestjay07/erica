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
      model: 'gemini-3.1-flash-lite',
      contents: `사용자가 입력한 인강 검색어: "${lectureName}"
이 검색어와 가장 관련 깊거나 유사한 대표 인강 5개를 찾아서 리스트로 제공해주세요. EBS, 메가스터디, 대성마이맥, 이투스, 커넥츠 등의 실제/유사 강의 정보를 바탕으로 각 강의의 총 강수와 1강당 평균 수강 시간(분)을 추정해서 제공하세요.`,
      config: {
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
    return res.status(500).json({ error: '인강 후보를 찾는 중 오류가 발생했습니다.' });
  }
}
