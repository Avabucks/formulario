import { pool } from "./db";

export async function recordAiTokenUsage({
  userId,
  provider,
  promptTokens,
  completionTokens,
  totalTokens,
}: Readonly<{
  userId: string;
  provider: string;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
}>) {
  const prompt = normalizeTokens(promptTokens);
  const completion = normalizeTokens(completionTokens);
  const total = normalizeTokens(totalTokens) || prompt + completion;

  if (total <= 0) return;

  await pool.query(
    `INSERT INTO ai_token_usage (
        user_uid,
        period_month,
        provider,
        prompt_tokens,
        completion_tokens,
        total_tokens,
        updated_at
      )
      VALUES (
        $1,
        DATE_TRUNC('month', CURRENT_DATE)::date,
        $2,
        $3,
        $4,
        $5,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_uid, period_month, provider)
      DO UPDATE SET
        prompt_tokens = ai_token_usage.prompt_tokens + EXCLUDED.prompt_tokens,
        completion_tokens = ai_token_usage.completion_tokens + EXCLUDED.completion_tokens,
        total_tokens = ai_token_usage.total_tokens + EXCLUDED.total_tokens,
        updated_at = CURRENT_TIMESTAMP`,
    [userId, provider, prompt, completion, total],
  );
}

function normalizeTokens(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.trunc(value))
    : 0;
}
