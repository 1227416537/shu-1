/** AI 伙伴称呼：把应用里 "char" 这个术语换成用户自定义的称呼（默认 char）。 */

const STORAGE_KEY = 'app_settings';
export const AI_COMPANION_TERM_DEFAULT = 'char';

const readInitialTerm = (): string => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return AI_COMPANION_TERM_DEFAULT;
    const parsed = JSON.parse(raw) as { aiCompanionTerm?: unknown };
    const term = typeof parsed?.aiCompanionTerm === 'string' ? parsed.aiCompanionTerm.trim() : '';
    return term || AI_COMPANION_TERM_DEFAULT;
  } catch {
    return AI_COMPANION_TERM_DEFAULT;
  }
};

let currentTerm = readInitialTerm();

export const getAiCompanionTerm = (): string => currentTerm;

export const setAiCompanionTerm = (term: string): void => {
  const trimmed = (term || '').trim();
  currentTerm = trimmed || AI_COMPANION_TERM_DEFAULT;
};

/** 把文本里的 char/Char 术语替换成自定义称呼（词边界匹配，不影响 character 等单词）。 */
export const applyAiCompanionTermToText = (text: string): string =>
  text.replace(/(?<![\w.{-])char(?![\w.}-])/gi, currentTerm);
