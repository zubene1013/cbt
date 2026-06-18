import { useNavigate } from 'react-router-dom';
import { getHistory, clearHistory } from '../store/history';
import type { Domain } from '../types';
import { PASS_SCORE } from '../types';
import DomainBar from '../components/DomainBar';

export default function Stats() {
  const navigate = useNavigate();
  const history = getHistory();

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-[#1e3a5f] px-4 py-3 flex items-center">
          <button onClick={() => navigate('/')} className="text-white text-sm mr-4">← 홈</button>
          <span className="text-white font-bold">점수 통계</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          시험 기록이 없습니다.
        </div>
      </div>
    );
  }

  // 최근 10개 점수 추이
  const recent = history.slice(0, 10).reverse();
  const maxScore = 1000;
  const chartH = 120;

  // 도메인별 평균 정답률
  const domains: Domain[] = ['secure', 'resilient', 'performance', 'cost'];
  const avgByDomain = Object.fromEntries(
    domains.map(d => [d, history.reduce((s, h) => s + h.byDomain[d], 0) / history.length])
  ) as Record<Domain, number>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#1e3a5f] px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-white text-sm">← 홈</button>
        <span className="text-white font-bold">점수 통계</span>
        <button onClick={() => { if (confirm('모든 기록을 삭제할까요?')) { clearHistory(); navigate('/'); } }} className="text-red-300 text-xs">
          초기화
        </button>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto flex flex-col gap-5 w-full">
        {/* 요약 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#1e3a5f]">{history.length}</div>
            <div className="text-xs text-gray-500">총 시험</div>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#1e3a5f]">
              {Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)}
            </div>
            <div className="text-xs text-gray-500">평균 점수</div>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {history.filter(h => h.passed).length}
            </div>
            <div className="text-xs text-gray-500">합격 횟수</div>
          </div>
        </div>

        {/* 점수 추이 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">점수 추이</h2>
          <svg width="100%" height={chartH} viewBox={`0 0 ${recent.length * 40} ${chartH}`} preserveAspectRatio="none">
            {/* 합격선 */}
            <line
              x1={0} y1={chartH - (PASS_SCORE / maxScore) * chartH}
              x2={recent.length * 40} y2={chartH - (PASS_SCORE / maxScore) * chartH}
              stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1}
            />
            {/* 점수 꺾은선 */}
            {recent.length > 1 && (
              <polyline
                fill="none"
                stroke="#1e3a5f"
                strokeWidth={2}
                points={recent.map((h, i) =>
                  `${i * 40 + 20},${chartH - (h.score / maxScore) * chartH}`
                ).join(' ')}
              />
            )}
            {recent.map((h, i) => (
              <g key={h.attemptId}>
                <circle
                  cx={i * 40 + 20}
                  cy={chartH - (h.score / maxScore) * chartH}
                  r={5}
                  fill={h.passed ? '#22c55e' : '#ef4444'}
                />
                <text x={i * 40 + 20} y={chartH - (h.score / maxScore) * chartH - 8} textAnchor="middle" fontSize={9} fill="#374151">
                  {h.score}
                </text>
              </g>
            ))}
          </svg>
          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> 합격</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> 불합격</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-red-400 border-dashed inline-block" /> 합격선(720)</span>
          </div>
        </div>

        {/* 도메인 평균 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">도메인별 평균 정답률</h2>
          <DomainBar byDomain={avgByDomain} />
        </div>

        {/* 기록 목록 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">시험 기록</h2>
          <div className="flex flex-col gap-2">
            {history.map(h => (
              <div key={h.attemptId} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <span className="text-sm text-gray-700">{h.date}</span>
                  <span className="text-xs text-gray-400 ml-2">{h.correctCount}/{h.totalQuestions}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">{h.score}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${h.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {h.passed ? '합격' : '불합격'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
