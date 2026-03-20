import { Chapter, Exercise } from "./schema";

export const chapters: Chapter[] = [
  // ─── BEGINNER ──────────────────────────────────────────
  {
    slug: "basic-prompt-structure",
    title: "Basic Prompt Structure",
    difficulty: "beginner",
    concepts: ["Messages API formatting", "User/assistant roles", "System prompts"],
    lessonContent: `
## How Claude Reads Your Prompts

Every interaction with Claude happens through the **Messages API**. You send a list of messages, each with a **role** (\`user\` or \`assistant\`) and **content**.

\`\`\`json
{
  "messages": [
    { "role": "user", "content": "Count to three." }
  ]
}
\`\`\`

### System Prompts

A **system prompt** sits outside the message list and sets the overall context, personality, or rules for the conversation. Think of it as stage directions for Claude before the curtain goes up.

\`\`\`json
{
  "system": "You are a concise assistant. Reply in as few words as possible.",
  "messages": [
    { "role": "user", "content": "What is the capital of France?" }
  ]
}
\`\`\`

### Key Takeaways

- Claude's behavior is shaped by the **system prompt** plus the sequence of **user** and **assistant** messages.
- Being explicit about what you want in the very first message sets the tone for the rest of the conversation.
- The system prompt is the right place for persistent rules, tone, or persona — not the user message.
    `,
    exercises: [
      {
        id: "1.1",
        title: "Counting to Three",
        description:
          "Write a prompt that makes Claude count to three. The response should contain the numbers 1, 2, and 3 in sequence.",
        task: "Using proper user message formatting, write a prompt that gets Claude to output exactly '1, 2, 3' or equivalent counting to three.",
        starterPrompt: "",
        evaluationType: "string_match",
        successCriteria:
          "Response must contain Claude counting to three (e.g., '1', '2', '3' appearing in sequence).",
        hints: [
          "Be direct — tell Claude exactly what you want it to do.",
          "Try: 'Count to three, outputting only the numbers separated by commas.'",
        ],
        modelAnswer:
          "Count to three. Output only the numbers separated by commas, with no other text.",
      },
      {
        id: "1.2",
        title: "System Prompt Basics",
        description:
          "Use a system prompt to change how Claude responds. Write both a system prompt and a user message to see the difference a system prompt makes.",
        task: "Write a system prompt that makes Claude respond to any question in exactly one sentence. Then ask Claude 'Explain how the internet works.'",
        evaluationType: "behavioral_check",
        successCriteria:
          "The system prompt must set a behavioral constraint (e.g., one-sentence replies). Claude's response must reflect the constraint.",
        hints: [
          "System prompts set persistent rules — use them for tone, length, or style constraints.",
          "Be specific: 'Always respond in exactly one sentence.' is better than 'Be brief.'",
        ],
        modelAnswer:
          'System prompt: "Always respond in exactly one sentence, no matter how complex the question."\n\nUser message: "Explain how the internet works."',
      },
    ],
  },
  {
    slug: "being-clear-and-direct",
    title: "Being Clear and Direct",
    difficulty: "beginner",
    concepts: ["Specificity", "Eliminating ambiguity", "Constraining output"],
    prerequisites: ["basic-prompt-structure"],
    lessonContent: `
## The "New Employee" Mental Model

Think of Claude as a brilliant new hire on their first day. They're smart and capable, but they don't know your norms, preferences, or unspoken expectations. **The more precisely you explain what you want, the better the result.**

### Golden Rule

> Show your prompt to a colleague with minimal context. If they'd be confused about what to do, Claude will be too.

### Be Specific About Output

Instead of "tell me about basketball," try "Name one basketball player. Output only the player's full name with no other text."

### Tell Claude What TO Do

Positive instructions ("Output only the name") work better than negative ones ("Don't add any explanation"). Claude follows directives more reliably than prohibitions.

### Key Takeaways

- Ambiguity is the enemy of good prompting. Remove every possible source of misinterpretation.
- Constrain the output format explicitly when you need a specific shape.
- Positive instructions > negative instructions.
    `,
    exercises: [
      {
        id: "2.1",
        title: "No Equivocation",
        description:
          'Modify the prompt so Claude outputs ONLY the name of one specific basketball player — no other words, punctuation, or explanation.',
        task: 'Starting from "Who is the best basketball player of all time?", rewrite the prompt so Claude responds with exactly one player name and nothing else.',
        starterPrompt: "Who is the best basketball player of all time?",
        evaluationType: "string_match",
        successCriteria:
          "Response must be ONLY a player name (e.g., 'Michael Jordan') with no additional words, explanations, or punctuation.",
        hints: [
          "Be extremely explicit about the constraint: only the name, nothing else.",
          "Tell Claude what TO do rather than what NOT to do.",
          'Try: "...respond with only the player\'s full name. No other text."',
        ],
        modelAnswer:
          "Who is the best basketball player of all time? Respond with only the player's full name. No other words, punctuation, or explanation.",
      },
      {
        id: "2.2",
        title: "Haiku Without Preamble",
        description:
          'Write a prompt that makes Claude produce a haiku that starts immediately with the poem — no "Here is a haiku" or "Sure!" preamble.',
        task: "Get Claude to write a haiku about the ocean that goes directly into the poem without any introductory text.",
        evaluationType: "structural_check",
        successCriteria:
          "Response must start directly with the haiku content — no preamble like 'Here is a haiku', 'Sure!', or any introductory text.",
        hints: [
          "Explicitly instruct Claude to skip preamble and go straight to the poem.",
          "Try: 'Write a haiku about the ocean. Output only the haiku itself, starting directly with the first line.'",
        ],
        modelAnswer:
          "Write a haiku about the ocean. Start your response directly with the first line of the poem. Do not include any introductory text, titles, or commentary.",
      },
    ],
  },
  {
    slug: "assigning-roles",
    title: "Assigning Roles",
    difficulty: "beginner",
    concepts: ["System prompts for role assignment", "Persona adoption", "Tone and expertise control"],
    prerequisites: ["being-clear-and-direct"],
    lessonContent: `
## Why Roles Matter

Assigning Claude a role via the system prompt focuses its behavior, tone, vocabulary, and depth. Even a single sentence changes the output significantly.

### Where to Put the Role

The role belongs in the **system prompt**, not the user message. This keeps the role persistent across the conversation.

\`\`\`
System: "You are a grumpy but lovable pirate captain."
User: "What's the weather like today?"
\`\`\`

### Specific > Generic

Vague roles produce vague differences. Compare:
- Weak: *"You are an expert."*
- Strong: *"You are a senior tax accountant with 20 years of experience at a Big Four firm, specializing in international corporate tax law."*

### Key Takeaways

- Roles shape tone, vocabulary, depth, and perspective.
- Place the role in the system prompt, not the user message.
- The more specific the role, the better the results.
    `,
    exercises: [
      {
        id: "3.1",
        title: "Role-Based Response Style",
        description:
          "Use a system prompt to assign Claude a specific persona, then ask a question. The response should clearly reflect the assigned role.",
        task: "Assign Claude the role of a cheerful kindergarten teacher. Then ask: 'Why is the sky blue?' The answer should be simple, warm, and age-appropriate.",
        evaluationType: "behavioral_check",
        successCriteria:
          "Claude's response must clearly reflect the kindergarten teacher persona: simple language, warm tone, age-appropriate explanation.",
        hints: [
          "Place the role in the system prompt, not the user prompt.",
          "Be specific about the persona — 'cheerful kindergarten teacher who explains things to 5-year-olds' is better than 'a teacher'.",
        ],
        modelAnswer:
          'System prompt: "You are a cheerful kindergarten teacher who explains things to 5-year-olds. Use simple words, a warm and encouraging tone, and short sentences."\n\nUser message: "Why is the sky blue?"',
      },
      {
        id: "3.2",
        title: "Expert Role for Technical Depth",
        description:
          "Assign Claude a domain expert role to improve the quality and depth of a technical response.",
        task: 'Use role prompting to make Claude respond as a senior security engineer explaining the concept of "zero trust architecture" with appropriate depth and jargon.',
        evaluationType: "behavioral_check",
        successCriteria:
          "Response should demonstrate domain expertise through use of appropriate jargon, depth of analysis, and confident tone matching a senior security engineer.",
        hints: [
          "Specific roles work better than generic ones.",
          "Try: 'You are a senior security engineer with 15 years of experience in enterprise infrastructure.'",
        ],
        modelAnswer:
          'System prompt: "You are a senior security engineer with 15 years of experience designing enterprise security architectures. You speak with technical precision and assume your audience has a working knowledge of networking and security concepts."\n\nUser message: "Explain zero trust architecture — its core principles, how it differs from perimeter-based security, and the key challenges in adopting it."',
      },
    ],
  },

  // ─── INTERMEDIATE ──────────────────────────────────────
  {
    slug: "separating-data-and-instructions",
    title: "Separating Data from Instructions",
    difficulty: "intermediate",
    concepts: ["XML tags as delimiters", "Variable substitution", "Data/instruction separation"],
    prerequisites: ["assigning-roles"],
    lessonContent: `
## Why Separation Matters

When your prompt mixes instructions and data, Claude can confuse one for the other — especially with longer inputs. **XML tags** cleanly delineate what's data and what's an instruction.

### XML Tags in Prompts

Claude was trained to recognize XML tags as a prompt-organizing mechanism. Use descriptive tag names:

\`\`\`
Summarize the following article in two sentences.

<article>
Climate change is accelerating at an unprecedented rate...
</article>
\`\`\`

### Variable Substitution

In production, you often reuse the same prompt template with different data. Use placeholders like \`{VARIABLE}\` inside tags:

\`\`\`
Translate the following text from {SOURCE_LANGUAGE} to {TARGET_LANGUAGE}.

<text>
{INPUT_TEXT}
</text>
\`\`\`

### Key Takeaways

- Use XML tags (\`<document>\`, \`<text>\`, \`<email>\`, \`<data>\`) to separate data from instructions.
- Place the instruction **outside** the data tags.
- Variable placeholders + XML tags = reusable prompt templates for production systems.
    `,
    exercises: [
      {
        id: "4.1",
        title: "XML Tag Separation",
        description:
          "Rewrite a prompt that mixes instructions and data into one that uses XML tags to cleanly separate them.",
        task: 'The original prompt is: "The following email from a customer says they are unhappy with the product quality and want a refund. Categorize this as complaint, question, or praise." Rewrite this using XML tags to separate the email data from the classification instruction.',
        evaluationType: "hybrid",
        successCriteria:
          "Prompt must use XML tags (e.g., <email>) to separate data from instructions. The instruction must be outside the data tags.",
        hints: [
          "Use descriptive tag names like <email>, <document>, or <text>.",
          "Place the instruction outside the data tags.",
          "The data inside the tags should only be the email content.",
        ],
        modelAnswer:
          'Categorize the following customer email as one of: complaint, question, or praise. Output only the category.\n\n<email>\nI am very unhappy with the product quality and want a full refund. The item arrived damaged and does not match the description.\n</email>',
      },
      {
        id: "4.2",
        title: "Variable Substitution with XML Tags",
        description:
          "Create a prompt template that uses variable placeholders inside XML tags, allowing you to swap in different data while keeping the instruction constant.",
        task: "Write a reusable prompt template that translates text between languages. Use {SOURCE_LANG}, {TARGET_LANG}, and {TEXT} as placeholders, with the text wrapped in XML tags.",
        evaluationType: "structural_check",
        successCriteria:
          "Prompt must use XML tags and variable substitution with {PLACEHOLDER} syntax. The template should work correctly with different input values.",
        hints: [
          "This mirrors real production prompt engineering where templates are reused across many inputs.",
          "The structure should be: instruction mentioning the languages → XML-wrapped text with placeholder.",
        ],
        modelAnswer:
          "Translate the following text from {SOURCE_LANG} to {TARGET_LANG}. Output only the translation, nothing else.\n\n<text>\n{TEXT}\n</text>",
      },
    ],
  },
  {
    slug: "formatting-output",
    title: "Formatting Output & Speaking for Claude",
    difficulty: "intermediate",
    concepts: ["Output format control", "XML output tags", "Response steering"],
    prerequisites: ["separating-data-and-instructions"],
    lessonContent: `
## Controlling What Claude Outputs

Sometimes you need Claude's response in a specific format — JSON, a numbered list, XML-wrapped sections, or just a single word. Claude is highly steerable if you're explicit about the desired shape.

### XML Output Tags

Just as you use XML tags for input, you can instruct Claude to wrap its output in tags:

\`\`\`
Write a haiku about cats. Wrap your response in <poem> tags.
\`\`\`

This makes parsing programmatic output much easier.

### Multiple Structured Outputs

When you need several distinct pieces, use separate tags:

\`\`\`
Analyze this text. Provide:
- A one-sentence summary in <summary> tags
- The overall sentiment in <sentiment> tags
- Three key themes in <themes> tags
\`\`\`

### A Note on Prefilling (Historical)

Older Claude models supported "prefilling" the assistant response to steer output. Starting with Claude 4.6, this is no longer supported. Instead, use direct instructions and XML output tags — they're more reliable and future-proof.

### Key Takeaways

- Explicitly specify the output format you want.
- Use XML tags for structured, parseable output.
- For multiple outputs, assign each a distinct tag.
    `,
    exercises: [
      {
        id: "5.1",
        title: "Steering a Specific Argument",
        description:
          "Write a prompt that makes Claude argue that Stephen Curry is the best basketball player of all time. Use clear instructions to steer the response direction.",
        task: 'Given the topic "Who is the best basketball player of all time?", write a prompt that compels Claude to make a detailed argument specifically for Stephen Curry. Do not rely on prefilling — use instructions only.',
        evaluationType: "llm_rubric",
        successCriteria:
          "Claude's response must argue that Stephen Curry is the best basketball player, driven by clear instructions in the prompt.",
        hints: [
          "Be direct: tell Claude which player to argue for and that it should present a compelling case.",
          "You can frame it as a debate exercise: 'Make the strongest possible case that...'",
        ],
        modelAnswer:
          "Make the strongest possible argument that Stephen Curry is the greatest basketball player of all time. Present at least three compelling reasons, addressing his shooting, impact on the game, and championships. Be persuasive and specific with statistics or achievements where possible.",
      },
      {
        id: "5.2",
        title: "XML Tags for Multiple Poems",
        description:
          "Write a prompt that makes Claude produce exactly two haikus, each clearly separated using XML tags.",
        task: "Write a prompt that produces two haikus about the ocean. Each haiku should be wrapped in its own XML tag so the boundary between poems is unambiguous.",
        evaluationType: "structural_check",
        successCriteria:
          "Output must contain exactly two haikus, each wrapped or separated by XML tags (e.g., <haiku1>, <haiku2> or <poem> tags) making the boundary clear.",
        hints: [
          "Tell Claude to use specific XML tags to wrap each poem.",
          "Be explicit about the number: 'Write exactly two haikus'.",
        ],
        modelAnswer:
          "Write exactly two haikus about the ocean. Wrap each haiku in its own <haiku> tag, like this:\n\n<haiku>\n[first haiku]\n</haiku>\n\n<haiku>\n[second haiku]\n</haiku>\n\nOutput only the tagged haikus, no other text.",
      },
      {
        id: "5.3",
        title: "Two Haikus, Two Animals",
        description:
          "Create a prompt template with two variable placeholders that produces one haiku per animal, clearly separated with XML tags.",
        task: "Write a prompt template using {ANIMAL1} and {ANIMAL2} as placeholders. The output should be two haikus — one per animal — each wrapped in labeled XML tags.",
        evaluationType: "structural_check",
        successCriteria:
          "Output must contain exactly two haikus, each about the correct substituted animal, with clear XML tag separation. The prompt must use {ANIMAL1} and {ANIMAL2} placeholders.",
        hints: [
          "Combine XML tag separation (Chapter 4) with formatting control.",
          "Use variables like {ANIMAL1} and {ANIMAL2} in the prompt template.",
        ],
        modelAnswer:
          "Write exactly two haikus — one about {ANIMAL1} and one about {ANIMAL2}. Wrap each in labeled tags:\n\n<haiku animal=\"{ANIMAL1}\">\n[haiku about {ANIMAL1}]\n</haiku>\n\n<haiku animal=\"{ANIMAL2}\">\n[haiku about {ANIMAL2}]\n</haiku>\n\nOutput only the tagged haikus.",
      },
    ],
  },
  {
    slug: "precognition-thinking-step-by-step",
    title: "Precognition (Thinking Step by Step)",
    difficulty: "intermediate",
    concepts: ["Chain-of-thought prompting", "Thinking tags", "Reasoning before answering"],
    prerequisites: ["formatting-output"],
    lessonContent: `
## Let Claude Think Before Answering

For complex tasks — classification, math, analysis — Claude performs better when it reasons through the problem before giving a final answer. This is called **chain-of-thought prompting**.

### The Scratchpad Pattern

Ask Claude to work through its reasoning in \`<thinking>\` tags, then give the final answer in \`<answer>\` tags:

\`\`\`
Classify this support email. First, think through the reasoning 
in <thinking> tags. Then give your final classification in <answer> tags.
\`\`\`

This separation has two benefits:
1. **Better accuracy** — reasoning first leads to better conclusions.
2. **Inspectable logic** — you can see *why* Claude made a decision.

### When to Use It

- Classification tasks with ambiguous cases
- Math or logic problems
- Multi-step analysis
- Any task where you want to audit the reasoning

### Key Takeaways

- Ask Claude to think step-by-step in \`<thinking>\` tags before answering.
- Put the final answer in \`<answer>\` tags for clean extraction.
- This pattern dramatically improves accuracy on complex or ambiguous tasks.
    `,
    exercises: [
      {
        id: "6.1",
        title: "Email Classification",
        description:
          "Write a prompt that classifies customer support emails into categories. Claude should output the correct classification including the letter (A-D) and category name, and ONLY that.",
        task: 'Write a prompt that classifies emails into: (A) Pre-sale question, (B) Broken or defective item, (C) Billing question, (D) Other. Test it mentally against: "My Mixmaster4000 is producing a strange noise and smells smoky. I need a replacement." (expected: B)',
        evaluationType: "hybrid",
        successCriteria:
          "Prompt must instruct Claude to classify emails into categories A-D. The approach should encourage reasoning before answering.",
        hints: [
          "Use chain-of-thought: let Claude think in <thinking> tags before answering.",
          "Use <answer> tags to separate reasoning from the final classification.",
          "Be explicit about the output format for the answer.",
        ],
        modelAnswer:
          'Classify the following customer email into one of these categories:\n(A) Pre-sale question\n(B) Broken or defective item\n(C) Billing question\n(D) Other\n\nFirst, reason through your classification in <thinking> tags. Consider what the customer is describing and which category best fits. Then output ONLY the letter and category name in <answer> tags.\n\n<email>\n{EMAIL_TEXT}\n</email>',
      },
      {
        id: "6.2",
        title: "Exact Classification Formatting",
        description:
          "Refine the output of the email classifier so the answer is wrapped in <answer> tags containing only the letter. For example: <answer>B</answer>.",
        task: "Modify your email classification prompt so Claude wraps JUST the letter of the correct classification in <answer></answer> tags. The grading checks for exact strings like <answer>B</answer>.",
        evaluationType: "hybrid",
        successCriteria:
          "The prompt must produce output containing <answer>X</answer> where X is the correct letter. No other content inside the answer tags.",
        hints: [
          "Use XML output tags to constrain the format.",
          "Combine thinking tags for reasoning with answer tags for output.",
          "Show Claude the exact format you expect: '<answer>B</answer>'.",
        ],
        modelAnswer:
          'Classify the following customer email into one of these categories:\n(A) Pre-sale question\n(B) Broken or defective item\n(C) Billing question\n(D) Other\n\nFirst, reason through your classification in <thinking> tags. Then output ONLY the category letter inside <answer> tags, like this: <answer>B</answer>\n\n<email>\n{EMAIL_TEXT}\n</email>',
      },
    ],
  },
  {
    slug: "using-examples-few-shot",
    title: "Using Examples (Few-Shot Prompting)",
    difficulty: "intermediate",
    concepts: ["Few-shot prompting", "Example selection", "Format consistency through examples"],
    prerequisites: ["precognition-thinking-step-by-step"],
    lessonContent: `
## Show, Don't Just Tell

Examples are one of the most reliable ways to steer Claude's output format, tone, and structure. A few well-crafted examples — known as **few-shot prompting** — can dramatically improve accuracy and consistency.

### How to Structure Examples

Wrap examples in \`<example>\` tags so Claude can distinguish them from instructions:

\`\`\`
Classify the email into a category. Here are some examples:

<example>
Email: "Do you ship internationally?"
Category: Pre-sale question
</example>

<example>
Email: "My order arrived broken."
Category: Broken or defective item
</example>

Now classify this email:
<email>{NEW_EMAIL}</email>
\`\`\`

### Best Practices

- **3-5 examples** hit the sweet spot for most tasks.
- Make examples **diverse** — cover different categories, edge cases, and tones.
- Make examples **consistent** — use the exact output format you want.
- Wrap them in \`<example>\` tags so Claude knows they're demonstrations, not instructions.

### Key Takeaways

- Few-shot examples are the most reliable way to lock in a specific output format.
- Diverse examples prevent Claude from overfitting to one pattern.
- The format of your examples becomes the format of the output.
    `,
    exercises: [
      {
        id: "7.1",
        title: "Few-Shot Email Classification",
        description:
          "Redo the email classification exercise, but this time use few-shot examples to demonstrate the desired input/output pattern.",
        task: "Write a prompt for email classification (categories A-D) that includes 2-3 few-shot examples showing the exact format you want. The last character of Claude's output should be the category letter.",
        evaluationType: "hybrid",
        successCriteria:
          "Prompt must include few-shot examples in <example> tags demonstrating the classification pattern. The output format must be consistent with the examples.",
        hints: [
          "Wrap examples in <example> tags.",
          "Show 2-3 diverse examples covering different categories.",
          "Make the examples mirror the exact output format you want.",
        ],
        modelAnswer:
          'Classify customer emails into one of these categories:\n(A) Pre-sale question\n(B) Broken or defective item\n(C) Billing question\n(D) Other\n\nHere are some examples:\n\n<example>\nEmail: "Can the Mixmaster 4000 handle frozen fruit?"\nCategory: A\n</example>\n\n<example>\nEmail: "My blender arrived with a crack in the lid and the motor sparks."\nCategory: B\n</example>\n\n<example>\nEmail: "I was charged twice on my credit card for order #1234."\nCategory: C\n</example>\n\nNow classify this email. Output only the category letter.\n\n<email>\n{EMAIL_TEXT}\n</email>',
      },
    ],
  },

  // ─── ADVANCED ──────────────────────────────────────────
  {
    slug: "avoiding-hallucinations",
    title: "Avoiding Hallucinations",
    difficulty: "advanced",
    concepts: [
      "Giving Claude an out",
      "Citation-based answers",
      "Evidence gathering",
      "Scratchpad technique",
    ],
    prerequisites: ["using-examples-few-shot"],
    lessonContent: `
## Why Claude Hallucinates

Claude wants to be helpful. When asked a question with a false premise or insufficient information, it may fabricate a plausible-sounding answer rather than admitting uncertainty. This is called **hallucination**.

### Strategy 1: Give Claude an Out

Explicitly give Claude permission to say "I don't know" or "That's not correct":

\`\`\`
Answer the question below. If the question contains a false premise, 
point that out instead of answering. If you don't have enough 
information to answer confidently, say so.
\`\`\`

### Strategy 2: Quote First, Then Answer

For document-based questions, ask Claude to extract relevant quotes **before** answering. This is the **scratchpad technique**:

\`\`\`
Read the document below. In <quotes> tags, extract any passages 
relevant to the question. Then, in <answer> tags, answer based 
only on those quotes. If the quotes don't contain the answer, 
say "Not found in the document."
\`\`\`

### Key Takeaways

- Always give Claude an out for questions with false premises or missing info.
- For document QA, make Claude quote evidence first, then reason from quotes.
- The scratchpad technique (quote → reason → answer) dramatically reduces hallucination.
    `,
    exercises: [
      {
        id: "8.1",
        title: "Correcting a False Premise",
        description:
          'Fix a hallucination issue by giving Claude an out. The question claims Renaissance is Beyoncé\'s eighth studio album — but it\'s actually her seventh.',
        task: 'Write a prompt for the question "What was the critical reception of Renaissance, Beyoncé\'s eighth studio album?" that allows Claude to correct the false premise rather than playing along with it.',
        evaluationType: "llm_rubric",
        successCriteria:
          "Claude must NOT agree with the false premise. It should correct the claim (Renaissance is the 7th album, not 8th) or indicate the premise is incorrect.",
        hints: [
          "Add language like 'If the question contains a false premise, point that out instead of answering.'",
          "Give Claude permission to say 'That's not correct'.",
        ],
        modelAnswer:
          "Answer the following question. If the question contains a factual error or false premise, correct it before answering. Do not accept incorrect claims as true.\n\nQuestion: What was the critical reception of Renaissance, Beyoncé's eighth studio album?",
      },
      {
        id: "8.2",
        title: "Citation-Based Answers",
        description:
          "Use the scratchpad technique to make Claude extract quotes from a document before answering, reducing hallucination risk.",
        task: 'Write a prompt that answers "How much did Matterport\'s subscriber base grow?" by first extracting relevant quotes from a document into <quotes> tags, then answering in <answer> tags based only on those quotes.',
        evaluationType: "hybrid",
        successCriteria:
          "Prompt must use the scratchpad/quote-first pattern: extract relevant quotes in tags, then answer based on those quotes only.",
        hints: [
          "Use the scratchpad technique: ask Claude to first extract quotes, then answer based on them.",
          "Include explicit instructions for what to do if the document doesn't contain the answer.",
        ],
        modelAnswer:
          'Read the document below carefully.\n\n<document>\n{DOCUMENT_TEXT}\n</document>\n\nQuestion: How much did Matterport\'s subscriber base grow?\n\nFirst, in <quotes> tags, extract the most relevant passages from the document that relate to this question. Then, in <answer> tags, answer the question based ONLY on the extracted quotes. If the quotes don\'t contain enough information to answer, say "Not found in the document."',
      },
      {
        id: "8.3",
        title: "Detecting Unanswerable Questions",
        description:
          "Write a prompt that correctly identifies when a specific piece of information is not available in the provided document.",
        task: 'Write a prompt asking "What was Matterport\'s subscriber base on May 31, 2020?" against a document that does not contain this specific date. Claude should recognize the info isn\'t available.',
        evaluationType: "llm_rubric",
        successCriteria:
          "Claude must indicate that the document does not contain subscriber information for the specific date of May 31, 2020, rather than making up a number.",
        hints: [
          "Use the evidence-gathering technique: quote first, then assess.",
          "The scratchpad should reveal that no quote matches the exact date requested.",
        ],
        modelAnswer:
          'Read the document below carefully.\n\n<document>\n{DOCUMENT_TEXT}\n</document>\n\nQuestion: What was Matterport\'s subscriber base on the precise date of May 31, 2020?\n\nFirst, in <quotes> tags, extract any passages that mention subscriber numbers or the date May 31, 2020. Then, in <answer> tags, answer the question based ONLY on what you found. If the exact information requested is not in the document, clearly state that it is not available rather than estimating or guessing.',
      },
    ],
  },
  {
    slug: "complex-prompts",
    title: "Building Complex Prompts",
    difficulty: "advanced",
    concepts: [
      "Multi-technique prompts",
      "Production-grade prompting",
      "Industry-specific applications",
    ],
    prerequisites: ["avoiding-hallucinations"],
    lessonContent: `
## Combining Everything

Real-world prompts combine multiple techniques: role assignment, XML structuring, data separation, output formatting, chain-of-thought, few-shot examples, and hallucination guardrails.

### The Anatomy of a Production Prompt

1. **System prompt**: Role assignment + persistent rules
2. **Context section**: Background data wrapped in XML tags
3. **Examples section**: Few-shot examples in \`<example>\` tags
4. **Task instructions**: Clear, specific directives
5. **Output format**: Exact shape of the expected response
6. **Guardrails**: What to do in edge cases (missing data, ambiguity, out-of-scope questions)

### Building It Up

Start simple, then layer:
1. Write the core instruction.
2. Add role context.
3. Separate data with XML tags.
4. Specify output format.
5. Add examples for ambiguous cases.
6. Add guardrails for edge cases.

### Key Takeaways

- Production prompts layer multiple techniques; no single trick is enough.
- Build prompts iteratively — start with the core instruction and add structure.
- Always include guardrails for what to do when things go wrong.
    `,
    exercises: [
      {
        id: "9.1",
        title: "Customer Service Chatbot",
        description:
          "Build a complete system prompt for a customer service chatbot that combines techniques from all previous chapters.",
        task: "Design a full system prompt for a customer support chatbot that handles product inquiries, complaints, and billing questions. It must include: role assignment, XML structuring, output format, chain-of-thought for complex queries, and hallucination guardrails.",
        evaluationType: "llm_rubric",
        successCriteria:
          "Prompt must incorporate: (1) role assignment, (2) XML tags for structure, (3) clear instructions, (4) output format specification, (5) chain-of-thought reasoning, (6) hallucination guardrails.",
        hints: [
          "Start with the role, then add instructions, then examples, then guardrails.",
          "Use XML tags to organize each section of the prompt.",
          "Include what to do when the chatbot doesn't know the answer.",
        ],
        modelAnswer:
          'System prompt:\n"You are a friendly, professional customer support agent for TechGadgets Inc. You help customers with product questions, complaints, and billing issues.\n\nWhen responding to a customer:\n1. First, identify the type of inquiry in <classification> tags: product_question, complaint, billing, or other.\n2. Think through your response in <thinking> tags, considering what information you need and what policies apply.\n3. Provide your response in <response> tags using a warm, professional tone.\n\nRules:\n- Only reference products and policies from the <product_catalog> and <policies> sections below.\n- If you don\'t have enough information to help, say so honestly and offer to escalate.\n- Never make up product features, prices, or policies.\n- For complaints about defective items, always offer a replacement or refund per our policy.\n\n<product_catalog>\n{CATALOG}\n</product_catalog>\n\n<policies>\n{POLICIES}\n</policies>"',
      },
      {
        id: "9.2",
        title: "Legal Document Analyzer",
        description:
          "Build a production-grade prompt for legal document analysis that extracts key information and flags risks.",
        task: "Create a prompt for analyzing legal contracts. It should extract key clauses, flag potential risks, and produce structured output — all while including appropriate disclaimers.",
        evaluationType: "llm_rubric",
        successCriteria:
          "Prompt must handle legal document input with XML-structured output, include appropriate disclaimers, use evidence-gathering techniques, and produce consistent structured results.",
        hints: [
          "Legal use cases especially benefit from citation/evidence-gathering techniques.",
          "Always include appropriate 'not legal advice' guardrails.",
          "Use XML tags for each extracted section (parties, terms, obligations, risks).",
        ],
        modelAnswer:
          'System prompt:\n"You are a legal document analyst. You help users understand contracts by extracting key information and flagging potential concerns. You are NOT a lawyer and your analysis is NOT legal advice — always recommend consulting a qualified attorney for legal decisions."\n\nUser prompt:\nAnalyze the following contract. For each section, extract the relevant information and wrap it in the specified XML tags.\n\n<contract>\n{CONTRACT_TEXT}\n</contract>\n\nProvide your analysis in this structure:\n<analysis>\n  <parties>[List all parties and their roles]</parties>\n  <key_terms>[Key dates, durations, renewal terms]</key_terms>\n  <obligations>[What each party must do]</obligations>\n  <risks>[Potential risks, unusual clauses, or red flags — quote the specific language]</risks>\n  <summary>[2-3 sentence plain-English summary]</summary>\n</analysis>\n\nFor <risks>, quote the exact contract language that concerns you and explain why in plain English. If no risks are apparent, say so.',
      },
      {
        id: "9.3",
        title: "Financial Report Analyzer",
        description:
          "Build a complex prompt for financial analysis that extracts metrics and provides structured summaries.",
        task: "Design a prompt that analyzes financial reports, extracts key metrics, and provides structured summaries with appropriate caveats about numerical accuracy.",
        evaluationType: "llm_rubric",
        successCriteria:
          "Prompt must demonstrate mastery of multiple techniques: XML structuring, role assignment, chain-of-thought for calculations, and hallucination prevention for numerical accuracy.",
        hints: [
          "Financial prompts need extra care around numerical accuracy.",
          "Use chain-of-thought for any calculations.",
          "Include examples of the exact output format for financial metrics.",
        ],
        modelAnswer:
          'System prompt:\n"You are a senior financial analyst. You extract and analyze financial data with precision. Always show your calculations step-by-step. Never estimate or round unless explicitly asked. If a number is not clearly stated in the source document, say \'not stated\' rather than calculating or guessing."\n\nUser prompt:\nAnalyze the following financial report.\n\n<report>\n{REPORT_TEXT}\n</report>\n\nProvide your analysis:\n1. In <extraction> tags, pull out all key financial metrics (revenue, profit, margins, growth rates) with exact figures and page/section references.\n2. In <calculations> tags, show step-by-step work for any derived metrics (YoY growth, margin percentages, etc.).\n3. In <summary> tags, provide a 3-5 sentence executive summary.\n4. In <caveats> tags, note any data gaps, assumptions, or figures you could not verify.\n\nIMPORTANT: Do not fabricate any numbers. If a metric is not in the document, explicitly state it is missing.',
      },
      {
        id: "9.4",
        title: "Coding Assistant",
        description:
          "Build a prompt for a coding assistant that debugs code, explains errors, and suggests fixes with well-formatted output.",
        task: "Design a prompt for a coding assistant that takes buggy code, identifies the issue, explains it clearly, and provides a corrected version.",
        evaluationType: "llm_rubric",
        successCriteria:
          "Prompt must handle code input with proper formatting, use step-by-step reasoning for debugging, and avoid hallucinating nonexistent APIs or functions.",
        hints: [
          "Code prompts benefit heavily from few-shot examples showing input code → analysis → fix.",
          "Use XML tags to separate the code from instructions.",
          "Chain-of-thought is critical for debugging walkthroughs.",
        ],
        modelAnswer:
          'System prompt:\n"You are a senior software engineer and patient debugging partner. You explain bugs clearly and provide working fixes. Never suggest APIs, methods, or libraries that don\'t exist — if you\'re unsure whether something exists, say so."\n\nUser prompt:\nDebug the following code:\n\n<code language="{LANGUAGE}">\n{CODE}\n</code>\n\nProvide your analysis in this structure:\n1. <bug_identification> — Describe the bug in plain English. What is happening vs. what should happen?\n2. <root_cause> — Walk through the code step by step to identify exactly where and why the bug occurs.\n3. <fix> — Provide the corrected code with only the necessary changes.\n4. <explanation> — Briefly explain what you changed and why.\n\nIf the code has multiple bugs, address each one separately in order of severity.',
      },
    ],
  },

  // ─── APPENDICES ────────────────────────────────────────
  {
    slug: "chaining-prompts",
    title: "Chaining Prompts",
    difficulty: "advanced",
    concepts: ["Multi-step prompt chains", "Output-to-input piping", "Task decomposition"],
    prerequisites: ["complex-prompts"],
    lessonContent: `
## Breaking Complex Tasks into Steps

Some tasks are too complex for a single prompt. **Prompt chaining** breaks them into sequential steps where the output of one prompt becomes the input of the next.

### When to Chain

- The task has distinct phases (extract → analyze → format).
- A single prompt would be too long or complex.
- You need to validate or transform intermediate results.

### Design Principles

1. Each step should have a **narrow, well-defined task**.
2. The **output format** of step N should be designed as input for step N+1.
3. Use XML tags to structure the handoff between steps.
4. Validate intermediate results before passing them forward.

### Example Chain

\`\`\`
Step 1: Extract all dates and events from the document.
Step 2: Organize extracted events into a chronological timeline.
Step 3: Summarize the timeline into a narrative paragraph.
\`\`\`

### Key Takeaways

- Chain prompts when a single prompt would be too complex.
- Design each step's output to be the next step's input.
- Smaller, focused steps usually beat one massive prompt.
    `,
    exercises: [
      {
        id: "A1.1",
        title: "Three-Step Analysis Chain",
        description:
          "Design a multi-step prompt chain where each step feeds into the next.",
        task: "Design a three-step prompt chain for analyzing a news article: Step 1 extracts key facts, Step 2 identifies biases or missing perspectives, Step 3 writes a balanced summary. Write all three prompts, showing how the output of each feeds into the next.",
        evaluationType: "llm_rubric",
        successCriteria:
          "The chain must have three clearly defined steps with explicit handoff between them. Each step should have a narrow task and structured output that the next step consumes.",
        hints: [
          "Each step should have a narrow, well-defined task.",
          "The output format of step N should be designed as input for step N+1.",
          "Use XML tags to structure the handoff.",
        ],
        modelAnswer:
          'Step 1 prompt:\n"Extract the key facts from the following article. List each fact in <fact> tags. Include only verifiable claims, not opinions.\n\n<article>{ARTICLE}</article>"\n\nStep 2 prompt:\n"Review the following extracted facts from a news article. In <analysis> tags, identify any potential biases, missing perspectives, or one-sided framing. In <gaps> tags, list what information is missing that a reader would need for a complete picture.\n\n<facts>{STEP_1_OUTPUT}</facts>"\n\nStep 3 prompt:\n"Using the original facts and the bias analysis below, write a balanced 2-3 paragraph summary that fairly represents all perspectives and notes any significant gaps in the reporting.\n\n<facts>{STEP_1_OUTPUT}</facts>\n<analysis>{STEP_2_OUTPUT}</analysis>"',
      },
    ],
  },
  {
    slug: "tool-use",
    title: "Tool Use (Function Calling)",
    difficulty: "advanced",
    concepts: ["Tool/function definitions", "Structured tool inputs", "Tool result handling"],
    prerequisites: ["complex-prompts"],
    lessonContent: `
## Giving Claude Tools

Claude can call external tools (functions) when given their definitions. This lets Claude interact with APIs, databases, calculators, or any external system.

### How Tool Use Works

1. You define tools with a **name**, **description**, and **input schema**.
2. Claude decides when to call a tool based on the user's request.
3. Your system executes the tool and returns the result.
4. Claude incorporates the result into its response.

### Defining Good Tools

\`\`\`json
{
  "name": "get_weather",
  "description": "Get the current weather for a specific city.",
  "input_schema": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "description": "The city name, e.g., 'San Francisco'"
      }
    },
    "required": ["city"]
  }
}
\`\`\`

### Key Takeaways

- Tool descriptions should be clear and unambiguous — they guide Claude's decision to use the tool.
- Parameter descriptions matter as much as the tool description.
- Claude picks the right tool based on matching the user's intent to tool descriptions.
    `,
    exercises: [
      {
        id: "A2.1",
        title: "Defining and Using Tools",
        description:
          "Define one or more tools and write a prompt that causes Claude to call the correct tool with appropriate parameters.",
        task: "Define two tools: (1) a weather lookup tool and (2) a calendar scheduling tool. Then write a user message that should trigger the weather tool, not the calendar tool. Explain how Claude would decide which tool to use.",
        evaluationType: "llm_rubric",
        successCriteria:
          "Must include well-defined tool schemas with clear descriptions and parameter definitions. The user message should clearly map to one tool.",
        hints: [
          "Tool descriptions should be clear and unambiguous.",
          "Parameter descriptions matter — they guide Claude's input formatting.",
          "Include the full JSON schema for each tool.",
        ],
        modelAnswer:
          'Tool definitions:\n\n```json\n[\n  {\n    "name": "get_weather",\n    "description": "Get the current weather conditions and temperature for a specific city.",\n    "input_schema": {\n      "type": "object",\n      "properties": {\n        "city": { "type": "string", "description": "City name, e.g. San Francisco" },\n        "units": { "type": "string", "enum": ["celsius", "fahrenheit"], "description": "Temperature unit" }\n      },\n      "required": ["city"]\n    }\n  },\n  {\n    "name": "schedule_event",\n    "description": "Create a new calendar event with a title, date, time, and optional description.",\n    "input_schema": {\n      "type": "object",\n      "properties": {\n        "title": { "type": "string", "description": "Event title" },\n        "date": { "type": "string", "description": "Date in YYYY-MM-DD format" },\n        "time": { "type": "string", "description": "Time in HH:MM format" },\n        "description": { "type": "string", "description": "Optional event description" }\n      },\n      "required": ["title", "date", "time"]\n    }\n  }\n]\n```\n\nUser message: "What\'s the weather like in Tokyo right now?"\n\nClaude would select get_weather because the intent matches "get current weather conditions" and would call it with {"city": "Tokyo"}.',
      },
    ],
  },
  {
    slug: "search-and-retrieval",
    title: "Search & Retrieval (RAG)",
    difficulty: "advanced",
    concepts: ["RAG patterns", "Context injection", "Document grounding"],
    prerequisites: ["avoiding-hallucinations"],
    lessonContent: `
## Retrieval-Augmented Generation

**RAG** is the pattern of retrieving relevant documents, then giving them to Claude as context for answering questions. It's the backbone of most knowledge-base chatbots.

### The RAG Prompt Pattern

\`\`\`
Here are some relevant documents retrieved for the user's question.

<retrieved_documents>
  <document source="FAQ page">
    {DOCUMENT_1}
  </document>
  <document source="Product manual, p.42">
    {DOCUMENT_2}
  </document>
</retrieved_documents>

<user_question>
{QUESTION}
</user_question>

Answer the question using ONLY the information in the retrieved documents. 
Cite your sources. If the documents don't contain the answer, say so.
\`\`\`

### Key Design Decisions

1. **Grounding instruction**: Always tell Claude to answer based on the documents, not general knowledge.
2. **Citation format**: Ask for source references so users can verify.
3. **Fallback behavior**: What should Claude do when the documents don't have the answer?

### Key Takeaways

- Always instruct Claude to use only the provided context.
- Include source metadata so Claude can cite references.
- Define explicit fallback behavior for missing information.
    `,
    exercises: [
      {
        id: "A3.1",
        title: "RAG Prompt with Citations",
        description:
          "Write a prompt that takes retrieved document chunks as context and answers a user question grounded in that context, with citations.",
        task: "Write a RAG prompt template that takes 2-3 retrieved documents and a user question. Claude should answer using only the provided context, cite which document(s) it drew from, and gracefully handle cases where the answer isn't in the documents.",
        evaluationType: "llm_rubric",
        successCriteria:
          "Prompt must ground answers in provided context, include citation instructions, and define fallback behavior for missing information.",
        hints: [
          "Use XML tags to clearly delineate retrieved context from the question.",
          "Include instructions for what to do when the answer isn't in the provided context.",
          "Ask Claude to cite which document(s) each part of the answer came from.",
        ],
        modelAnswer:
          'You are a helpful assistant that answers questions using only the provided reference documents.\n\n<documents>\n  <document id="1" source="{SOURCE_1}">\n    {CONTENT_1}\n  </document>\n  <document id="2" source="{SOURCE_2}">\n    {CONTENT_2}\n  </document>\n  <document id="3" source="{SOURCE_3}">\n    {CONTENT_3}\n  </document>\n</documents>\n\n<question>\n{USER_QUESTION}\n</question>\n\nInstructions:\n1. Answer the question using ONLY information found in the documents above.\n2. After each claim, cite the source in brackets, e.g., [Document 1: FAQ page].\n3. If the documents do not contain enough information to answer the question, clearly state: "The provided documents do not contain this information." Do not use your general knowledge to fill gaps.\n4. If documents contain conflicting information, note the discrepancy and cite both sources.',
      },
    ],
  },
];

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function getExercise(
  chapterSlug: string,
  exerciseId: string
): { chapter: Chapter; exercise: Exercise } | undefined {
  const chapter = getChapter(chapterSlug);
  if (!chapter) return undefined;
  const exercise = chapter.exercises.find((e) => e.id === exerciseId);
  if (!exercise) return undefined;
  return { chapter, exercise };
}

