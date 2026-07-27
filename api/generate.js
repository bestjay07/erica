import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lectureName } = req.body;
  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const response = await model.generateContent(...);

  if (!lectureName) {
    return res.status(400).json({ error: '인강 이름을 입력해주세요.' });
  }
@@ -23,15 +19,15 @@
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      model: 'gemini-2.5-flash',
      contents: `인강 이름: "${lectureName}"
이 인터넷 강의의 정밀 정보를 찾아 다음 JSON 형태로만 응답하세요. 다른 설명이나 마크다운 코드블록은 제외하고 Pure JSON만 출력하세요:
{
  "found": true 또는 false,
  "found": true,
  "lectureTitle": "정확한 강의명",
  "teacherName": "강사/선생님 이름",
  "totalEpisodes": 총 강수(숫자만),
  "avgDurationMinutes": 1강당 평균 수업 시간(분, 숫자만)
  "totalEpisodes": 30,
  "avgDurationMinutes": 50
}`,
    });
