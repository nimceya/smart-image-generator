export async function enhancePrompt(theme) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: "openai/gpt-4o-mini",

        messages: [
          {
            role: "system",
            content:
              "You are an expert AI image prompt engineer. Transform simple user ideas into detailed image-generation prompts. Return only the enhanced prompt, with no explanation.",
          },
          {
            role: "user",
            content: `Enhance this image idea:

${theme}

Include:
- subject
- environment
- lighting
- composition
- atmosphere
- colors
- important visual details

Keep it suitable for an AI image generator.`,
          },
        ],

        temperature: 0.8,
        max_completion_tokens: 300,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || "Prompt enhancement failed"
    );
  }

  return result.choices[0].message.content.trim();
}