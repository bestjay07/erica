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
      contents: `인강 이름: "${lectureName}"
이 인터넷 강의의 정밀 정보를 찾아 다음 JSON 형태로만 응답하세요. 다른 설명이나 마크다운 코드블록은 제외하고 Pure JSON만 출력하세요:
{
  "found": true,
  "lectureTitle": "정확한 강의명",
  "teacherName": "강사/선생님 이름",
  "totalEpisodes": 30,
  "avgDurationMinutes": 50
}`,
    });

    const text = response.text.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const data = JSON.parse(text);

    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: '인강 정보를 검색하는 중 오류가 발생했습니다.' });
  }
}
