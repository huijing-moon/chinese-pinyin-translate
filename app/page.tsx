'use client';

import { useState } from 'react';

type CharResult = {
    char: string;
    pinyin: string;
    meaning: string | null;
};

const EXAMPLES = ['我爱你', '你好吗', '谢谢你', '我学习汉语', '今天天气很好'];

export default function Home() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<CharResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);

    const analyze = async (text?: string) => {
        const target = text ?? input;
        if (!target.trim()) return;
        if (text) setInput(text);
        setLoading(true);
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: target }),
        });
        const data = await res.json();
        setResult(data.result);
        setLoading(false);
        setAnalyzed(true);
    };

    return (
        <main className="min-h-screen bg-[#FAFAF8]">
            {/* 헤더 */}
            <header className="border-b border-gray-100 bg-white">
                <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-light text-gray-800 tracking-widest">汉</span>
                        <div>
                            <h1 className="text-sm font-semibold text-gray-900 tracking-wide">중국어 분석기</h1>
                            <p className="text-xs text-gray-400">병음 · 한국어 뜻</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-10">
                {/* 입력 영역 */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <textarea
              className="w-full px-6 pt-5 pb-3 text-xl text-gray-800 bg-transparent outline-none resize-none placeholder-gray-300"
              rows={3}
              placeholder="중국어를 입력하세요..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      analyze();
                  }
              }}
          />
                    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-50">
                        <span className="text-xs text-gray-300">{input.length}자</span>
                        <button
                            onClick={() => analyze()}
                            disabled={loading || !input.trim()}
                            className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-colors"
                        >
                            {loading ? '분석 중...' : '분석하기'}
                        </button>
                    </div>
                </div>

                {/* 예문 버튼 */}
                <div className="flex flex-wrap gap-2 mb-10">
                    {EXAMPLES.map(ex => (
                        <button
                            key={ex}
                            onClick={() => analyze(ex)}
                            className="px-3 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-full hover:border-gray-400 hover:text-gray-700 transition-colors"
                        >
                            {ex}
                        </button>
                    ))}
                </div>

                {/* 결과 */}
                {analyzed && (
                    <div>
                        <p className="text-xs text-gray-400 mb-5 tracking-wide uppercase">분석 결과</p>
                        <div className="flex flex-wrap gap-3">
                            {result.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center bg-white border border-gray-100 rounded-xl px-4 py-4 min-w-[72px] shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
                                >
                                    {/* 병음 */}
                                    <span className="text-xs text-indigo-400 mb-2 font-medium tracking-wide">
                    {item.pinyin || '·'}
                  </span>
                                    {/* 한자 */}
                                    <span className="text-3xl text-gray-800 leading-none mb-2">
                    {item.char}
                  </span>
                                    {/* 뜻 */}
                                    <span className="text-[11px] text-gray-400 text-center leading-tight max-w-[80px]">
                    {item.meaning ?? '—'}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}