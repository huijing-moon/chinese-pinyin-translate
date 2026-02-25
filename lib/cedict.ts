import fs from 'fs';
import path from 'path';

let dict: Record<string, string> | null = null;

function loadDict(): Record<string, string> {
    if (dict) return dict;

    const filePath = path.join(process.cwd(), 'lib/cedict.txt');
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

    dict = {};
    for (const line of lines) {
        if (line.startsWith('#') || !line.trim()) continue;
        // 형식: 繁體 简体 [pin1 yin1] /뜻1/뜻2/
        const match = line.match(/^\S+ (\S+) \[([^\]]+)\] \/(.+)\/$/);
        if (match) {
            const simplified = match[1];
            const meaning = match[3].split('/')[0]; // 첫 번째 뜻만
            if (!dict[simplified]) dict[simplified] = meaning;
        }
    }

    return dict;
}

export function getCedictMeaning(char: string): string | null {
    const d = loadDict();
    return d[char] ?? null;
}