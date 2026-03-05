import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'lib/learned.json');

function load(): Record<string, string> {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return {};
    }
}

let learned = load();

export function getLearnedMeaning(word: string): string | null {
    return learned[word] ?? null;
}

export function saveLearned(word: string, meaning: string) {
    learned[word] = meaning;
    fs.writeFileSync(filePath, JSON.stringify(learned, null, 2), 'utf-8');
}