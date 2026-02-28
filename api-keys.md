### API keys

In .env you can find the following API keys should you need them.

They are all correct and tested.

```
OPENROUTER_API_KEY=""
```

The best LLMs to use through OpenRouter are currently:

- For simple tasks: `deepseek/deepseek-v3.2`
- For SOTA english language writing: `moonshotai/kimi-k2-thinking`
- For SOTA tool-calling performance and instruction following: `anthropic/claude-sonnet-4.5`
- Best cheap model able to use image inputs: `google/gemini-2.5-flash`

If you are using LLMs to retrieve data that will eventually be structured, you must use the Structured Outputs feature.

More on this in docs/api-docs.
