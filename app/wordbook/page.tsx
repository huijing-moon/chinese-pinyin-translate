'use client';

import { useState, useEffect } from 'react';
import { useWordbook, WordEntry } from '@/hooks/useWordbook';
import { useRouter } from 'next/navigation';

type CardState = 'hidden' | 'revealed';

export default function FlashCard() {
    const { wordbook, remove } = useWordbook();
    const router = useRouter();

    const [queue, setQueue] = useState<WordEntry[]>([]);
    const [current, setCurrent] = useState(0);
    const [cardState, setCardState] = useState<CardState>('hidden');
    const [done, setDone] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (wordbook.length === 0) return;
        const shuffled = [...wordbook].sort(() => Math.random() - 0.5);
        setQueue(shuffled);
        setTotalCount(shuffled.length);
    }, [wordbook.length]);

    const handleReveal = () => setCardState('revealed');

    const handleKnow = () => {
        next();
    };

    const handleDontKnow = () => {
        // 모르는 단어 → 큐 맨 뒤에 다시 추가
        setQueue(prev => {
            const next = [...prev];
            const word = next[current];
            next.push({ ...word });
            return next;
        });
        next();
    };

    const next = () => {
        setCardState('hidden');
        if (current + 1 >= queue.length) {
            setDone(true);
        } else {
            setCurrent(prev => prev + 1);
        }
    };

    if (wordbook.length === 0) {
        return (
            <main className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center">
                <p className="text-4xl mb-4">☆</p>
                <p className="text-gray-400 text-sm mb-6">단어장이 비어있어요</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg"
                >
                    분석하러 가기
                </button>
            </main>
        );
    }

    if (done) {
        return (
            <main className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center gap-6">
                <p className="text-5xl">🎉</p>
                <p className="text-gray-800 font-semibold text-lg">학습 완료!</p>
                <p className="text-gray-400 text-sm">단어장 {wordbook.length}개를 모두 학습했어요</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            const shuffled = [...wordbook].sort(() => Math.random() - 0.5);
                            setQueue(shuffled);
                            setTotalCount(shuffled.length);
                            setCurrent(0);
                            setCardState('hidden');
                            setDone(false);
                        }}
                        className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        다시 학습
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="px-5 py-2 bg-white border border-gray-200 text-gray-600 text-sm rounded-lg hover:border-gray-400 transition-colors"
                    >
                        돌아가기
                    </button>
                </div>
            </main>
        );
    }

    const card = queue[current];
    // 실제 진도 (오답 제외한 원래 단어 기준)
    const realProgress = Math.min(current + 1, totalCount);

    return (
        <main className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-6">
            {/* 상단 헤더 */}
            <div className="w-full max-w-sm mb-8">
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={() => router.push('/')}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ← 돌아가기
                    </button>
                    <span className="text-xs text-gray-400">
            {realProgress} / {totalCount}
          </span>
                </div>
                {/* 진도율 바 */}
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                        className="bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(realProgress / totalCount) * 100}%` }}
                    />
                </div>
            </div>

            {/* 플래시 카드 */}
            <div
                onClick={cardState === 'hidden' ? handleReveal : undefined}
                className={`w-full max-w-sm bg-white border rounded-3xl shadow-sm flex flex-col items-center justify-center py-16 px-8 transition-all duration-300 ${
                    cardState === 'hidden' ? 'cursor-pointer hover:shadow-md hover:border-gray-200' : ''
                }`}
                style={{ minHeight: 280 }}
            >
                {/* 한자 */}
                <span className="text-7xl text-gray-800 mb-6">{card?.char}</span>

                {cardState === 'hidden' ? (
                    <span className="text-xs text-gray-300">탭해서 뒤집기</span>
                ) : (
                    <div className="flex flex-col items-center gap-2 animate-fade-in">
            <span className="text-lg text-indigo-400 font-medium tracking-widest">
              {card?.pinyin}
            </span>
                        <span className="text-base text-gray-500">{card?.meaning ?? '—'}</span>
                    </div>
                )}
            </div>

            {/* 버튼 영역 */}
            <div className="w-full max-w-sm mt-8">
                {cardState === 'hidden' ? (
                    <button
                        onClick={handleReveal}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl text-sm hover:bg-gray-700 transition-colors"
                    >
                        뒤집기
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handleDontKnow}
                            className="flex-1 py-4 bg-white border border-red-200 text-red-400 rounded-2xl text-sm hover:bg-red-50 transition-colors"
                        >
                            몰라요 😅
                        </button>
                        <button
                            onClick={handleKnow}
                            className="flex-1 py-4 bg-white border border-green-200 text-green-500 rounded-2xl text-sm hover:bg-green-50 transition-colors"
                        >
                            알아요 ✓
                        </button>
                    </div>
                )}
            </div>

            {/* 오답 카드 남은 개수 */}
            {queue.length > totalCount && (
                <p className="mt-4 text-xs text-gray-300">
                    복습 카드 {queue.length - totalCount}개 남음
                </p>
            )}
        </main>
    );
}