import { NextRequest, NextResponse } from 'next/server';
import { pinyin } from 'pinyin-pro';
import { koreanDict } from '@/lib/koreanDict';
import { getCedictMeaning } from '@/lib/cedict';

function getMeaning(word: string): string | null {
    if (koreanDict[word]) return koreanDict[word];
    return getCedictMeaning(word);
}

function tokenize(text: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < text.length) {
        // 4글자 단어부터 내려오면서 koreanDict 매칭 시도
        let matched = false;
        for (let len = 4; len >= 2; len--) {
            if (i + len <= text.length) {
                const candidate = text.slice(i, i + len);
                if (koreanDict[candidate]) {
                    tokens.push(candidate);
                    i += len;
                    matched = true;
                    break;
                }
            }
        }
        // 매칭 안 되면 한 글자씩
        if (!matched) {
            tokens.push(text[i]);
            i++;
        }
    }
    return tokens;
}

export async function POST(req: NextRequest) {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 });

    const tokens = tokenize(text.trim());

    const result = tokens.map((token: string) => ({
        char: token,
        pinyin: pinyin(token, { toneType: 'symbol', separator: ' ' }),
        meaning: getMeaning(token),
    }));

    return NextResponse.json({ result });
}