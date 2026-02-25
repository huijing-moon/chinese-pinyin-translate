import { useState, useEffect } from 'react';

export type WordEntry = {
    char: string;
    pinyin: string;
    meaning: string | null;
    savedAt: number;
};

export function useWordbook() {
    const [wordbook, setWordbook] = useState<WordEntry[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('wordbook');
        if (saved) setWordbook(JSON.parse(saved));
    }, []);

    const save = (entry: WordEntry) => {
        setWordbook(prev => {
            if (prev.some(w => w.char === entry.char)) return prev; // 중복 방지
            const next = [{ ...entry, savedAt: Date.now() }, ...prev];
            localStorage.setItem('wordbook', JSON.stringify(next));
            return next;
        });
    };

    const remove = (char: string) => {
        setWordbook(prev => {
            const next = prev.filter(w => w.char !== char);
            localStorage.setItem('wordbook', JSON.stringify(next));
            return next;
        });
    };

    const isSaved = (char: string) => wordbook.some(w => w.char === char);

    return { wordbook, save, remove, isSaved };
}