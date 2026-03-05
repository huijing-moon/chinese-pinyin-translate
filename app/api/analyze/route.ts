import { NextRequest, NextResponse } from 'next/server';
import { pinyin } from 'pinyin-pro';
import { koreanDict } from '@/lib/koreanDict';
import { getCedictMeaning } from '@/lib/cedict';
import Anthropic from '@anthropic-ai/sdk';
import {getLearnedMeaning, saveLearned} from "@/lib/learnedDict";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const cache: Record<string, string> = {};

async function getMeaning(word: string): Promise<string | null> {
    // 1순위: 한국어 사전
    if (koreanDict[word]) return koreanDict[word];

    // 2순위: CC-CEDICT
    const cedict = getCedictMeaning(word);
    if (cedict) return cedict;


    // learned.json 확인
    const learned = getLearnedMeaning(word);
    if (learned) return learned;

    // Claude API 호출 후 저장
    try {
        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 50,
            messages: [{
                role: 'user',
                content: `한자 "${word}"의 한국어 뜻을 5글자 이내로만 답해. 설명 없이 뜻만. 예: "먹다" 또는 "사랑하다"`
            }]
        });
        const meaning = (message.content[0] as { text: string }).text.trim();
        saveLearned(word, meaning);
        return meaning;
    } catch {
        return null;
    }

}

//ai 호출
async function tokenizeWithAI(text: string): Promise<string[]> {
    try {
        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 200,
            messages: [{
                role: 'user',
                content: `중국어 문장을 단어 단위로 나눠서 JSON 배열로만 반환해. 설명 없이 배열만.
예시: "你好吗" → ["你好", "吗"]
문장: "${text}"`
            }]
        });
        const raw = (message.content[0] as { text: string }).text.trim();
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : text.split('');
    } catch {
        // 실패하면 한 글자씩 폴백
        return text.split('');
    }
}

export async function POST(req: NextRequest) {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 });

    const tokens = await tokenizeWithAI(text.trim());

    const result = await Promise.all(
        tokens.map(async (token: string) => ({
            char: token,
            pinyin: pinyin(token, { toneType: 'symbol', separator: ' ' }),
            meaning: await getMeaning(token),
        }))
    );

    return NextResponse.json({ result });
}