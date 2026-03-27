export const DEFAULT_ANTHROPIC_MODELS = [
  "claude-sonnet-4-6",
  "claude-opus-4-6",
  "claude-haiku-4-5",
];

export const RUN_HISTORY_LIMIT = 100;

export const BEST_PRACTICES = [
  "Use XML tags heavily: <instructions>, <context>, <examples>, <input>, <output_format>.",
  "Keep instructions clearly separated from raw data or examples.",
  "Few-shot examples work best when wrapped in their own tags.",
  "Specify the output format explicitly. JSON inside XML is fine.",
  "Encourage structured reasoning for complex tasks and ask for a self-check when needed.",
  "Claude now tends to do better with direct formatting constraints than assistant prefills.",
];

export const XML_TEMPLATES: Record<string, string> = {
  "Base XML": `<instructions>
Explain the task in numbered steps.
</instructions>

<context>
Add any business context or constraints here.
</context>

<input>
{{INPUT}}
</input>

<output_format>
Describe the exact output schema here.
</output_format>`,
  "Few-shot XML": `<instructions>
Follow the examples and return only the requested format.
</instructions>

<examples>
  <example>
    <input>example input</input>
    <output>example output</output>
  </example>
</examples>

<input>
{{INPUT}}
</input>`,
  "JSON in XML": `<instructions>
Return valid JSON only inside the <final_json> tag.
</instructions>

<output_format>
<final_json>{"field": "value"}</final_json>
</output_format>

<input>
{{INPUT}}
</input>`,
};
