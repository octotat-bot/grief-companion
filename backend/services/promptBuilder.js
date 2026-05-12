// This is the most important file in the backend.
// It takes the user's input + retrieved examples and builds
// the exact prompt string that gets sent to the LLM.
// A good prompt is the difference between a generic and a great message.

function buildPrompt(userInput, retrievedExamples, options = {}) {
  const {
    situation,       // 'condolence' | 'apology' | 'difficult_news' | 'reconnection' | 'eulogy'
    relationship,    // 'colleague' | 'friend' | 'close_friend' | 'family' | 'acquaintance' | 'partner'
    tone,            // 'formal' | 'warm' | 'brief' | 'heartfelt'
    recipientName,   // e.g. "Priya" (optional)
    senderName,      // e.g. "Rohan" (optional)
    context,         // Free text: "My colleague's father passed away last week"
    additionalNotes  // Free text: "We have worked together for 3 years"
  } = userInput;

  const situationDescriptions = {
    condolence: 'a condolence message for someone who has experienced a loss or death',
    apology: 'a sincere apology message',
    difficult_news: 'a compassionate message delivering difficult or painful news',
    reconnection: 'a message reaching out to reconnect after a period of distance or conflict',
    eulogy: 'a tribute or eulogy honoring someone who has passed'
  };

  const toneInstructions = {
    formal: 'Use formal, respectful language. Avoid contractions. Maintain professional distance while still showing empathy.',
    warm: 'Use warm, personal language. Contractions are fine. The message should feel like it comes from someone who genuinely cares.',
    brief: 'Be concise. 3-4 sentences maximum. Every word count. Do not over-explain.',
    heartfelt: 'Be deeply personal and emotional. It is okay to be vulnerable. Show genuine feeling without being melodramatic.'
  };

  const relationshipContext = {
    colleague: 'You have a professional relationship. You are cordial but not deeply personal friends.',
    friend: 'You are friends but not extremely close. You care about this person.',
    close_friend: 'This person is one of your closest friends. You have a deep, personal bond.',
    family: 'This is a family member. The relationship has history, complexity, and deep connection.',
    acquaintance: 'You know this person but are not close. You want to reach out appropriately without overstepping.',
    partner: 'This is your romantic partner or spouse. The message is deeply intimate.'
  };

  // Build the examples section from RAG results
  let examplesSection = '';
  if (retrievedExamples && retrievedExamples.length > 0) {
    examplesSection = `\n\nHere are some examples of well-written messages in similar situations. Use these as stylistic inspiration — do not copy them directly:\n\n`;
    retrievedExamples.forEach((ex, i) => {
      examplesSection += `Example ${i + 1}:\n"${ex.text}"\n\n`;
    });
  }

  const recipientLine = recipientName ? `The recipient's name is ${recipientName}.` : "You do not know the recipient's name — do not use one.";
  const senderLine = senderName ? `The sender's name is ${senderName}.` : 'Do not sign the message.';

  const prompt = `You are a compassionate writing assistant who helps people express difficult emotions with grace and authenticity.

Your task: Write ${situationDescriptions[situation] || 'a compassionate message'}.

Relationship: ${relationshipContext[relationship] || 'The sender and recipient know each other.'}
Tone: ${toneInstructions[tone] || toneInstructions.warm}
${recipientLine}
${senderLine}

Context provided by the sender:
"${context}"

${additionalNotes ? `Additional notes: "${additionalNotes}"` : ''}
${examplesSection}

CRITICAL RULES you must follow:
1. Write ONLY the message itself. Do not include any preamble like "Here is a message:" or "Sure, here's a draft:". Start directly with the message.
2. Do not include placeholder text like [name] or [date]. Either use the actual name provided or omit it.
3. Do not be preachy or lecture the recipient. The message is about them, not about abstract values.
4. Do not use clichés like "time heals all wounds", "they are in a better place", or "everything happens for a reason" unless the context strongly calls for it.
5. Match the tone instruction exactly. If asked for brief, be brief. If asked for formal, be formal.
6. Sound like a real human being, not a greeting card.
7. Length: ${tone === 'brief' ? '2-4 sentences' : '3-5 sentences for formal/warm, up to 8 for heartfelt'}.

Write the message now:`;

  return prompt;
}

module.exports = { buildPrompt };
