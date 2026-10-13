export interface QuestionGateResult {
  isValid: boolean;
  originalQuestion: string;
  reframedQuestion: string;
  reason: string;
  compoundTopicDetected: boolean;
  fatalisticFramingDetected: boolean;
}

export function evaluateQuestionGate(question: string, domain: string): QuestionGateResult {
  const q = (question || '').trim();

  if (!q) {
    return {
      isValid: false,
      originalQuestion: '',
      reframedQuestion: 'What clarity and personal discipline are mine to cultivate in this matter?',
      reason: 'Please enter a contemplation question before drawing.',
      compoundTopicDetected: false,
      fatalisticFramingDetected: false,
    };
  }

  // Compound topic detectors (e.g., asking about career AND love at once)
  const compoundConnectors = [
    ' and also ',
    ' as well as ',
    ' plus ',
    ' and will ',
    ' 而且 ',
    ' 並且 ',
    ' 還有 ',
    ' 同时 ',
  ];
  const isCompound = compoundConnectors.some((connector) => q.toLowerCase().includes(connector));

  // Fatalistic closed questions (binary will/won't questions)
  const fatalisticStarters = [
    'will i ',
    'is it going to ',
    'am i going to ',
    'can i get ',
    'will he ',
    'will she ',
    '會不會',
    '能不能',
    '是否會',
    '到底會不會',
  ];
  const isFatalistic = fatalisticStarters.some((starter) => q.toLowerCase().startsWith(starter));

  let reframed = q;
  let reason = 'Inquiry is clear and agency-centered.';

  if (isCompound) {
    reason =
      'Multiple topics detected. The temple tradition strictly holds that "One lot answers one matter" to preserve contemplative focus.';
    reframed = `Focusing primarily on your ${domain} inquiry: What is the most principled action I can take in this season?`;
  } else if (isFatalistic) {
    reason =
      'Closed fatalistic inquiry reframed into an agency-centered reflection. Temple lots provide mirrors for your sovereign effort rather than deterministic predictions.';
    reframed = `Regarding this situation: What insight, self-discipline, and timing are mine to cultivate?`;
  }

  return {
    isValid: true,
    originalQuestion: q,
    reframedQuestion: reframed,
    reason,
    compoundTopicDetected: isCompound,
    fatalisticFramingDetected: isFatalistic,
  };
}
