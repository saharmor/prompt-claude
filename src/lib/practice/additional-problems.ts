import { DEFAULT_INPUT_WRAPPER_TEMPLATE } from "@/lib/practice/types";

export const sampleProblemRecords = [
  {
    id: "summarize-product-p01",
    title: "Summarize a Product Review",
    difficulty: "beginner",
    description:
      "Sample exercise — prompt included. Write a prompt that takes a customer product review and produces a structured XML summary with sentiment analysis and key takeaways. Press Run Prompt to see how it works, then try tweaking the prompt or attempt a blank exercise.",
    input_format:
      "The input is a customer product review that may include praise, complaints, and specific feature mentions.",
    evaluator_expectation:
      "Return XML with a short <summary>, a <sentiment> tag (positive, negative, or mixed), and a <key_points> block listing the main takeaways.",
    starter_prompt: `You are a product review analyst. Read the customer review provided below and produce a structured analysis in XML format.

Your output must contain exactly these XML tags:
- <summary>: A 1-2 sentence overview of the review.
- <sentiment>: One of "positive", "negative", or "mixed".
- <key_points>: A list of <point> tags, each containing one specific takeaway from the review.

Rules:
- Base your analysis only on what the reviewer actually wrote.
- Include at least 2 key points.
- Keep the summary concise but capture the reviewer's main feeling.

\${{REVIEW}}`,
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "REVIEW",
    sample_cases: [
      {
        id: "visible-1",
        name: "Wireless headphones review",
        input_data: `I bought the SoundWave Pro 3 headphones last month and overall I'm really impressed. The noise cancellation is top-notch — I can't hear my coworkers at all, which is exactly what I needed. Battery life is solid at around 30 hours, and the carrying case is surprisingly nice. My only complaint is that the ear cushions get warm after about two hours of continuous use, which can be uncomfortable during long meetings. Also, the companion app is clunky and crashes occasionally on Android. But for the sound quality and noise cancellation alone, these are worth every penny of the $299 price tag.`,
        expected_output: `<summary>
The reviewer is highly satisfied with the SoundWave Pro 3 headphones, praising noise cancellation and battery life, with minor complaints about ear cushion heat and a buggy companion app.
</summary>
<sentiment>positive</sentiment>
<key_points>
  <point>Excellent noise cancellation that fully blocks office noise.</point>
  <point>Strong battery life of approximately 30 hours.</point>
  <point>Ear cushions become uncomfortably warm after two hours.</point>
  <point>Companion Android app is clunky and crashes occasionally.</point>
  <point>Considered worth the $299 price for sound quality and ANC.</point>
</key_points>`,
        notes: "Straightforward positive review with minor negatives.",
      },
      {
        id: "visible-2",
        name: "Disappointing smart thermostat",
        input_data: `Returned the ClimaSmart Hub after just one week. Setup was a nightmare — the Wi-Fi connection dropped four times during initial configuration, and the app kept showing "device not found" errors. When it finally connected, the temperature readings were consistently 3-4 degrees off from my old mercury thermometer. The scheduling feature worked okay, but what's the point if the temperature is wrong? Customer support was polite but unhelpful — they told me to "wait for a firmware update." For $189, I expected something that works out of the box. Going back to my old programmable thermostat.`,
        expected_output: `<summary>
The reviewer returned the ClimaSmart Hub after one week due to unreliable Wi-Fi setup, inaccurate temperature readings, and unhelpful customer support.
</summary>
<sentiment>negative</sentiment>
<key_points>
  <point>Wi-Fi connection dropped repeatedly during setup.</point>
  <point>Temperature readings were 3-4 degrees inaccurate.</point>
  <point>Customer support offered no real solution beyond waiting for a firmware update.</point>
  <point>Scheduling feature worked but was undermined by sensor inaccuracy.</point>
  <point>Returned the product and reverted to an older thermostat.</point>
</key_points>`,
        notes: "Negative review with multiple issues.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Mixed review of a standing desk",
        input_data: `The ErgoRise Pro desk has some great features and some frustrating quirks. The electric motor is whisper-quiet and the height memory presets are genuinely useful — I switch between sitting and standing about four times a day and it remembers my exact heights. Build quality feels premium, and the bamboo top looks great in my home office. However, the desk wobbles noticeably at standing height (about 44 inches for me), especially when typing. The cable management tray is too small to fit a power strip, which seems like an oversight for a $650 desk. I'm keeping it because the good parts are really good, but I wish they'd addressed the stability issue.`,
        expected_output: "",
        notes: "Tests handling of genuinely mixed sentiment.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "xml_required_tags",
        label: "Has <summary>, <sentiment>, and <key_points> tags",
        config: {
          required_tags: ["summary", "sentiment", "key_points"],
        },
      },
      {
        kind: "regex",
        label: "Sentiment is a valid value",
        config: {
          pattern: "<sentiment>\\s*(positive|negative|mixed)\\s*</sentiment>",
          multiline: true,
          failure_message:
            "The <sentiment> tag must contain exactly one of: positive, negative, or mixed.",
        },
      },
      {
        kind: "regex",
        label: "Key points contain substance",
        config: {
          pattern: "<point>[\\s\\S]{10,}</point>",
          multiline: true,
          failure_message: "Each <point> should contain a meaningful takeaway from the review.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["summarization", "xml", "sample"],
    created_by_user: false,
    is_sample: true,
  },
  {
    id: "compare-options-p02",
    title: "Compare Two Options With Trade-offs",
    difficulty: "intermediate",
    description:
      "Sample exercise — prompt included. Write a prompt that analyzes two options, lists pros and cons for each, and produces a justified recommendation based on the user's stated priorities. Press Run Prompt to see how it works, then try tweaking the prompt or attempt a blank exercise.",
    input_format:
      "The input describes two options (products, plans, or approaches) with their features, pricing, and context about the user's needs.",
    evaluator_expectation:
      "Return XML with an <analysis> root containing <option_a> and <option_b> blocks (each with <pros> and <cons>), and a <recommendation> with a justified choice.",
    starter_prompt: `You are a decision-analysis assistant. The user is choosing between two options. Read the comparison input below and produce a structured trade-off analysis in XML.

Your output must follow this structure:
<analysis>
  <option_a name="...">
    <pros>
      <item>...</item>
    </pros>
    <cons>
      <item>...</item>
    </cons>
  </option_a>
  <option_b name="...">
    <pros>
      <item>...</item>
    </pros>
    <cons>
      <item>...</item>
    </cons>
  </option_b>
  <recommendation>
    <choice>Option A or Option B name</choice>
    <reasoning>Why this option is better given the user's stated needs and constraints.</reasoning>
  </recommendation>
</analysis>

Rules:
- List at least 2 pros and 2 cons for each option.
- The recommendation must reference specific user needs from the input.
- Be honest about trade-offs — don't oversell the recommended option.
- Keep each item concise (one sentence).

\${{OPTIONS}}`,
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "OPTIONS",
    sample_cases: [
      {
        id: "visible-1",
        name: "Cloud hosting plans for a startup",
        input_data: `We're a 4-person startup launching our first SaaS product next month. We need to pick a cloud hosting plan. Here are our two finalists:

Option A: CloudScale Starter ($49/month)
- 2 shared vCPUs, 4 GB RAM, 80 GB SSD
- Managed PostgreSQL included
- Auto-scaling up to 4 instances
- 1 TB bandwidth
- Email support only (24-48h response)
- Free SSL and CDN

Option B: InfraPlus Growth ($129/month)
- 4 dedicated vCPUs, 8 GB RAM, 160 GB NVMe
- Self-managed database (they provide the VM)
- Manual scaling, up to 8 instances
- Unlimited bandwidth
- 24/7 live chat and phone support
- Free SSL, no CDN included

Our priorities: we want to keep costs low during launch, we don't have a dedicated DevOps person, and we expect modest traffic (under 10k users) for the first 3 months. Uptime is important since we're selling to small businesses.`,
        expected_output: `<analysis>
  <option_a name="CloudScale Starter">
    <pros>
      <item>Significantly cheaper at $49/month, preserving runway during launch.</item>
      <item>Managed PostgreSQL removes database ops burden from a team without dedicated DevOps.</item>
      <item>Auto-scaling handles traffic spikes without manual intervention.</item>
      <item>Included CDN improves performance for geographically distributed users.</item>
    </pros>
    <cons>
      <item>Shared vCPUs may cause inconsistent performance under load.</item>
      <item>Email-only support with 24-48h response could be problematic for uptime-critical incidents.</item>
      <item>1 TB bandwidth cap could become a constraint if growth exceeds projections.</item>
    </cons>
  </option_a>
  <option_b name="InfraPlus Growth">
    <pros>
      <item>Dedicated vCPUs provide consistent, predictable performance.</item>
      <item>24/7 live support is valuable when uptime is a priority for business customers.</item>
      <item>Unlimited bandwidth eliminates overage concerns as the product grows.</item>
      <item>Higher resource ceiling (8 instances) offers more scaling headroom.</item>
    </pros>
    <cons>
      <item>Nearly 3x the cost, which strains a 4-person startup's budget during pre-revenue launch.</item>
      <item>Self-managed database requires DevOps expertise the team currently lacks.</item>
      <item>Manual scaling adds operational overhead and risk of downtime during traffic spikes.</item>
      <item>No included CDN means additional cost or configuration for global performance.</item>
    </cons>
  </option_b>
  <recommendation>
    <choice>CloudScale Starter</choice>
    <reasoning>Given the team's lack of dedicated DevOps, modest expected traffic under 10k users, and need to preserve cash during launch, CloudScale Starter is the better fit. The managed database and auto-scaling directly address the team's operational constraints. The support gap is a real trade-off, but the cost savings ($80/month) and reduced ops burden outweigh it at this stage. The team can revisit InfraPlus Growth once traffic and revenue justify the upgrade.</reasoning>
  </recommendation>
</analysis>`,
        notes: "Tests balanced comparison with clear user priorities.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Project management tools for a remote team",
        input_data: `Our 12-person remote team needs a project management tool. We've narrowed it down to two:

Option A: TaskFlow Teams ($8/user/month)
- Kanban boards and list views
- Built-in time tracking
- 10 GB file storage
- Slack and GitHub integrations
- No Gantt charts
- Mobile app available

Option B: PlanGrid Pro ($15/user/month)
- Gantt charts, Kanban, calendar, and list views
- No built-in time tracking (integrates with Toggl)
- 100 GB file storage
- Slack, GitHub, Figma, and Jira integrations
- Advanced reporting and dashboards
- Mobile app available

Our priorities: we manage complex multi-week projects with dependencies, we heavily use Figma for design handoffs, and we want to stay under $2,000/year total. We already pay for Toggl.`,
        expected_output: "",
        notes: "Tests whether recommendation correctly weighs budget constraint against feature needs.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "xml_required_tags",
        label: "Has required XML structure",
        config: {
          required_tags: ["analysis", "option_a", "option_b", "pros", "cons", "recommendation", "choice", "reasoning"],
        },
      },
      {
        kind: "regex",
        label: "Each option has multiple pros",
        config: {
          pattern: "<pros>[\\s\\S]*<item>[\\s\\S]*</item>[\\s\\S]*<item>[\\s\\S]*</item>[\\s\\S]*</pros>",
          multiline: true,
          failure_message: "Each option should list at least 2 pros.",
        },
      },
      {
        kind: "regex",
        label: "Each option has multiple cons",
        config: {
          pattern: "<cons>[\\s\\S]*<item>[\\s\\S]*</item>[\\s\\S]*<item>[\\s\\S]*</item>[\\s\\S]*</cons>",
          multiline: true,
          failure_message: "Each option should list at least 2 cons.",
        },
      },
      {
        kind: "regex",
        label: "Recommendation includes reasoning",
        config: {
          pattern: "<reasoning>[\\s\\S]{50,}</reasoning>",
          multiline: true,
          failure_message: "The recommendation needs substantive reasoning (not just a one-liner).",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["analysis", "reasoning", "sample"],
    created_by_user: false,
    is_sample: true,
  },
  {
    id: "multi-step-p03",
    title: "Multi-Step Research Plan",
    difficulty: "advanced",
    description:
      "Sample exercise — prompt included. Write a prompt that turns a research question with constraints into a detailed plan with numbered steps, concrete methodologies, a phased timeline, and risk mitigations. Press Run Prompt to see how it works, then try tweaking the prompt or attempt a blank exercise.",
    input_format:
      "The input contains a research question, constraints (budget, timeline, team size), and any specific requirements or focus areas.",
    evaluator_expectation:
      "Return XML with a <research_plan> root containing a <goal>, numbered <steps> (each with a <description>, <methodology>, and <deliverable>), a <timeline>, and a <risks> section.",
    starter_prompt: `You are a research planning consultant. Given a research question and a set of constraints, produce a detailed, actionable research plan in XML format.

Your output must follow this structure:
<research_plan>
  <goal>One-sentence restatement of the core research objective.</goal>
  <steps>
    <step number="1">
      <title>Short step name</title>
      <description>What this step involves and why it matters.</description>
      <methodology>The specific approach, tools, or techniques to use.</methodology>
      <deliverable>The concrete output of this step.</deliverable>
    </step>
    <!-- At least 4 steps -->
  </steps>
  <timeline>
    <phase step_range="1-2">Description and duration for this phase.</phase>
    <!-- Group steps into phases that fit the stated time constraint -->
  </timeline>
  <risks>
    <risk>
      <description>What could go wrong.</description>
      <mitigation>How to reduce or handle it.</mitigation>
    </risk>
    <!-- At least 2 risks -->
  </risks>
</research_plan>

Rules:
- Each step must be specific enough that a team member could start working on it immediately.
- Methodology should name concrete techniques (e.g., "semi-structured interviews", "regression analysis"), not vague hand-waves.
- The timeline must respect the constraints given in the input.
- Risks should be realistic and specific to this research, not generic project risks.
- Steps should build on each other logically — later steps should depend on earlier deliverables.

\${{RESEARCH_BRIEF}}`,
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "RESEARCH_BRIEF",
    sample_cases: [
      {
        id: "visible-1",
        name: "Customer churn analysis for a subscription business",
        input_data: `Research question: Why are customers canceling their subscriptions within the first 90 days, and what interventions could reduce early churn by at least 20%?

Constraints:
- Timeline: 6 weeks
- Team: 1 data analyst, 1 UX researcher, 1 product manager
- Budget: $5,000 for external tools or incentives
- We have access to our product analytics (Mixpanel), billing data (Stripe), and support tickets (Zendesk)
- We can recruit up to 15 churned customers for interviews

Focus areas: We suspect onboarding friction and unclear value proposition are the main drivers, but we want data to confirm or disprove this. The CEO wants actionable recommendations, not just a report.`,
        expected_output: `<research_plan>
  <goal>Identify the primary drivers of subscription cancellation within the first 90 days and design interventions projected to reduce early churn by at least 20%.</goal>
  <steps>
    <step number="1">
      <title>Quantitative churn segmentation</title>
      <description>Analyze existing billing and product data to segment churned users by behavior patterns, plan type, acquisition channel, and engagement levels during the first 90 days.</description>
      <methodology>Export Stripe cancellation data and join with Mixpanel event logs. Run cohort analysis by signup week, then cluster users by feature adoption milestones (e.g., completed onboarding, used core feature 3+ times, invited a teammate). Use survival analysis to identify the highest-risk drop-off windows.</methodology>
      <deliverable>Churn segmentation report identifying 3-5 distinct behavioral segments with their relative churn rates and drop-off timing.</deliverable>
    </step>
    <step number="2">
      <title>Support ticket analysis</title>
      <description>Mine Zendesk tickets from churned customers to surface recurring complaints, confusion points, and unmet expectations that quantitative data alone may miss.</description>
      <methodology>Pull all tickets from users who canceled within 90 days in the last 6 months. Apply thematic coding (open coding pass, then axial coding) to categorize issues. Cross-reference categories with the behavioral segments from Step 1.</methodology>
      <deliverable>Categorized issue matrix mapping complaint themes to user segments, with frequency counts and representative quotes.</deliverable>
    </step>
    <step number="3">
      <title>Qualitative interviews with churned customers</title>
      <description>Conduct in-depth interviews with recently churned users to understand their decision-making process, unmet expectations, and the specific moments that pushed them toward cancellation.</description>
      <methodology>Recruit 12-15 churned customers across the top segments identified in Step 1, offering $50 gift cards from the research budget. Use semi-structured interview protocol with questions anchored to their actual usage timeline from Mixpanel. Record and transcribe using Otter.ai.</methodology>
      <deliverable>Interview synthesis document with key themes, journey pain points, and direct quotes organized by segment.</deliverable>
    </step>
    <step number="4">
      <title>Onboarding funnel deep-dive</title>
      <description>Since onboarding friction is a suspected driver, specifically map the onboarding flow and identify where churned vs. retained users diverge in behavior.</description>
      <methodology>Build a Mixpanel funnel from signup through the first five key activation milestones. Compare conversion rates between churned and retained cohorts at each step. Identify the steps with the largest retention gap.</methodology>
      <deliverable>Annotated onboarding funnel comparison showing exact drop-off points and the retention lift associated with completing each milestone.</deliverable>
    </step>
    <step number="5">
      <title>Intervention design and prioritization</title>
      <description>Synthesize all findings into specific, actionable interventions prioritized by expected impact and implementation effort.</description>
      <methodology>Workshop with the PM and UX researcher to map findings to intervention ideas. Score each using an impact-effort matrix, where impact is estimated from the segment size and churn rate data. Define success metrics and minimum experiment duration for each.</methodology>
      <deliverable>Prioritized intervention roadmap with 3-5 recommended changes, each including the target segment, expected churn reduction, implementation requirements, and measurement plan.</deliverable>
    </step>
  </steps>
  <timeline>
    <phase step_range="1-2">Weeks 1-2: Data analysis phase. The analyst runs churn segmentation while the UX researcher codes support tickets. Both can proceed in parallel.</phase>
    <phase step_range="3">Weeks 3-4: Qualitative research. Recruit and interview 12-15 churned customers. Allow one week for recruitment and scheduling, one week for interviews and synthesis.</phase>
    <phase step_range="4">Week 5: Onboarding deep-dive. The analyst builds the funnel comparison using segments refined by interview insights.</phase>
    <phase step_range="5">Week 6: Synthesis and recommendations. Cross-functional workshop to design interventions and produce the final roadmap.</phase>
  </timeline>
  <risks>
    <risk>
      <description>Churned customer recruitment may fall short of the 12-15 target, as canceled users have low motivation to participate.</description>
      <mitigation>Start recruitment in Week 1 alongside quantitative work. Offer $50 incentives and send personalized outreach from the founder. Have a backup plan to supplement with 5-minute survey responses if fewer than 10 agree to full interviews.</mitigation>
    </risk>
    <risk>
      <description>Mixpanel event tracking may have gaps in the onboarding flow, making it hard to pinpoint exact drop-off steps.</description>
      <mitigation>Audit the tracking plan in Week 1 before running the analysis. If critical events are missing, instrument them immediately — they won't help with historical data but the team can note the gap in the report and plan a follow-up analysis in 4 weeks.</mitigation>
    </risk>
    <risk>
      <description>Findings may reveal churn drivers outside the team's control (e.g., pricing, market fit) that can't be addressed with UX or product changes alone.</description>
      <mitigation>Frame the final roadmap with tiers: changes the product team can ship independently, changes that need cross-functional buy-in, and strategic issues to escalate to leadership with supporting data.</mitigation>
    </risk>
  </risks>
</research_plan>`,
        notes: "Complex research planning with multiple constraints and realistic team dynamics.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Market entry feasibility study",
        input_data: `Research question: Should our B2B invoicing software expand into the German SMB market, and if so, what localization and compliance changes are required?

Constraints:
- Timeline: 4 weeks
- Team: 1 market researcher, 1 product manager
- Budget: $3,000 for market data subscriptions and expert calls
- We have no existing presence or partnerships in Germany
- The product currently supports English and Spanish only

Focus areas: Regulatory requirements (especially around e-invoicing mandates), competitive landscape, and the minimum viable localization needed for a pilot launch.`,
        expected_output: "",
        notes: "Tests whether the plan respects a different domain, tighter timeline, and smaller team.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "xml_required_tags",
        label: "Has required XML structure",
        config: {
          required_tags: ["research_plan", "goal", "steps", "step", "description", "methodology", "deliverable", "timeline", "risks", "risk", "mitigation"],
        },
      },
      {
        kind: "regex",
        label: "At least 4 research steps",
        config: {
          pattern: "<step[\\s\\S]*?</step>[\\s\\S]*<step[\\s\\S]*?</step>[\\s\\S]*<step[\\s\\S]*?</step>[\\s\\S]*<step[\\s\\S]*?</step>",
          multiline: true,
          failure_message: "The plan should include at least 4 distinct research steps.",
        },
      },
      {
        kind: "regex",
        label: "Methodology names concrete techniques",
        config: {
          pattern: "<methodology>[\\s\\S]{40,}</methodology>",
          multiline: true,
          failure_message: "Each methodology section should describe specific techniques, not vague directions.",
        },
      },
      {
        kind: "regex",
        label: "At least 2 risks identified",
        config: {
          pattern: "<risk>[\\s\\S]*?</risk>[\\s\\S]*<risk>[\\s\\S]*?</risk>",
          multiline: true,
          failure_message: "Include at least 2 realistic risks with mitigations.",
        },
      },
      {
        kind: "regex",
        label: "Timeline references step numbers",
        config: {
          pattern: "<phase[\\s\\S]*?step_range[\\s\\S]*?>[\\s\\S]*?</phase>",
          multiline: true,
          failure_message: "The timeline should reference step numbers to show how they're sequenced.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["planning", "structured-output", "sample"],
    created_by_user: false,
    is_sample: true,
  },
];

export const additionalProblemRecords = [
  {
    id: "action-items-p08",
    title: "Action Items From Meeting Notes",
    difficulty: "beginner",
    description:
      "Write the full prompt for a model that receives messy meeting notes and must turn them into a concise recap plus a structured list of action items. The output should separate the high-level summary from the individual tasks so another teammate can scan it quickly.",
    input_format:
      "The input is a rough meeting transcript or note dump that includes decisions, owners, and possible deadlines.",
    evaluator_expectation:
      "Return XML with a short summary and an <action_items> block. Each action item should include the task, owner, and deadline.",
    starter_prompt: "",
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "MEETING_NOTES",
    sample_cases: [
      {
        id: "visible-1",
        name: "Launch readiness sync",
        input_data: `Meeting notes:
- launch date still targeted for April 18
- Priya will finalize the status page copy by Tuesday
- Marco to confirm billing migration rollback plan before Friday
- team agreed to keep feature flag enabled for internal users only until QA sign-off`,
        expected_output: `<summary>
The team kept the April 18 launch target, agreed to keep the feature gated to internal users until QA signs off, and identified two concrete follow-ups before launch.
</summary>
<action_items>
  <action_item>
    <task>Finalize the status page copy.</task>
    <owner>Priya</owner>
    <deadline>Tuesday</deadline>
  </action_item>
  <action_item>
    <task>Confirm the billing migration rollback plan.</task>
    <owner>Marco</owner>
    <deadline>Friday</deadline>
  </action_item>
</action_items>`,
        notes: "Visible meeting-note extraction case.",
      },
      {
        id: "visible-2",
        name: "Quarterly planning review with multiple workstreams",
        input_data: `Meeting notes — Q2 Planning Review (March 26):
Attendees: Dana (VP Eng), Raj (PM Lead), Keiko (Design Lead), Omar (Data)

Platform workstream:
- Raj confirmed the API v3 migration is the top priority for Q2
- need to deprecate v1 endpoints by June 15 — Dana said she'll send the deprecation notice to partners by April 4
- Omar flagged that 12% of active integrations still hit v1 exclusively, wants a usage report before the notice goes out
- Omar to pull the v1 usage breakdown by partner tier by end of day Monday

Design workstream:
- Keiko's team is redesigning the onboarding flow; usability testing scheduled for April 14-18
- she needs engineering support to build the prototype — Raj to identify an available frontend engineer by Thursday
- the new flow should ship by May 9 to hit the Q2 activation target

Infrastructure:
- Dana mentioned the SOC 2 audit fieldwork starts April 21
- she needs all teams to complete access reviews before then
- everyone agreed to finish access reviews by April 14
- Raj will coordinate the engineering team's review and send confirmation to Dana by April 11`,
        expected_output: `<summary>
The Q2 planning review aligned three workstreams: API v3 migration with a June 15 deprecation deadline, onboarding redesign targeting May 9 ship date, and SOC 2 audit prep starting April 21. Key dependencies include a v1 usage report before partner deprecation notices go out, frontend engineering support for the onboarding prototype, and team-wide access reviews before audit fieldwork.
</summary>
<action_items>
  <action_item>
    <task>Send API v1 deprecation notice to partners.</task>
    <owner>Dana</owner>
    <deadline>April 4</deadline>
  </action_item>
  <action_item>
    <task>Pull v1 usage breakdown by partner tier.</task>
    <owner>Omar</owner>
    <deadline>Monday end of day</deadline>
  </action_item>
  <action_item>
    <task>Identify an available frontend engineer for onboarding prototype.</task>
    <owner>Raj</owner>
    <deadline>Thursday</deadline>
  </action_item>
  <action_item>
    <task>Coordinate engineering team access reviews and confirm completion to Dana.</task>
    <owner>Raj</owner>
    <deadline>April 11</deadline>
  </action_item>
</action_items>`,
        notes: "Tests extraction from a complex multi-workstream meeting with many owners and dependencies.",
      },
      {
        id: "visible-3",
        name: "Incident retrospective with corrective actions",
        input_data: `Incident Retro Notes — March 24 outage (payment-service)
Facilitator: Sana (SRE Lead)
Attendees: Tomás (on-call), Lin (payment-service owner), Aditi (QA Lead), Marcus (VP Eng)

Timeline recap:
- 02:14 UTC: payment-service started returning 502s after a config push that set the retry limit to 0 instead of 3
- 02:28 UTC: on-call paged, Tomás acked at 02:31
- 02:47 UTC: Tomás identified the bad config, rolled back manually
- 02:52 UTC: service recovered, no failed payments confirmed after reconciliation

Discussion:
- Marcus asked why the config change wasn't caught in staging — Lin explained staging doesn't run the same config validation pipeline as prod
- Aditi said QA never received the config change for review; it went through a fast-track deploy path
- Sana proposed that all config changes go through the same CI pipeline as code changes
- Lin agreed to add a config schema validator to the deploy pipeline by April 7
- Tomás noted the runbook didn't cover config rollback steps, only code rollback — he had to improvise
- Tomás to update the runbook with config-specific rollback procedures by March 31
- Aditi to add config change review to the QA checklist by April 2
- Marcus wants a monthly config audit starting in April — Sana to own the first one and share results by April 18
- team agreed to no fast-track deploys for config changes going forward`,
        expected_output: `<summary>
The retro covered the March 24 payment-service outage caused by a misconfigured retry limit deployed through a fast-track path that bypassed staging validation and QA review. Recovery took 38 minutes. The team agreed to eliminate fast-track config deploys and committed to four corrective actions covering deploy validation, runbook updates, QA process, and ongoing config audits.
</summary>
<action_items>
  <action_item>
    <task>Add config schema validator to the deploy pipeline.</task>
    <owner>Lin</owner>
    <deadline>April 7</deadline>
  </action_item>
  <action_item>
    <task>Update runbook with config-specific rollback procedures.</task>
    <owner>Tomás</owner>
    <deadline>March 31</deadline>
  </action_item>
  <action_item>
    <task>Add config change review to QA checklist.</task>
    <owner>Aditi</owner>
    <deadline>April 2</deadline>
  </action_item>
  <action_item>
    <task>Run first monthly config audit and share results.</task>
    <owner>Sana</owner>
    <deadline>April 18</deadline>
  </action_item>
</action_items>`,
        notes: "Tests extraction from a detailed incident retro with timeline context and multiple corrective actions.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Partnership review",
        input_data: `Meeting notes:
- contract redlines accepted except for data retention clause
- Elena to send revised language today
- Sam owns the pricing appendix refresh by end of week
- legal wants one more pass before signature`,
        expected_output: "",
        notes: "Checks whether tasks remain structured.",
        hidden: true,
      },
      {
        id: "hidden-2",
        name: "Ops handoff",
        input_data: `Meeting notes:
- on-call rotation changes start Monday
- Nia to update pager schedule tonight
- Ben will publish the runbook patch tomorrow morning
- no customer impact expected during the handoff`,
        expected_output: "",
        notes: "Checks summary plus multiple owners.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "xml_required_tags",
        label: "Required action-item XML",
        config: {
          required_tags: ["summary", "action_items", "action_item", "task", "owner", "deadline"],
        },
      },
      {
        kind: "regex",
        label: "Action items include substance",
        config: {
          pattern: "<action_item>[\\s\\S]{40,}</action_item>",
          multiline: true,
          failure_message:
            "Each <action_item> should contain a real task with an owner and deadline.",
        },
      },
      {
        kind: "regex",
        label: "Summary is not empty",
        config: {
          pattern: "<summary>[\\s\\S]{40,}</summary>",
          multiline: true,
          failure_message: "Add a concise but meaningful meeting summary.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["summarization", "xml", "actions"],
    created_by_user: false,
  },
  {
    id: "support-ticket-p09",
    title: "Support Ticket Triage JSON",
    difficulty: "beginner",
    description:
      "Design a prompt that reads an incoming support complaint and outputs a compact JSON triage decision. The response should identify urgency, routing, and whether the customer needs a follow-up without adding extra prose.",
    input_format:
      "The input is a ticket body that may mention symptoms, impact, account details, and time sensitivity.",
    evaluator_expectation:
      "Return valid JSON only with category, priority, assigned_team, customer_reply_needed, and reasoning.",
    starter_prompt: "",
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "TICKET",
    sample_cases: [
      {
        id: "visible-1",
        name: "Billing export broken",
        input_data:
          "Customer message: Our finance team cannot export invoices for quarter close. Every attempt fails with a 500 error, and we need this fixed today.",
        expected_output: `{
  "category": "billing",
  "priority": "high",
  "assigned_team": "billing-platform",
  "customer_reply_needed": true,
  "reasoning": "The ticket blocks quarter-close invoice exports and includes a hard deadline today."
}`,
        notes: "Visible JSON triage case.",
      },
      {
        id: "visible-2",
        name: "Widespread performance degradation",
        input_data: `Customer message:

Hi Support,

We're experiencing severe slowness across our entire workspace since around 10am PT today. Dashboards that normally load in 2-3 seconds are taking 30+ seconds, and some are timing out entirely. Our team of 85 users is essentially blocked — we have a board presentation at 3pm today that relies on live dashboard data.

We've tried clearing browser caches and switching networks. The issue persists across Chrome, Firefox, and Safari, and affects users in both our SF and London offices.

Account ID: ACCT-7291
Plan: Enterprise
Contract renewal: Next month

This is urgent. Please escalate immediately.

— Rachel Torres, Head of Analytics`,
        expected_output: `{
  "category": "performance",
  "priority": "critical",
  "assigned_team": "platform-reliability",
  "customer_reply_needed": true,
  "reasoning": "Enterprise customer with 85 users fully blocked by platform-wide performance degradation. Hard deadline today at 3pm for board presentation. Issue is not browser or network specific. Contract renewal next month adds business urgency. Meets critical priority threshold due to widespread impact, time sensitivity, and account tier."
}`,
        notes: "Tests critical priority assignment with enterprise context, time pressure, and renewal risk.",
      },
      {
        id: "visible-3",
        name: "Team member locked out after role change",
        input_data: `Customer message:

Our marketing director, James Liu, was promoted to VP of Marketing last week. We updated his role in your platform from "Editor" to "Admin" on Friday. Since Monday morning, he's been completely locked out — the login page shows "Access Denied: insufficient permissions" every time he tries to sign in.

We've tried resetting his password and he cleared his cookies. His old Editor account seems to still work if he uses incognito mode, but the Admin role shows nothing.

This is blocking him from approving campaign budgets for the quarter, which are due by Wednesday.

Account: MKT-4455
User email: j.liu@their-company.com

Thanks,
Sandra Park, IT Admin`,
        expected_output: `{
  "category": "access-management",
  "priority": "high",
  "assigned_team": "identity-platform",
  "customer_reply_needed": true,
  "reasoning": "User is locked out after a role change, suggesting a permissions migration issue rather than a credential problem. The old role works in incognito, confirming the account exists but the new Admin role assignment is broken. Blocking budget approvals due Wednesday makes this high priority. Routing to identity-platform team for role/permission investigation."
}`,
        notes: "Tests nuanced categorization (access vs. auth), technical reasoning from symptoms, and appropriate priority.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Feature request",
        input_data:
          "Customer message: It would help if dashboards could be exported directly to PowerPoint. This is not urgent, but our exec team asks for it often.",
        expected_output: "",
        notes: "Tests lower-priority routing.",
        hidden: true,
      },
      {
        id: "hidden-2",
        name: "Security concern",
        input_data:
          "Customer message: We saw a login notification from an unfamiliar IP and want someone to confirm whether our account was accessed.",
        expected_output: "",
        notes: "Tests security-oriented categorization.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "json_schema",
        label: "Ticket triage schema",
        config: {
          schema: {
            type: "object",
            required: [
              "category",
              "priority",
              "assigned_team",
              "customer_reply_needed",
              "reasoning",
            ],
            properties: {
              category: { type: "string" },
              priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
              assigned_team: { type: "string" },
              customer_reply_needed: { type: "boolean" },
              reasoning: { type: "string", minLength: 20 },
            },
          },
        },
      },
      {
        kind: "regex",
        label: "Output is raw JSON",
        config: {
          pattern: "^\\s*\\{",
          multiline: false,
          failure_message:
            "Return only the JSON triage object, with no explanation outside it.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["json", "classification", "support"],
    created_by_user: false,
  },
  {
    id: "policy-grounded-p10",
    title: "Policy-Grounded Support Answer",
    difficulty: "beginner",
    description:
      "Create a prompt that answers a customer question using only the policy excerpts included in the input. The model should give a helpful answer while citing the exact policy sections it relied on.",
    input_format:
      "The input includes a customer question plus short policy excerpts with section IDs.",
    evaluator_expectation:
      "Return XML with an <answer> plus a <citations> list. Citations should reference the section IDs from the input.",
    starter_prompt: "",
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "POLICY_PACKET",
    sample_cases: [
      {
        id: "visible-1",
        name: "Refund timeline question",
        input_data: `Customer question:
If I cancel after my renewal date, do I still get a refund?

Policy excerpts:
- POL-2: Annual plans can be refunded within 14 days of renewal if usage stays below 20%.
- POL-7: Monthly plans are non-refundable after renewal.
- POL-9: Refunds are processed to the original payment method within 5-10 business days.`,
        expected_output: `<answer>
Customers on annual plans can receive a refund within 14 days of renewal if account usage remains below 20%. Monthly renewals are not refundable after renewal. If a refund is approved, it is returned to the original payment method within 5-10 business days.
</answer>
<citations>
  <citation>POL-2</citation>
  <citation>POL-7</citation>
  <citation>POL-9</citation>
</citations>`,
        notes: "Visible grounding and citation case.",
      },
      {
        id: "visible-2",
        name: "Account downgrade during contract term",
        input_data: `Customer question:
We signed an annual Enterprise plan six months ago, but our team has shrunk from 50 to 15 people. Can we downgrade to the Team plan mid-contract and get a prorated credit for the remaining months? Also, if we downgrade, do we lose access to the audit log feature immediately?

Policy excerpts:
- POL-5: Enterprise plans are billed annually and cannot be downgraded mid-term. Customers may downgrade at renewal by notifying support at least 30 days before the renewal date.
- POL-6: Unused seats on annual plans are not eligible for prorated refunds or credits. Customers may reduce seat count at renewal.
- POL-11: Enterprise-only features (including audit logs, SSO, and custom roles) remain accessible until the end of the current billing period, even if a downgrade has been scheduled.
- POL-14: In cases of significant team reduction (more than 50%), account managers may offer a one-time goodwill credit at their discretion. This is not guaranteed and must be approved by finance.`,
        expected_output: `<answer>
Under the current policy, Enterprise plans cannot be downgraded mid-contract. You would need to notify support at least 30 days before your renewal date to schedule a downgrade to the Team plan for the next billing period. Unused seats on annual plans are not eligible for prorated refunds or credits.

However, since your team has reduced by more than 50%, your account manager may be able to offer a one-time goodwill credit, though this requires finance approval and is not guaranteed. I'd recommend reaching out to your account manager to discuss this option.

Regarding the audit log feature: even if a downgrade is scheduled, all Enterprise-only features including audit logs, SSO, and custom roles remain accessible until the end of your current billing period.
</answer>
<citations>
  <citation>POL-5</citation>
  <citation>POL-6</citation>
  <citation>POL-11</citation>
  <citation>POL-14</citation>
</citations>`,
        notes: "Tests handling of multiple interacting policies with a nuanced exception case.",
      },
      {
        id: "visible-3",
        name: "Data sharing and third-party access",
        input_data: `Customer question:
We're going through a SOC 2 audit and our auditors want to know: does your platform share any of our data with third parties? Also, can we get a copy of all data you store about our account, and how long do you retain it after we stop using the service?

Policy excerpts:
- POL-15: Customer data is not shared with third parties except for infrastructure subprocessors listed in the Trust Center. Subprocessors are limited to hosting (AWS), email delivery (SendGrid), and error tracking (Sentry).
- POL-16: Customers may request a full data export at any time by contacting support. Exports are delivered within 5 business days in JSON format.
- POL-20: Customer data is retained for 90 days after account closure to allow for reactivation. After 90 days, all customer data is permanently deleted from primary storage. Backup copies are purged within an additional 30 days.
- POL-22: Anonymized and aggregated usage statistics may be used for product improvement purposes. These statistics cannot be traced back to individual accounts or users.`,
        expected_output: `<answer>
For your SOC 2 audit, here is what you need to know about data sharing and retention:

Data sharing: Your data is not shared with third parties beyond our infrastructure subprocessors, which are limited to AWS (hosting), SendGrid (email delivery), and Sentry (error tracking). The full list is available in our Trust Center. Separately, we use anonymized and aggregated usage statistics for product improvement, but these cannot be traced back to your account or individual users.

Data export: You can request a complete export of all data we store about your account at any time by contacting support. Exports are delivered within 5 business days in JSON format.

Data retention: After account closure, your data is retained for 90 days to allow for reactivation. After that period, all data is permanently deleted from primary storage, with backup copies purged within an additional 30 days.
</answer>
<citations>
  <citation>POL-15</citation>
  <citation>POL-16</citation>
  <citation>POL-20</citation>
  <citation>POL-22</citation>
</citations>`,
        notes: "Tests handling of compliance-sensitive multi-part question with multiple policy sections.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Trial extension question",
        input_data: `Customer question:
Can support extend my free trial?

Policy excerpts:
- POL-3: Free trials last 14 calendar days.
- POL-4: Trial extensions are only granted for verified service outages longer than 8 hours.
- POL-12: Support agents should avoid promising exceptions without approval.`,
        expected_output: "",
        notes: "Checks for grounded policy use.",
        hidden: true,
      },
      {
        id: "hidden-2",
        name: "Data deletion request",
        input_data: `Customer question:
How long after account closure do you delete stored files?

Policy excerpts:
- POL-18: Customer-uploaded files are deleted within 30 days of account closure.
- POL-19: Billing records may be retained longer for compliance reasons.
- POL-21: Support should distinguish between product data and financial records.`,
        expected_output: "",
        notes: "Tests multiple policy sections in one answer.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "xml_required_tags",
        label: "Answer and citations XML",
        config: {
          required_tags: ["answer", "citations", "citation"],
        },
      },
      {
        kind: "regex",
        label: "References policy section IDs",
        config: {
          pattern: "POL-[0-9]+",
          multiline: true,
          failure_message: "Include policy section IDs in the <citations> block.",
        },
      },
      {
        kind: "regex",
        label: "Answer contains a complete response",
        config: {
          pattern: "<answer>[\\s\\S]{80,}</answer>",
          multiline: true,
          failure_message: "The <answer> should contain a complete customer-facing response.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["grounding", "support", "xml"],
    created_by_user: false,
  },
  {
    id: "call-summary-p11",
    title: "Call Summary With Risks",
    difficulty: "intermediate",
    description:
      "Write a prompt for a model that receives account-call notes and turns them into an executive-ready summary. The response should separate the customer goals, delivery risks, and follow-up commitments instead of mixing everything together.",
    input_format:
      "The input is a rough sales or success-call transcript with goals, blockers, and promised follow-ups.",
    evaluator_expectation:
      "Return XML with a summary, customer goals, risks, and follow-up sections.",
    starter_prompt: "",
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "CALL_NOTES",
    sample_cases: [
      {
        id: "visible-1",
        name: "Renewal planning call",
        input_data: `Call notes:
- customer wants SSO live before renewal on May 30
- security review is still waiting on SOC 2 bridge letter
- they need usage dashboards for the CFO
- account team promised a deployment plan by Wednesday`,
        expected_output: `<summary>
The customer is focused on getting SSO live before the May 30 renewal and also needs clearer usage reporting for leadership.
</summary>
<customer_goals>
  <goal>Enable SSO before May 30.</goal>
  <goal>Provide usage dashboards for the CFO.</goal>
</customer_goals>
<risks>
  <risk>Security review may stall the rollout while the SOC 2 bridge letter is pending.</risk>
</risks>
<follow_up>
  <item>Send the deployment plan by Wednesday.</item>
</follow_up>`,
        notes: "Visible call-summary case.",
      },
      {
        id: "visible-2",
        name: "Onboarding kickoff with tight timeline",
        input_data: `Call notes — Onboarding kickoff with Meridian Health Systems (March 25):
Attendees: Lisa Nguyen (CSM), Dr. Patel (Meridian CTO), Karen Walsh (Meridian IT Director), Tom (Solutions Architect)

Context: Enterprise deal closed last week, 2,400 seats, healthcare vertical.

- Go-live target is April 28 to align with their new fiscal year start
- Meridian has a hard HIPAA requirement — all PHI must stay in the US-East region; Dr. Patel wants written confirmation of data residency before they'll migrate any production data
- Karen's team has 6 IT staff available for the migration but none have experience with our API; she asked for a dedicated training session before integration work begins
- Tom said he can run a 2-hour API integration workshop, proposed April 3 or 4
- Karen prefers April 3 (Thursday) so her team has Friday to practice before the following week
- Lisa mentioned the SSO setup usually takes 5-7 business days; Meridian uses Okta and has a custom SAML configuration with department-level role mapping
- Dr. Patel raised a concern: their previous vendor took 3 months for SSO, and he won't accept that timeline — wants SSO working by April 14 at the latest
- Tom said the custom role mapping may add complexity but he'll scope it this week
- Lisa committed to sending the data residency confirmation letter by end of day Wednesday
- Lisa also needs to loop in the compliance team to prepare HIPAA documentation for Meridian's legal review
- next check-in scheduled for April 1`,
        expected_output: `<summary>
Onboarding kickoff for Meridian Health Systems (2,400 seats, healthcare) with an aggressive April 28 go-live target. Two critical blockers: HIPAA data residency confirmation needed before any data migration, and SSO with custom Okta SAML role mapping must be working by April 14. The IT team needs API training before integration work can start.
</summary>
<customer_goals>
  <goal>Go live by April 28 to align with fiscal year start.</goal>
  <goal>HIPAA-compliant data residency in US-East with written confirmation.</goal>
  <goal>SSO with Okta custom SAML role mapping operational by April 14.</goal>
  <goal>API integration training for the IT team before migration work begins.</goal>
</customer_goals>
<risks>
  <risk>SSO with custom department-level role mapping may add complexity beyond the standard 5-7 day setup, threatening the April 14 deadline.</risk>
  <risk>No production data migration can begin until the data residency confirmation letter is delivered, creating a dependency on the compliance team's responsiveness.</risk>
  <risk>The IT team has no prior experience with the API, which could slow integration even after training.</risk>
</risks>
<follow_up>
  <item>Lisa to send data residency confirmation letter by end of day Wednesday.</item>
  <item>Lisa to engage compliance team for HIPAA documentation for Meridian's legal review.</item>
  <item>Tom to scope the custom SAML role mapping complexity this week.</item>
  <item>Tom to run API integration workshop on April 3.</item>
  <item>Next check-in: April 1.</item>
</follow_up>`,
        notes: "Tests extraction from a complex onboarding call with healthcare compliance requirements and tight dependencies.",
      },
      {
        id: "visible-3",
        name: "Quarterly business review with churn risk",
        input_data: `Call notes — QBR with Pinnacle Retail Group (March 21):
Attendees: Jess (Account Exec), Wei (CSM), Derek Simmons (Pinnacle VP Ops), Amanda (Pinnacle Analytics Lead)

Account context: $340K ARR, 18 months into a 2-year contract, 1,200 active users.

- Derek opened by saying executive sentiment has shifted — the new CFO is pushing for vendor consolidation and wants to see concrete ROI by renewal in September
- Amanda shared that adoption in the APAC stores is only at 34% vs. 78% in North America; she thinks the gap is due to the product not supporting Mandarin and Japanese in the reporting module
- Jess asked about i18n timeline internally — Wei said the reporting module l10n for Mandarin is in beta (ETA May), Japanese is Q3
- Derek said the CFO specifically asked for a one-page executive summary showing cost savings vs. their previous solution; he needs this by April 4 for a leadership meeting
- Amanda also mentioned their data team built a custom integration that breaks every time we release API updates, typically 2-3 times per quarter; she wants advance notice of breaking changes
- Wei offered to add Pinnacle to the API changelog early-access list and to schedule a quarterly integration review call
- Jess proposed an on-site QBR with the CFO next quarter to present ROI directly; Derek said he'd try to arrange it but can't guarantee CFO availability
- Derek mentioned a competitor demo was scheduled for next week — "just evaluating options" but wants to be transparent
- Wei committed to sending the ROI summary framework by Friday and scheduling an APAC adoption workshop for the regional managers within 2 weeks`,
        expected_output: `<summary>
QBR with Pinnacle Retail Group ($340K ARR, renewal in September) revealed significant churn risk. The new CFO is pushing for vendor consolidation and demanding concrete ROI evidence. APAC adoption is lagging at 34% due to missing language support, and a competitor demo is scheduled for next week. Immediate priority is delivering an ROI executive summary by April 4 and addressing the APAC adoption gap.
</summary>
<customer_goals>
  <goal>Demonstrate concrete ROI vs. previous solution to satisfy new CFO by renewal in September.</goal>
  <goal>Improve APAC store adoption from 34% to parity with North America (78%).</goal>
  <goal>Get advance notice of API breaking changes to avoid recurring integration disruptions.</goal>
</customer_goals>
<risks>
  <risk>New CFO is driving vendor consolidation — without a compelling ROI narrative by April 4, the account may be flagged for replacement.</risk>
  <risk>Competitor demo scheduled for next week signals active evaluation of alternatives.</risk>
  <risk>Mandarin reporting localization is in beta (May ETA) and Japanese is Q3 — the APAC gap may persist for months, further eroding adoption.</risk>
  <risk>Recurring API integration breakage (2-3 times per quarter) is damaging the data team's confidence in the platform.</risk>
</risks>
<follow_up>
  <item>Wei to send ROI summary framework by Friday.</item>
  <item>Wei to schedule APAC adoption workshop for regional managers within 2 weeks.</item>
  <item>Wei to add Pinnacle to API changelog early-access list.</item>
  <item>Jess to propose on-site QBR with CFO for next quarter.</item>
</follow_up>`,
        notes: "Tests extraction from a high-stakes QBR with churn signals, competitor threat, and multi-region challenges.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Expansion conversation",
        input_data: `Call notes:
- customer wants to expand to APAC next quarter
- procurement needs a revised order form
- biggest blocker is unclear seat forecasting by region
- CSM said she would send a pricing comparison tomorrow`,
        expected_output: "",
        notes: "Checks separation of goals and risks.",
        hidden: true,
      },
      {
        id: "hidden-2",
        name: "Implementation review",
        input_data: `Call notes:
- migration is 60% complete
- customer worried about weekend cutover staffing
- training sessions requested for support admins
- solutions architect to confirm cutover checklist on Monday`,
        expected_output: "",
        notes: "Checks follow-up commitments.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "xml_required_tags",
        label: "Structured summary XML",
        config: {
          required_tags: ["summary", "customer_goals", "goal", "risks", "risk", "follow_up"],
        },
      },
      {
        kind: "regex",
        label: "Summary has enough detail",
        config: {
          pattern: "<summary>[\\s\\S]{60,}</summary>",
          multiline: true,
          failure_message: "Include a real summary, not just a one-line fragment.",
        },
      },
      {
        kind: "regex",
        label: "At least one risk is called out",
        config: {
          pattern: "<risk>[\\s\\S]{20,}</risk>",
          multiline: true,
          failure_message: "The output should include at least one clearly stated risk.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["summarization", "risks", "xml"],
    created_by_user: false,
  },
  {
    id: "clarifying-questions-p12",
    title: "Clarifying Questions First",
    difficulty: "intermediate",
    description:
      "Design a prompt that makes the model pause and ask clarifying questions when a request is underspecified. The answer should explain what is missing, list the questions, and avoid overcommitting before enough information is available.",
    input_format:
      "The input is an ambiguous request with missing constraints, stakeholders, or success criteria.",
    evaluator_expectation:
      "Return XML with an analysis section, multiple clarifying questions, and a provisional final answer that stays appropriately cautious.",
    starter_prompt: "",
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "REQUEST",
    sample_cases: [
      {
        id: "visible-1",
        name: "Dashboard redesign ask",
        input_data:
          "Request: Redesign our executive dashboard before next month so it tells a better story.",
        expected_output: `<analysis>
The request is missing the intended audience details, the metrics that matter most, and the definition of what "better story" means.
</analysis>
<questions>
  <question>Who is the primary audience for the executive dashboard?</question>
  <question>Which business decisions should the dashboard support?</question>
  <question>What deadline inside next month matters for launch or review?</question>
</questions>
<final_answer>
I would first gather the missing audience, metric, and timing requirements before proposing the redesign scope.
</final_answer>`,
        notes: "Visible clarifying-questions case.",
      },
      {
        id: "visible-2",
        name: "API integration request with vague requirements",
        input_data: `Request: We need to build an integration with Salesforce so our sales team can see customer health scores directly in their workflow. The VP of Sales wants this done quickly because the team is losing deals without this visibility. Can you get started on this?`,
        expected_output: `<analysis>
The request asks for a Salesforce integration to surface customer health scores but leaves major technical and business decisions unspecified. It's unclear where health scores are calculated, what "directly in their workflow" means in Salesforce (custom object, sidebar widget, dashboard, email alert), what data fields the sales team actually needs, whether this is read-only or bidirectional, and what "quickly" translates to in terms of deadline.
</analysis>
<questions>
  <question>Where are customer health scores currently calculated and stored — is there an existing API or database we'd pull from?</question>
  <question>What does "see in their workflow" mean specifically — should this appear on the Account page, in a custom dashboard, as an alert when scores change, or somewhere else in Salesforce?</question>
  <question>Is this read-only (Salesforce displays scores from our system) or should sales reps also be able to flag accounts back to the customer success tool?</question>
  <question>What specific data points beyond the health score should be visible — last activity date, risk factors, renewal date, contract value?</question>
  <question>What does "quickly" mean — is there a specific date or event (e.g., QBR, board meeting, end of quarter) driving the urgency?</question>
</questions>
<final_answer>
Before starting the integration, I'd recommend a 30-minute scoping session with the VP of Sales and whoever owns the health score data to answer these questions. This will prevent us from building the wrong integration and having to redo it.
</final_answer>`,
        notes: "Tests identification of technical ambiguity in a cross-system integration request.",
      },
      {
        id: "visible-3",
        name: "Reporting automation with unclear scope",
        input_data: `Request: Our ops team spends too much time on reporting. They manually pull data from three different tools every Monday, paste it into a spreadsheet, format it, and email it to the leadership team. Can we automate this whole process so it just happens automatically every week?`,
        expected_output: `<analysis>
The request describes a clear pain point (manual weekly reporting from three tools) but lacks the specifics needed to design an automation. The three source tools are not named, so we don't know what APIs or export options are available. The spreadsheet format and what "format it" entails is undefined. It's also unclear who on the leadership team receives it, whether they need the same view or different slices, and whether the current spreadsheet format is something they want preserved or improved.
</analysis>
<questions>
  <question>What are the three tools the ops team pulls data from, and do they have APIs or scheduled export capabilities?</question>
  <question>Can you share a recent copy of the finished report so we can understand the format, data fields, and any calculations or transformations being done?</question>
  <question>Does the leadership team want to keep receiving this as an email attachment, or would a live dashboard or shared document be acceptable?</question>
  <question>Are there any data sensitivity concerns — does the report contain financial data, PII, or information that shouldn't pass through third-party automation tools?</question>
  <question>If one of the source tools is down or returns incomplete data on Monday morning, what should happen — delay the report, send it with a warning, or skip that section?</question>
</questions>
<final_answer>
I would start by reviewing a recent copy of the finished report and mapping the three data sources before proposing an architecture. The error-handling question is particularly important to get right early, since automated reports that silently send bad data can be worse than manual ones.
</final_answer>`,
        notes: "Tests practical ambiguity in a process automation request with error-handling considerations.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Model migration request",
        input_data:
          "Request: Move our team to a new AI model as soon as possible and keep quality high.",
        expected_output: "",
        notes: "Tests ambiguity around constraints and success criteria.",
        hidden: true,
      },
      {
        id: "hidden-2",
        name: "Customer outreach plan",
        input_data:
          "Request: Build a communication plan for the churn-risk accounts this quarter.",
        expected_output: "",
        notes: "Checks that questions come before a confident plan.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "xml_required_tags",
        label: "Required questioning XML",
        config: {
          required_tags: ["analysis", "questions", "question", "final_answer"],
        },
      },
      {
        kind: "regex",
        label: "Contains multiple clarifying questions",
        config: {
          pattern: "<question>[\\s\\S]*</question>[\\s\\S]*<question>[\\s\\S]*</question>",
          multiline: true,
          failure_message: "Ask at least two clarifying questions.",
        },
      },
      {
        kind: "regex",
        label: "Analysis explains missing context",
        config: {
          pattern: "<analysis>[\\s\\S]{50,}</analysis>",
          multiline: true,
          failure_message: "Explain what information is missing before answering.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["ambiguity", "reasoning", "xml"],
    created_by_user: false,
  },
  {
    id: "tone-rewrite-p13",
    title: "Tone Rewrite With Guardrails",
    difficulty: "intermediate",
    description:
      "Create a prompt that rewrites a rough internal message into something calm, direct, and professional without losing the operational facts. The output should show the rewritten message and the issues it corrected.",
    input_format:
      "The input is an emotionally charged or sloppy draft message with facts that must be preserved.",
    evaluator_expectation:
      "Return XML with the rewritten message plus a structured list of issues fixed during the rewrite.",
    starter_prompt: "",
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "DRAFT_MESSAGE",
    sample_cases: [
      {
        id: "visible-1",
        name: "Escalation rewrite",
        input_data:
          "Draft: This rollout was a mess and the customer is furious because nobody checked the data sync before pushing the change. Tell them engineering broke it but we're scrambling now.",
        expected_output: `<rewritten_message>
We identified an issue introduced during the rollout that affected data sync behavior, and the team is actively working on remediation. We will share the next update as soon as we confirm recovery timing.
</rewritten_message>
<issues_fixed>
  <issue>Removed blame-heavy language.</issue>
  <issue>Kept the operational facts while making the tone professional.</issue>
</issues_fixed>`,
        notes: "Visible tone-rewrite case.",
      },
      {
        id: "visible-2",
        name: "Frustrated Slack message about missed deadline",
        input_data: `Draft: Hey team, just a heads up that the data pipeline migration we promised to the board is now officially late. DevOps dropped the ball on the Kubernetes config and didn't tell anyone for two weeks. Product knew about this and said nothing. I've been covering for everyone in the status reports but I'm done doing that. Someone needs to own this mess and give me a realistic date or I'm escalating to the CTO myself.`,
        expected_output: `<rewritten_message>
Hi team,

I want to flag that the data pipeline migration is behind the timeline we committed to the board. The Kubernetes configuration work has taken longer than expected, and it seems the delay wasn't surfaced early enough for us to adjust the plan.

I'd like to get alignment on two things:
1. A revised, realistic completion date we can confidently communicate upward.
2. A clear owner for the remaining work and status reporting going forward.

Can we get 30 minutes on the calendar this week to sort this out? I want to make sure we have an accurate update ready before the next board review.
</rewritten_message>
<issues_fixed>
  <issue>Replaced blame language ("dropped the ball," "said nothing") with neutral framing focused on the problem.</issue>
  <issue>Removed the threat of CTO escalation and replaced it with a constructive request for alignment.</issue>
  <issue>Preserved the key facts: migration is late, Kubernetes config is the bottleneck, status reporting needs improvement.</issue>
  <issue>Added a specific next step (scheduling a meeting) instead of venting frustration.</issue>
</issues_fixed>`,
        notes: "Tests rewrite of internal frustration with blame, threats, and team dynamics.",
      },
      {
        id: "visible-3",
        name: "Defensive response to a customer complaint",
        input_data: `Draft to send to customer: Look, we've explained the rate limit policy multiple times now. Your developer is hitting our API 10x above the plan limits and then complaining that requests get throttled. That's literally how rate limiting works. We're not going to remove the limits just because you're on an Enterprise plan. If you want higher limits, upgrade to the API Plus tier or tell your developer to implement proper backoff logic like our docs say to. We can't keep spending support cycles on this.`,
        expected_output: `<rewritten_message>
Thank you for following up on the API rate limiting issue your team has been experiencing.

After reviewing the recent request patterns, we can see that your application is currently exceeding the rate limits included in your Enterprise plan. When requests exceed these limits, the API returns throttling responses as designed to protect service quality for all users.

There are two paths forward we'd recommend:

1. **Optimize request patterns**: Our documentation includes guidance on implementing exponential backoff and request batching that can significantly reduce the number of API calls needed. We're happy to review your integration and suggest specific optimizations.

2. **Increase rate limits**: If your use case genuinely requires higher throughput, the API Plus tier includes 10x the current limits. Your account manager can walk through the pricing and help assess whether this is the right fit.

Would either of these options work for your team? We'd like to help resolve this so your developer isn't blocked.
</rewritten_message>
<issues_fixed>
  <issue>Removed condescending tone ("That's literally how rate limiting works") and replaced with a neutral technical explanation.</issue>
  <issue>Eliminated blame directed at the customer's developer and reframed as a collaborative problem to solve.</issue>
  <issue>Transformed the dismissive "we can't keep spending support cycles" into an offer to help review the integration.</issue>
  <issue>Preserved the factual content: plan limits exist, usage exceeds them, upgrade and optimization are both valid options.</issue>
</issues_fixed>`,
        notes: "Tests rewrite of a defensive, condescending customer reply while preserving technical accuracy.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Slack to customer-safe update",
        input_data:
          "Draft: The vendor API keeps flaking out again, so if your numbers are weird today that's on them, not us.",
        expected_output: "",
        notes: "Checks neutral tone and fact preservation.",
        hidden: true,
      },
      {
        id: "hidden-2",
        name: "Rough status message",
        input_data:
          "Draft: We are behind because the migration scripts were half-baked, but maybe we'll catch up tonight if nothing else explodes.",
        expected_output: "",
        notes: "Checks professionalism and clarity.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "xml_required_tags",
        label: "Rewrite XML structure",
        config: {
          required_tags: ["rewritten_message", "issues_fixed", "issue"],
        },
      },
      {
        kind: "regex",
        label: "Rewritten message has substance",
        config: {
          pattern: "<rewritten_message>[\\s\\S]{80,}</rewritten_message>",
          multiline: true,
          failure_message: "Provide a complete rewritten message, not just a sentence fragment.",
        },
      },
      {
        kind: "regex",
        label: "Explains at least one fix",
        config: {
          pattern: "<issue>[\\s\\S]{15,}</issue>",
          multiline: true,
          failure_message: "List at least one issue that the rewrite corrected.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["rewrite", "tone", "xml"],
    created_by_user: false,
  },
  {
    id: "contradiction-detection-p14",
    title: "Contradiction Detection Matrix",
    difficulty: "intermediate",
    description:
      "Write the full prompt for a model that compares two status updates and extracts where they agree, where they conflict, and what remains uncertain. The response should be machine-readable so another system can act on it.",
    input_format:
      "The input contains two sources describing the same project, often with inconsistent timelines or facts.",
    evaluator_expectation:
      "Return valid JSON only with agreements, contradictions, and uncertain_points arrays.",
    starter_prompt: "",
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "STATUS_SOURCES",
    sample_cases: [
      {
        id: "visible-1",
        name: "Roadmap mismatch",
        input_data: `Source A:
- mobile beta starts on June 10
- analytics integration is complete

Source B:
- mobile beta starts on June 24
- analytics work is still in QA`,
        expected_output: `{
  "agreements": [],
  "contradictions": [
    {
      "topic": "mobile beta start date",
      "source_a": "June 10",
      "source_b": "June 24"
    },
    {
      "topic": "analytics integration status",
      "source_a": "complete",
      "source_b": "still in QA"
    }
  ],
  "uncertain_points": []
}`,
        notes: "Visible contradiction-detection case.",
      },
      {
        id: "visible-2",
        name: "Revenue projections from Sales vs Finance",
        input_data: `Source A (Sales team weekly update — March 24):
- Q2 pipeline is at $4.2M, up from $3.8M last week
- Three enterprise deals expected to close by end of April: Acme Corp ($380K), Zenith Labs ($220K), and Orion Systems ($195K)
- New inbound lead volume increased 12% month-over-month
- Sales team is confident Q2 target of $2.8M in new bookings is achievable
- Churn is "under control" — no major accounts flagged

Source B (Finance team quarterly forecast — March 22):
- Q2 pipeline is valued at $3.6M based on weighted probability
- Acme Corp deal is at 60% probability; Zenith Labs at 40% (pending legal review); Orion Systems at 75%
- Finance projects $2.1M in new Q2 bookings under the conservative scenario
- Two enterprise accounts (combined $290K ARR) have signaled non-renewal in June
- Finance recommends holding Q2 hiring plan until bookings reach $1.5M threshold`,
        expected_output: `{
  "agreements": [
    {
      "topic": "Acme Corp and Zenith Labs are in the Q2 pipeline",
      "source_a": "Both listed as expected enterprise closings",
      "source_b": "Both listed with probability weightings"
    }
  ],
  "contradictions": [
    {
      "topic": "Q2 pipeline valuation",
      "source_a": "$4.2M",
      "source_b": "$3.6M (weighted probability)"
    },
    {
      "topic": "Q2 new bookings projection",
      "source_a": "$2.8M target described as achievable",
      "source_b": "$2.1M under conservative scenario"
    },
    {
      "topic": "Churn risk status",
      "source_a": "Under control, no major accounts flagged",
      "source_b": "Two enterprise accounts ($290K ARR combined) signaled non-renewal in June"
    }
  ],
  "uncertain_points": [
    {
      "topic": "Zenith Labs deal timing",
      "detail": "Sales expects close by end of April; Finance assigns only 40% probability pending legal review — outcome is uncertain"
    },
    {
      "topic": "Impact of pipeline methodology difference",
      "detail": "The $600K gap between pipeline valuations may reflect different methodologies (raw vs. weighted) rather than a factual disagreement"
    }
  ]
}`,
        notes: "Tests nuanced comparison where some contradictions may be methodological rather than factual.",
      },
      {
        id: "visible-3",
        name: "Feature readiness: PM vs Engineering status",
        input_data: `Source A (Product Manager status update — shared with stakeholders March 25):
- User permissions v2 is on track for April 7 release
- All 6 user stories are accepted and QA-complete
- Performance testing passed with p99 latency under 200ms
- Documentation is finalized and ready for the help center
- The beta group of 15 customers gave positive feedback with no blocking issues reported
- PM is requesting marketing to prepare launch communications for April 7

Source B (Engineering standup notes — internal, March 25):
- 5 of 6 user stories are merged; the 6th (bulk role assignment) has a race condition found during Friday's load test
- Fix for the race condition is in progress, estimated 2-3 days for fix + re-test
- Performance testing showed p99 at 180ms for single operations, but bulk operations hit 850ms under concurrent load
- Infra team flagged that the new permission checks add 15% more database queries, and they want a caching layer before going to GA
- Two beta customers reported intermittent 403 errors that engineering is still investigating
- Tech lead says April 7 is "optimistic" and recommends April 14 as a safer target`,
        expected_output: `{
  "agreements": [
    {
      "topic": "5 of 6 user stories are complete",
      "source_a": "All 6 accepted (implies all done)",
      "source_b": "5 of 6 merged, 6th has a race condition"
    }
  ],
  "contradictions": [
    {
      "topic": "Story completion status",
      "source_a": "All 6 user stories accepted and QA-complete",
      "source_b": "6th story (bulk role assignment) has a race condition from load test, fix in progress"
    },
    {
      "topic": "Performance testing results",
      "source_a": "Passed with p99 under 200ms",
      "source_b": "Single ops at 180ms but bulk operations hit 850ms under concurrent load"
    },
    {
      "topic": "Beta customer feedback",
      "source_a": "Positive feedback, no blocking issues",
      "source_b": "Two customers reported intermittent 403 errors still under investigation"
    },
    {
      "topic": "April 7 release readiness",
      "source_a": "On track, requesting marketing launch prep",
      "source_b": "Tech lead recommends April 14, calls April 7 optimistic"
    }
  ],
  "uncertain_points": [
    {
      "topic": "Database query impact",
      "detail": "Engineering flagged 15% more DB queries and wants a caching layer — unclear if this is a launch blocker or a post-launch optimization"
    },
    {
      "topic": "Root cause of beta 403 errors",
      "detail": "Still under investigation — could be related to the race condition or a separate issue"
    }
  ]
}`,
        notes: "Tests detection of discrepancies between external-facing optimism and internal engineering reality.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Partner launch readiness",
        input_data: `Source A:
- legal review finished yesterday
- partner assets still pending

Source B:
- legal review needs one more pass
- partner assets were delivered this morning`,
        expected_output: "",
        notes: "Checks multiple contradiction topics.",
        hidden: true,
      },
      {
        id: "hidden-2",
        name: "Incident status mismatch",
        input_data: `Source A:
- backfill complete at 11:20
- no customer-facing impact

Source B:
- backfill still running
- three customers reported stale dashboards`,
        expected_output: "",
        notes: "Checks agreements vs conflicts vs unknowns.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "json_schema",
        label: "Contradiction matrix schema",
        config: {
          schema: {
            type: "object",
            required: ["agreements", "contradictions", "uncertain_points"],
            properties: {
              agreements: { type: "array" },
              contradictions: { type: "array" },
              uncertain_points: { type: "array" },
            },
          },
        },
      },
      {
        kind: "regex",
        label: "Output is raw JSON",
        config: {
          pattern: "^\\s*\\{",
          multiline: false,
          failure_message: "Return only the JSON comparison object.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["json", "comparison", "analysis"],
    created_by_user: false,
  },
  {
    id: "multi-source-p15",
    title: "Multi-Source Executive Brief",
    difficulty: "advanced",
    description:
      "Design a prompt that synthesizes multiple short documents into a concise executive brief without losing provenance. The output should summarize the situation, call out key points, and surface open questions while citing the source IDs used.",
    input_format:
      "The input includes several short source snippets labeled with document IDs.",
    evaluator_expectation:
      "Return XML with a brief, key points, and open questions. The brief should cite source IDs like [DOC-A].",
    starter_prompt: "",
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "SOURCE_PACKET",
    sample_cases: [
      {
        id: "visible-1",
        name: "Launch readiness packet",
        input_data: `DOC-A: QA says the Android release candidate passed all blocker tests, but one medium-priority push notification bug remains.
DOC-B: Marketing already scheduled the campaign for Thursday morning.
DOC-C: Support asks for a final FAQ because early-access users still report confusion about plan limits.`,
        expected_output: `<brief>
The launch is close to ready, but one medium-priority mobile issue and customer-education gaps should be addressed before the marketing campaign goes live [DOC-A][DOC-B][DOC-C].
</brief>
<key_points>
  <key_point>QA cleared blocker tests, with one remaining medium-priority Android bug [DOC-A].</key_point>
  <key_point>Marketing has already scheduled the campaign for Thursday morning [DOC-B].</key_point>
  <key_point>Support still needs a finalized FAQ about plan limits [DOC-C].</key_point>
</key_points>
<open_questions>
  <open_question>Will the remaining Android bug be fixed before the scheduled campaign?</open_question>
</open_questions>`,
        notes: "Visible multi-source synthesis case.",
      },
      {
        id: "visible-2",
        name: "Post-incident review packet",
        input_data: `DOC-A (Incident report — SRE team, March 23): The checkout-service outage lasted 47 minutes (14:03–14:50 UTC). Root cause was a misconfigured feature flag that enabled an untested payment flow for 100% of traffic instead of the intended 5% canary group. Approximately 2,300 checkout attempts failed during the window. Automated rollback triggered at 14:38 after error rate exceeded 15% threshold, and service fully recovered by 14:50.

DOC-B (Customer impact assessment — Support team, March 24): Support received 89 tickets during and after the incident. 34 customers reported failed payments with error messages. 12 customers were charged but did not receive order confirmations — these require manual reconciliation. Three enterprise accounts (Pinnacle Retail, Meridian Foods, Aurum Financial) have requested formal incident reports. Support estimates 4-6 hours of manual work to reconcile the 12 confirmation-missing orders.

DOC-C (Engineering action items — Platform team, March 24): Three immediate remediations proposed: (1) Add a percentage-validation guardrail to the feature flag service that rejects rollouts above 25% without explicit override, (2) Extend the canary observation window from 5 minutes to 15 minutes before auto-promoting, (3) Add a pre-deploy diff review step for flag configuration changes. Items 1 and 2 are estimated at 3-4 days of work; item 3 requires a process change and team agreement.

DOC-D (Finance note — March 24): Estimated revenue impact is $18,400 in failed transactions. Of this, $14,200 can be recovered through retry prompts to affected customers. The remaining $4,200 may require goodwill credits or manual reprocessing. Finance asks whether support has already initiated outreach to the affected customers.`,
        expected_output: `<brief>
A 47-minute checkout-service outage on March 23 caused approximately 2,300 failed checkout attempts and an estimated $18,400 in revenue impact [DOC-A][DOC-D]. The root cause was a feature flag misconfiguration that exposed an untested payment flow to 100% of traffic [DOC-A]. Twelve customers were charged without receiving order confirmations and require manual reconciliation [DOC-B]. Engineering has proposed three remediation items to prevent recurrence [DOC-C], and Finance estimates $14,200 of the impact is recoverable through customer outreach [DOC-D].
</brief>
<key_points>
  <key_point>Root cause: feature flag rolled untested payment flow to 100% instead of 5% canary; automated rollback triggered after 35 minutes [DOC-A].</key_point>
  <key_point>89 support tickets received; 12 customers charged without confirmation need manual reconciliation (4-6 hours estimated) [DOC-B].</key_point>
  <key_point>Three enterprise accounts have requested formal incident reports [DOC-B].</key_point>
  <key_point>Engineering proposes flag validation guardrails, extended canary windows, and pre-deploy config review [DOC-C].</key_point>
  <key_point>$18,400 revenue impact; $14,200 recoverable via retry outreach, $4,200 may need credits [DOC-D].</key_point>
</key_points>
<open_questions>
  <open_question>Has support already initiated outreach to the affected customers for payment retries, as Finance requested? [DOC-B][DOC-D]</open_question>
  <open_question>When will the formal incident reports be delivered to the three enterprise accounts? [DOC-B]</open_question>
  <open_question>Does the process change for pre-deploy flag review (item 3) have team agreement, or does it need further discussion? [DOC-C]</open_question>
</open_questions>`,
        notes: "Tests synthesis of a 4-source incident review with financial, technical, and customer impact dimensions.",
      },
      {
        id: "visible-3",
        name: "Vendor evaluation packet",
        input_data: `DOC-A (Security review — InfoSec team, March 20): Vendor "DataSync Pro" completed the security questionnaire. They are SOC 2 Type II certified, encrypt data at rest (AES-256) and in transit (TLS 1.3). However, they host on a single cloud provider (GCP us-central1) with no multi-region failover. Their last penetration test was 14 months ago; our policy requires annual pen tests. They store customer data for 12 months post-contract, which exceeds our 90-day retention requirement.

DOC-B (Technical evaluation — Engineering team, March 21): DataSync Pro's API supports REST and GraphQL. Integration complexity is moderate — estimated 3-4 weeks for full implementation. Their rate limits (100 req/sec) are sufficient for our current volume but may bottleneck if we scale past 500K daily events. Documentation quality is above average. One concern: their webhook delivery has no retry mechanism; failed deliveries are logged but not re-sent.

DOC-C (Commercial terms — Procurement, March 22): Proposed pricing is $48,000/year for our estimated usage tier, which is 15% below the competing bid from SyncWave. Contract includes a 60-day termination clause. However, the vendor requires a 2-year minimum commitment, and our procurement policy prefers 1-year initial terms for new vendors. They offered a 10% discount for a 3-year term.

DOC-D (Reference check — Customer Success, March 22): Spoke with two DataSync Pro customers. Both praised onboarding support and data accuracy. One customer (fintech, similar scale to us) mentioned a 6-hour unplanned outage in January with limited communication from the vendor during the incident. The other customer (healthcare) noted that feature requests take 4-6 months to be prioritized.`,
        expected_output: `<brief>
DataSync Pro is a competitively priced vendor with strong security foundations and above-average technical documentation, but several gaps need resolution before approval [DOC-A][DOC-B][DOC-C]. Key concerns include a stale penetration test, data retention exceeding our policy, no webhook retry mechanism, and a 2-year minimum commitment against our 1-year preference [DOC-A][DOC-B][DOC-C]. Reference checks surfaced reliability and responsiveness concerns [DOC-D].
</brief>
<key_points>
  <key_point>SOC 2 Type II certified with strong encryption, but single-region hosting (GCP us-central1) poses availability risk [DOC-A].</key_point>
  <key_point>Last pen test was 14 months ago, which violates our annual requirement [DOC-A].</key_point>
  <key_point>12-month post-contract data retention exceeds our 90-day policy [DOC-A].</key_point>
  <key_point>Webhook delivery has no retry mechanism — failed deliveries are lost [DOC-B].</key_point>
  <key_point>Pricing is 15% below competitor, but requires 2-year minimum vs. our 1-year preference [DOC-C].</key_point>
  <key_point>Reference customer reported a 6-hour outage with limited vendor communication [DOC-D].</key_point>
</key_points>
<open_questions>
  <open_question>Will the vendor agree to update their penetration test and share results before contract signing? [DOC-A]</open_question>
  <open_question>Can the data retention clause be negotiated down to 90 days to meet our policy? [DOC-A]</open_question>
  <open_question>Is the lack of webhook retries a dealbreaker, or can we build a retry layer on our side? [DOC-B]</open_question>
  <open_question>Will procurement accept a 2-year term given the 15% cost advantage, or is the 1-year policy firm? [DOC-C]</open_question>
</open_questions>`,
        notes: "Tests synthesis across security, technical, commercial, and reference dimensions with actionable open questions.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Outage review packet",
        input_data: `DOC-A: Infra reports recovery is complete.
DOC-B: Customer success says two enterprise accounts still see stale analytics.
DOC-C: The incident commander wants a postmortem owner assigned today.`,
        expected_output: "",
        notes: "Checks synthesis across conflicting sources.",
        hidden: true,
      },
      {
        id: "hidden-2",
        name: "Procurement packet",
        input_data: `DOC-A: Finance approved the budget ceiling.
DOC-B: Security review is blocked on vendor answers to two encryption questions.
DOC-C: Procurement can issue the PO once security signs off.`,
        expected_output: "",
        notes: "Checks open-question handling.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "xml_required_tags",
        label: "Executive brief XML",
        config: {
          required_tags: ["brief", "key_points", "key_point", "open_questions", "open_question"],
        },
      },
      {
        kind: "regex",
        label: "Includes source citations",
        config: {
          pattern: "\\[DOC-[A-Z]\\]",
          multiline: true,
          failure_message: "Use source IDs like [DOC-A] in the synthesized brief.",
        },
      },
      {
        kind: "regex",
        label: "Brief has enough detail",
        config: {
          pattern: "<brief>[\\s\\S]{90,}</brief>",
          multiline: true,
          failure_message: "Provide a substantive executive brief, not just a headline.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["synthesis", "citations", "xml"],
    created_by_user: false,
  },
  {
    id: "analyst-query-p16",
    title: "Analyst Query Plan",
    difficulty: "advanced",
    description:
      "Create a prompt that turns an analytics request and table schema into a careful SQL planning response. The model should explain the approach, write a SQL draft, and call out assumptions instead of pretending the schema is perfectly clear.",
    input_format:
      "The input includes a business question and a simplified schema for one or more tables.",
    evaluator_expectation:
      "Return XML with a plan, SQL draft, and assumptions. The SQL section should contain a SELECT query.",
    starter_prompt: "",
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "ANALYTICS_REQUEST",
    sample_cases: [
      {
        id: "visible-1",
        name: "Weekly conversion report",
        input_data: `Business question:
Show weekly trial-to-paid conversion rate for EMEA accounts in Q1.

Schema:
- accounts(id, region, created_at)
- subscriptions(account_id, started_at, plan_type)
- trials(account_id, started_at, ended_at)`,
        expected_output: `<plan>
Join trials to subscriptions by account_id, limit to EMEA accounts, bucket the trial start dates by week, and compute the share of trial accounts that later started a paid subscription in Q1.
</plan>
<sql>
SELECT DATE_TRUNC('week', t.started_at) AS trial_week,
       COUNT(DISTINCT t.account_id) AS trial_accounts,
       COUNT(DISTINCT CASE WHEN s.plan_type = 'paid' THEN s.account_id END) AS converted_accounts
FROM trials t
JOIN accounts a ON a.id = t.account_id
LEFT JOIN subscriptions s ON s.account_id = t.account_id
WHERE a.region = 'EMEA'
  AND t.started_at >= DATE '2026-01-01'
  AND t.started_at < DATE '2026-04-01'
GROUP BY 1
ORDER BY 1;
</sql>
<assumptions>
  <assumption>Conversion is defined as the same account later starting a paid subscription.</assumption>
</assumptions>`,
        notes: "Visible SQL-planning case.",
      },
      {
        id: "visible-2",
        name: "Customer cohort retention analysis",
        input_data: `Business question:
Our Head of Product wants to see monthly retention rates for customers who signed up in Q4 2025, broken down by acquisition channel. She wants to know which channels bring customers that stick around vs. those that churn quickly. She's specifically interested in the first 3 months after signup.

Schema:
- customers(id, signup_date, acquisition_channel, plan_type)
- activity_monthly(customer_id, activity_month, is_active)
- channels: values include 'organic', 'paid_search', 'referral', 'partner', 'content_marketing'`,
        expected_output: `<plan>
This is a cohort retention analysis. First, identify the Q4 2025 signup cohort by filtering customers with signup_date between October and December 2025. Then join to activity_monthly to check whether each customer was active in months 1, 2, and 3 after signup. Group by acquisition_channel and calculate the retention rate as the percentage of customers still active in each month relative to the cohort size for that channel.
</plan>
<sql>
SELECT
  c.acquisition_channel,
  COUNT(DISTINCT c.id) AS cohort_size,
  COUNT(DISTINCT CASE WHEN a1.is_active THEN c.id END) AS active_month_1,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN a1.is_active THEN c.id END) / COUNT(DISTINCT c.id), 1) AS retention_month_1_pct,
  COUNT(DISTINCT CASE WHEN a2.is_active THEN c.id END) AS active_month_2,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN a2.is_active THEN c.id END) / COUNT(DISTINCT c.id), 1) AS retention_month_2_pct,
  COUNT(DISTINCT CASE WHEN a3.is_active THEN c.id END) AS active_month_3,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN a3.is_active THEN c.id END) / COUNT(DISTINCT c.id), 1) AS retention_month_3_pct
FROM customers c
LEFT JOIN activity_monthly a1
  ON a1.customer_id = c.id
  AND a1.activity_month = DATE_TRUNC('month', c.signup_date + INTERVAL '1 month')
LEFT JOIN activity_monthly a2
  ON a2.customer_id = c.id
  AND a2.activity_month = DATE_TRUNC('month', c.signup_date + INTERVAL '2 months')
LEFT JOIN activity_monthly a3
  ON a3.customer_id = c.id
  AND a3.activity_month = DATE_TRUNC('month', c.signup_date + INTERVAL '3 months')
WHERE c.signup_date >= DATE '2025-10-01'
  AND c.signup_date < DATE '2026-01-01'
GROUP BY c.acquisition_channel
ORDER BY cohort_size DESC;
</sql>
<assumptions>
  <assumption>Retention is defined as the customer having is_active = true in activity_monthly for the given month.</assumption>
  <assumption>Month 1 means the calendar month after the signup month, not 30 days after signup date.</assumption>
  <assumption>The activity_month column stores the first day of each month.</assumption>
</assumptions>`,
        notes: "Tests cohort analysis with self-joins and retention rate calculation across channels.",
      },
      {
        id: "visible-3",
        name: "Revenue leakage detection query",
        input_data: `Business question:
Finance suspects we have revenue leakage — customers who are actively using the product but whose subscriptions have lapsed or are on a free tier when they shouldn't be. Can you write a query to find accounts that had more than 1,000 API calls last month but are either on the 'free' plan or have a subscription with status 'expired'? Include their last payment date so Finance can prioritize outreach.

Schema:
- accounts(id, company_name, created_at)
- subscriptions(id, account_id, plan_name, status, started_at, ended_at)
  -- plan_name: 'free', 'starter', 'professional', 'enterprise'
  -- status: 'active', 'expired', 'cancelled', 'trial'
- api_usage(account_id, usage_date, call_count)
- payments(id, account_id, amount, currency, paid_at)`,
        expected_output: `<plan>
Identify accounts with high API usage (>1,000 calls) in the last calendar month that appear to be under-monetized. Join accounts to subscriptions to find those on 'free' plan or with 'expired' status. Aggregate api_usage for the last month to get total calls. Left join to payments to find the most recent payment date for prioritization. Order by usage descending to surface the biggest leakage opportunities first.
</plan>
<sql>
SELECT
  a.id AS account_id,
  a.company_name,
  s.plan_name,
  s.status AS subscription_status,
  s.ended_at AS subscription_ended_at,
  usage.total_calls_last_month,
  latest_pay.last_payment_date,
  latest_pay.last_payment_amount
FROM accounts a
JOIN subscriptions s
  ON s.account_id = a.id
  AND (s.plan_name = 'free' OR s.status = 'expired')
JOIN (
  SELECT account_id, SUM(call_count) AS total_calls_last_month
  FROM api_usage
  WHERE usage_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    AND usage_date < DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY account_id
  HAVING SUM(call_count) > 1000
) usage ON usage.account_id = a.id
LEFT JOIN (
  SELECT account_id,
         MAX(paid_at) AS last_payment_date,
         MAX(amount) FILTER (WHERE paid_at = MAX(paid_at)) AS last_payment_amount
  FROM payments
  GROUP BY account_id
) latest_pay ON latest_pay.account_id = a.id
ORDER BY usage.total_calls_last_month DESC;
</sql>
<assumptions>
  <assumption>An account may have multiple subscription records; we flag any account that has at least one subscription that is free or expired, even if another subscription is active.</assumption>
  <assumption>"Last month" means the full previous calendar month, not the trailing 30 days.</assumption>
  <assumption>The payments table may be empty for free-tier accounts that have never paid, so the left join will return null for last_payment_date in those cases.</assumption>
  <assumption>The latest payment subquery assumes we want the most recent payment regardless of subscription — Finance may want to refine this to match specific subscriptions.</assumption>
</assumptions>`,
        notes: "Tests business-oriented SQL with subqueries, aggregation, and practical assumptions about data quality.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Churn analysis request",
        input_data: `Business question:
Find monthly churn for self-serve customers.

Schema:
- customers(id, segment, country)
- subscriptions(customer_id, started_at, ended_at, plan_name)`,
        expected_output: "",
        notes: "Checks assumptions when the churn definition is ambiguous.",
        hidden: true,
      },
      {
        id: "hidden-2",
        name: "Usage anomaly request",
        input_data: `Business question:
Which enterprise accounts had a sudden drop in weekly active users after rollout 42?

Schema:
- accounts(id, tier)
- usage_daily(account_id, usage_date, wau)
- rollouts(id, rollout_name, started_at)`,
        expected_output: "",
        notes: "Checks plan plus SQL structure.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "xml_required_tags",
        label: "Plan and SQL XML",
        config: {
          required_tags: ["plan", "sql", "assumptions"],
        },
      },
      {
        kind: "regex",
        label: "SQL contains SELECT",
        config: {
          pattern: "<sql>[\\s\\S]*SELECT[\\s\\S]*</sql>",
          multiline: true,
          failure_message: "Include a SQL draft inside the <sql> block.",
        },
      },
      {
        kind: "regex",
        label: "Plan explains the approach",
        config: {
          pattern: "<plan>[\\s\\S]{70,}</plan>",
          multiline: true,
          failure_message: "Explain the query approach before writing SQL.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["sql", "planning", "xml"],
    created_by_user: false,
  },
  {
    id: "rubric-based-p17",
    title: "Rubric-Based Response Judge",
    difficulty: "advanced",
    description:
      "Write the prompt for a model that judges an answer against a rubric and returns a structured scoring result. The output should be machine-readable, balanced, and useful for coaching.",
    input_format:
      "The input includes a rubric, a candidate answer, and occasionally some scoring guidance.",
    evaluator_expectation:
      "Return valid JSON only with score, verdict, strengths, gaps, and coaching_note.",
    starter_prompt: "",
    input_wrapper_template: DEFAULT_INPUT_WRAPPER_TEMPLATE,
    input_variable_name: "RUBRIC_PACKET",
    sample_cases: [
      {
        id: "visible-1",
        name: "Short evaluation case",
        input_data: `Rubric:
- mention root cause
- mention customer impact
- propose next action

Candidate answer:
The incident came from a cache misconfiguration after deploy. Customers in EU saw elevated latency. We should inspect the deploy diff and confirm cache settings before the next release.`,
        expected_output: `{
  "score": 92,
  "verdict": "pass",
  "strengths": [
    "Identifies the likely root cause clearly.",
    "Mentions user impact and a concrete next action."
  ],
  "gaps": [],
  "coaching_note": "Strong answer overall; keep the same structure and specificity."
}`,
        notes: "Visible rubric-grading case.",
      },
      {
        id: "visible-2",
        name: "Customer support response evaluation",
        input_data: `Rubric:
- Acknowledge the customer's frustration or concern empathetically
- Explain the root cause of the issue in plain language (no jargon)
- Provide a concrete resolution or workaround with clear steps
- Set expectations for timeline or next follow-up
- Offer to escalate or provide additional help

Candidate answer:
Hi Sarah, I'm sorry to hear about the trouble with your dashboard exports. The issue is caused by a timeout in our export service when reports exceed 50,000 rows. As a workaround, you can apply a date filter to reduce the row count below 50K and export in batches. Our engineering team is working on increasing the export limit, and we expect the fix to ship within two weeks. I'll follow up with you once it's live. If you need the full dataset sooner, I can run a manual export on our end and send it to you directly — just let me know.`,
        expected_output: `{
  "score": 95,
  "verdict": "pass",
  "strengths": [
    "Opens with genuine empathy acknowledging the customer's frustration.",
    "Explains the root cause clearly without technical jargon (timeout on large exports).",
    "Provides both a self-service workaround (batch exports with date filters) and an escalation path (manual export offer).",
    "Sets a clear timeline expectation (two weeks) with a commitment to follow up."
  ],
  "gaps": [],
  "coaching_note": "Excellent response that hits all rubric criteria. The dual-path approach (workaround now + fix coming) is particularly effective. Consider adding a link to documentation on filtering if available."
}`,
        notes: "Tests evaluation of a strong customer support response against a multi-criteria rubric.",
      },
      {
        id: "visible-3",
        name: "Technical design document evaluation",
        input_data: `Rubric:
- State the problem being solved and why it matters
- Describe the proposed solution at a high level
- Address at least two alternative approaches considered and why they were rejected
- Identify risks or trade-offs of the chosen approach
- Include a rollback or failure mitigation strategy
- Estimate the implementation timeline with milestones

Scoring guidance: Score 80+ requires all criteria addressed substantively. Score 60-79 means most criteria met but with gaps. Below 60 means multiple criteria are missing or superficial.

Candidate answer:
We need to migrate our notification service from polling to WebSockets to reduce latency. The plan is to add a WebSocket server alongside the existing HTTP API. Users will connect via WebSocket for real-time updates and fall back to polling if the connection drops.

We considered two alternatives: (1) Server-Sent Events, which we rejected because our infrastructure team doesn't have experience operating SSE at scale and our load balancers would need reconfiguration, and (2) a third-party push service like Pusher, which we rejected due to cost at our volume (estimated $24K/month) and the data residency requirements from our EU customers.

The main risk is that WebSocket connections are stateful, so we'll need sticky sessions or a pub/sub layer to handle server restarts during deploys. We plan to use Redis pub/sub for message fanout across instances.

If WebSocket adoption causes stability issues, we can disable the feature flag and fall back to the existing polling infrastructure with no data loss. We'll monitor connection error rates and p99 latency for the first two weeks before removing the feature flag.`,
        expected_output: `{
  "score": 72,
  "verdict": "revise",
  "strengths": [
    "Problem statement is clear and the motivation (latency reduction) is stated.",
    "Two alternative approaches are discussed with specific, practical rejection reasons (SSE operational experience, Pusher cost and data residency).",
    "Identifies a real risk (stateful connections during deploys) with a concrete mitigation (Redis pub/sub).",
    "Rollback strategy is solid — feature flag with fallback to existing polling, plus monitoring criteria."
  ],
  "gaps": [
    "Missing implementation timeline and milestones, which the rubric explicitly requires.",
    "Does not quantify the current latency problem or the expected improvement — hard to evaluate whether WebSockets are worth the complexity."
  ],
  "coaching_note": "Strong technical depth on alternatives and risk mitigation. The main gap is the missing timeline with milestones — add a phased rollout plan with dates. Also quantify the latency improvement (e.g., 'from 5-second polling intervals to sub-200ms delivery') to make the business case concrete."
}`,
        notes: "Tests balanced evaluation with both strengths and gaps, matching score to rubric guidance thresholds.",
      },
    ],
    hidden_cases: [
      {
        id: "hidden-1",
        name: "Missing next step",
        input_data: `Rubric:
- summarize the issue
- state impact
- give a next step

Candidate answer:
There was a deployment issue that affected notifications for some users.`,
        expected_output: "",
        notes: "Checks detection of missing rubric elements.",
        hidden: true,
      },
      {
        id: "hidden-2",
        name: "Overly vague answer",
        input_data: `Rubric:
- identify the likely cause
- cite evidence from the timeline
- recommend a next action

Candidate answer:
Something in the system changed and probably caused the outage. We should keep investigating.`,
        expected_output: "",
        notes: "Checks structured coaching output.",
        hidden: true,
      },
    ],
    validators: [
      {
        kind: "json_schema",
        label: "Rubric score schema",
        config: {
          schema: {
            type: "object",
            required: ["score", "verdict", "strengths", "gaps", "coaching_note"],
            properties: {
              score: { type: "number", minimum: 0, maximum: 100 },
              verdict: { type: "string", enum: ["pass", "revise", "fail"] },
              strengths: { type: "array" },
              gaps: { type: "array" },
              coaching_note: { type: "string", minLength: 20 },
            },
          },
        },
      },
      {
        kind: "regex",
        label: "Output is raw JSON",
        config: {
          pattern: "^\\s*\\{",
          multiline: false,
          failure_message: "Return only the JSON grading result.",
        },
      },
    ],
    evaluator_hook: "",
    tags: ["evaluation", "json", "rubric"],
    created_by_user: false,
  },
];
