// promptBuilder.js — optimized for Gemini 1.5 Flash
// Gemini differences from llama3:
// 1. Responds better to a system + user message split than one big prompt
// 2. Needs harder output constraints — tends to add "Of course!" preambles
// 3. Better at following role-based framing ("You are...")
// 4. Handles few-shot examples extremely well — include them clearly labeled

function buildPrompt(userInput, retrievedExamples = []) {
  const {
    situation,
    relationship,
    tone,
    context,
    recipientName,
    senderName,
    additionalNotes
  } = userInput;

  // ── Situation descriptions ──
  const situationMap = {
    condolence:     'a sincere condolence message for someone experiencing grief or loss',
    apology:        'a genuine and heartfelt apology',
    difficult_news: 'a compassionate message delivering painful or difficult news',
    reconnection:   'a thoughtful message reaching out after distance or conflict',
    eulogy:         'a tribute or eulogy honoring someone who has passed'
  };

  // ── Tone instructions — Gemini follows these very precisely ──
  const toneMap = {
    formal:    'Formal and measured. No contractions. Professional warmth. Like a handwritten note on letterhead.',
    warm:      'Warm and personal. Contractions are fine. Sounds like a caring friend who chooses words carefully.',
    brief:     'Extremely brief. 2 to 3 sentences only. Every word must earn its place. Nothing extra.',
    heartfelt: 'Deeply personal and emotionally open. Vulnerability is appropriate. Avoid melodrama.'
  };

  // ── Length guide ──
  const lengthMap = {
    formal:    '3 to 5 sentences.',
    warm:      '3 to 5 sentences.',
    brief:     '2 to 3 sentences. Hard limit.',
    heartfelt: '5 to 8 sentences.'
  };

  // ── Relationship framing ──
  const relationshipMap = {
    colleague:    'a professional acquaintance — cordial but not deeply personal',
    friend:       'a genuine friend the sender cares about',
    close_friend: 'one of the sender\'s closest friends — deep personal history',
    family:       'a family member — complex, long-term, deeply rooted relationship',
    acquaintance: 'someone the sender knows but is not close to',
    partner:      'a romantic partner or spouse — the most intimate relationship'
  };

  // ── Recipient / sender lines ──
  const recipientLine = recipientName
    ? `Address the recipient as "${recipientName}" naturally within the message.`
    : 'Do not address the recipient by name — you do not have it.';

  const senderLine = senderName
    ? `Sign off the message as "${senderName}".`
    : 'Do not add a signature or sign-off name.';

  // ── Few-shot examples from RAG corpus ──
  let examplesSection = '';
  if (retrievedExamples.length > 0) {
    examplesSection = `
REFERENCE EXAMPLES — use only for tone and rhythm, do not copy:
${retrievedExamples.map((ex, i) =>
  `[Example ${i + 1}]
"${ex.text}"`
).join('\n\n')}

`;
  }

  // ── The prompt ──
  // Gemini works best with a clean role declaration up top,
  // then structured inputs, then hard output rules at the bottom.
  const prompt = `You are a compassionate writing assistant. You help people express difficult emotions with grace, honesty, and authenticity. You write like a thoughtful human being — not a greeting card, not a chatbot.

TASK:
Write ${situationMap[situation] || 'a compassionate message'}.

INPUTS:
- Relationship: ${relationshipMap[relationship] || relationship}
- Tone: ${toneMap[tone] || toneMap.warm}
- Length: ${lengthMap[tone] || lengthMap.warm}
- ${recipientLine}
- ${senderLine}

SITUATION (written by the sender):
"${context.trim()}"
${additionalNotes?.trim() ? `\nADDITIONAL CONTEXT:\n"${additionalNotes.trim()}"` : ''}
${examplesSection}
OUTPUT RULES — follow every single one, no exceptions:
1. Output the message and nothing else. Zero preamble. The very first character of your response must be the first character of the message. Do not write "Here is", "Sure!", "Of course", "Certainly", or anything similar.
2. Do not use placeholder text like [Name], [relationship], or [specific memory].
3. Do not moralize, lecture, or give advice about grief, healing, or forgiveness.
4. Avoid all clichés: "time heals all wounds" · "they are in a better place" · "everything happens for a reason" · "I know how you feel" · "words cannot express".
5. Do not explain what you are doing or summarize the message at the end.
6. Sound like a real, specific human wrote this for this specific person — not a template.
7. If tone is BRIEF: stop after 3 sentences no matter what. Do not exceed this.

Write the message now:`;

  return prompt;
}

// ── Refinement prompt — used by refine.js ──
// Separate function so the refinement call is also Gemini-optimized

function buildRefinementPrompt(originalDraft, critique, formInput) {
  const { situation, relationship, tone, recipientName } = formInput;

  const toneReminders = {
    formal:    'Keep the formal register throughout.',
    warm:      'Keep the warm, personal tone throughout.',
    brief:     'Keep it under 3 sentences. Do not expand.',
    heartfelt: 'Keep the emotional depth and openness.'
  };

  return `You are a compassionate writing assistant refining a draft message based on user feedback.

ORIGINAL DRAFT:
"${originalDraft}"

CONTEXT:
- Situation: ${situation?.replace('_', ' ')}
- Relationship: ${relationship}
- Tone: ${tone}
${recipientName ? `- Recipient: ${recipientName}` : ''}

USER'S FEEDBACK — fix exactly this, nothing else:
"${critique}"

${toneReminders[tone] || ''}

OUTPUT RULES:
1. Output the refined message only. No preamble, no explanation of changes.
2. Fix what the user pointed out. Do not change anything they did not mention.
3. Do not use placeholder text.
4. Sound like a real human wrote it.
${tone === 'brief' ? '5. Maximum 3 sentences. Hard limit.' : ''}

Write the refined message now:`;
}

module.exports = { buildPrompt, buildRefinementPrompt };
