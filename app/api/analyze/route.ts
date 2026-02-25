import { NextRequest, NextResponse } from 'next/server';
import { pinyin } from 'pinyin-pro';

export async function POST(req: NextRequest) {
    const { text } = await req.json();

    if (!text) {
        return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const chars = text.split('');



    const result = chars.map((char: string) => ({
        char,
        pinyin: pinyin(char, { toneType: 'symbol' }),
        meaning: koreanDict[char] ?? null,
    }));

    return NextResponse.json({ result });
}

import { koreanDict } from '@/lib/koreanDict';
