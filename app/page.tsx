'use client';

import { useState } from 'react';

type CharResult = {
    char: string;
    pinyin: string;
    meaning: string | null;
};

export default function Home() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<CharResult[]>([]);
    const [loading, setLoading] = useState(false);

    const analyze = async () => {
        if (!input.trim()) return;
        setLoading(true);
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input }),
        });
        const data = await res.json();
        setResult(data.result);
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
            <h1 className="text-3xl font-bold mb-8">중국어 분석기</h1>

            <div className="w-full max-w-xl">
        <textarea
            className="w-full border rounded-lg p-4 text-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={3}
            placeholder="중국어를 입력하세요... (예: 我爱你)"
            value={input}
            onChange={e => setInput(e.target.value)}
        />
                <button
                    onClick={analyze}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? '분석 중...' : '분석하기'}
                </button>
            </div>

            {result.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-4 justify-center">
                    {result.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center bg-white rounded-xl shadow p-4 min-w-[72px]">
                            <span className="text-sm text-blue-400 mb-1">{item.pinyin}</span>
                            <span className="text-4xl">{item.char}</span>
                            <span className="text-xs text-gray-400 mt-1">{item.meaning ?? '—'}</span>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}