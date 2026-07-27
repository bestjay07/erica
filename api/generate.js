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
    
    // AI에게 가장 유사한 인강을 추론/검색하도록 강력 지침 부여
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `사용자가 입력한 검색어: "${lectureName}"

위 검색어와 가장 유사하거나 일치하는 대한민국 인터넷 강의(EBS, 메가스터디, 대성마이맥, 이투스, 공단기 등)를 찾아서 반환하세요.
만약 입력이 모호하거나 줄임말인 경우, 가장 유명한 대표 강의나 추정되는 관련 강의 정보를 추론해서 완성해 주세요.

반드시 마크다운 코드블록이나 다른 설명 없이 아래 JSON 포맷으로만 응답해야 합니다:
{
  "found": true,
  "lectureTitle": "가장 유사한 인강의 정확한 풀네임",
  "teacherName": "해당 강의의 강사/선생님 성함",
  "totalEpisodes": 총 강수(숫자만, 모를 경우 약 30으로 추정),
  "avgDurationMinutes": 1강당 평균 시간(분 단위 숫자만, 모를 경우 50으로 추정)
}`,
    });

    const text = response.text.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const data = JSON.parse(text);

    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    // 에러 발생 시에도 유저 경험을 위해 기본 추정값 반환
    return res.status(200).json({
      found: true,
      lectureTitle: lectureName,
      teacherName: "미상/확인불가",
      totalEpisodes: 30,
      avgDurationMinutes: 50
    });
  }
}
