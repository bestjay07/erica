import { GoogleGenAI } from '@google/genai';

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
      contents: `사용자가 입력한 검색어: "${lectureName}"

구글 검색을 활용하여 위 검색어와 가장 관련 깊은 실제 한국 인터넷 강의(EBS, 메가스터디, 대성마이맥, 이투스, 공단기 등)를 최대 5개 찾으세요.

반드시 다른 텍스트나 설명 없이 오직 JSON 배열 형태([ ... ])로만 응답하세요:
[
  {
    "lectureTitle": "정확한 전체 강의명 1",
    "teacherName": "강사 이름",
    "totalEpisodes": 실제총강수(숫자만),
    "avgDurationMinutes": 평균강의시간(분단위숫자)
  }
]`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;

    // AI 응답 중 순수 JSON 배열부분만 정규식으로 안전하게 추출
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error('JSON 형식을 찾을 수 없습니다.');
    }

    const candidates = JSON.parse(jsonMatch[0]);

    return res.status(200).json({ candidates });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: '인강 정보를 검색하는 중 오류가 발생했습니다.' });
  }
}
