import { useNavigate } from 'react-router-dom';
import { getHistory } from '../store/history';

export default function Home() {
  const navigate = useNavigate();
  const history = getHistory().slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#2d5a8e] flex flex-col items-center justify-start px-4 pt-16 pb-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">☁️</div>
          <h1 className="text-3xl font-bold text-white">AWS SAA CBT</h1>
          <p className="text-blue-200 mt-1 text-sm">Solutions Architect Associate</p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <button
            onClick={() => navigate('/practice')}
            className="bg-white text-[#1e3a5f] rounded-2xl p-5 text-left shadow-lg active:scale-95 transition-transform"
          >
            <div className="font-bold text-lg">📚 연습 모드</div>
            <div className="text-sm text-gray-500 mt-1">문제별 즉시 정답·해설 · 도메인 선택 가능</div>
          </button>

          <button
            onClick={() => navigate('/exam')}
            className="bg-[#f0a500] text-white rounded-2xl p-5 text-left shadow-lg active:scale-95 transition-transform"
          >
            <div className="font-bold text-lg">🎯 시험 모드</div>
            <div className="text-sm text-yellow-100 mt-1">65문항 · 130분 · 합격선 720/1000</div>
          </button>

          <button
            onClick={() => navigate('/stats')}
            className="bg-white/10 text-white rounded-2xl p-5 text-left shadow-lg active:scale-95 transition-transform"
          >
            <div className="font-bold text-lg">📊 점수 통계</div>
            <div className="text-sm text-blue-200 mt-1">시험 기록 · 도메인별 약점 분석</div>
          </button>
        </div>

        {history.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-blue-200 text-xs font-semibold mb-3 uppercase tracking-wide">최근 시험</p>
            {history.map(h => (
              <div key={h.attemptId} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                <span className="text-white text-sm">{h.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{h.score}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${h.passed ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                    {h.passed ? '합격' : '불합격'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
