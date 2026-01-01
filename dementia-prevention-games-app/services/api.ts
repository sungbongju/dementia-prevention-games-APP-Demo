// 기존 학교 서버 PHP API와 연동

const API_BASE_URL = 'https://www.aiforalab.com/dementia-prevention-games-v2/api.php';

async function callAPI(action: string, data?: any): Promise<any> {
  try {
    if (data) {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });
      return await response.json();
    } else {
      const response = await fetch(`${API_BASE_URL}?action=${action}`);
      return await response.json();
    }
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'API 호출 실패' };
  }
}

export async function saveRecord(data: {
  player_name: string;
  hwatu_score: number;
  pattern_score: number;
  memory_score: number;
  proverb_score: number;
  calc_score: number;
  sequence_score: number;
}) {
  return callAPI('save', data);
}

export async function getRecords(playerName: string) {
  const response = await fetch(`${API_BASE_URL}?action=get_records&player_name=${encodeURIComponent(playerName)}`);
  return response.json();
}

export async function getRanking() {
  return callAPI('get_ranking');
}

export async function getStats(playerName: string) {
  const response = await fetch(`${API_BASE_URL}?action=get_stats&player_name=${encodeURIComponent(playerName)}`);
  return response.json();
}
