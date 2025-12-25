// NY Complaint Platform - Analysis Service

import {
  CauseOfAction,
  ExtractedFact,
  ElementStatus,
  GapAnalysis,
  AllegationRequirement,
  getRequirements,
} from './requirements';

// =============================================================================
// FACT EXTRACTION
// =============================================================================

export function extractFactsFromText(
  text: string,
  sourceType: string = 'document'
): { facts: ExtractedFact[]; entities: { type: string; value: string }[] } {
  const facts: ExtractedFact[] = [];
  const entities: { type: string; value: string }[] = [];
  const seenEntities = new Set<string>();

  // Split into sentences
  const sentences = text.split(/(?<=[.!?])\s+/);

  sentences.forEach((sentence, index) => {
    const trimmed = sentence.trim();
    if (trimmed.length < 15) return; // Skip very short fragments

    const sentenceEntities: Record<string, string> = {};

    // Extract dates
    const datePatterns = [
      /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    ];

    for (const pattern of datePatterns) {
      const matches = Array.from(trimmed.matchAll(pattern));
      for (const match of matches) {
        const dateVal = match[0];
        sentenceEntities['date'] = dateVal;
        const key = `date:${dateVal}`;
        if (!seenEntities.has(key)) {
          seenEntities.add(key);
          entities.push({ type: 'date', value: dateVal });
        }
      }
    }

    // Extract money amounts
    const moneyPattern = /\$[\d,]+(?:\.\d{2})?/g;
    const moneyMatches = Array.from(trimmed.matchAll(moneyPattern));
    for (const match of moneyMatches) {
      const amountVal = match[0];
      sentenceEntities['amount'] = amountVal;
      const key = `amount:${amountVal}`;
      if (!seenEntities.has(key)) {
        seenEntities.add(key);
        entities.push({ type: 'amount', value: amountVal });
      }
    }

    facts.push({
      statement: trimmed,
      source_reference: `sentence ${index + 1}`,
      source_type: sourceType,
      entities: sentenceEntities,
      confidence: 0.85,
    });
  });

  return { facts, entities };
}

// =============================================================================
// GAP ANALYSIS
// =============================================================================

function factSupportsElement(fact: ExtractedFact, req: AllegationRequirement): boolean {
  const statement = fact.statement.toLowerCase();
  const elementName = req.element_name.toLowerCase().replace(/_/g, ' ');

  // Direct element name match
  if (statement.includes(elementName)) return true;

  // Keyword matching from description
  const keywords = req.description.toLowerCase().split(' ').slice(0, 6);
  const matches = keywords.filter(kw => kw.length > 3 && statement.includes(kw)).length;
  if (matches >= 2) return true;

  // Entity-based matching
  if (req.element_name.includes('damages') && fact.entities['amount']) return true;
  if (req.element_name.includes('contract') && statement.includes('contract')) return true;
  if (req.element_name.includes('breach') && 
      (statement.includes('breach') || statement.includes('failed') || statement.includes('refused'))) return true;
  if (req.element_name.includes('performance') && 
      (statement.includes('performed') || statement.includes('completed') || statement.includes('fulfilled'))) return true;

  return false;
}

function generateFollowupQuestion(elementName: string): string {
  const questions: Record<string, string> = {
    existence_of_contract: 'Can you describe the agreement? Was it written or verbal? When was it made?',
    plaintiff_performance: 'What did you do to fulfill your part of the agreement?',
    defendant_breach: 'What specifically did the other party fail to do, or do wrong?',
    damages: 'What losses have you suffered? Can you quantify them in dollars?',
    duty: 'What responsibility did they have toward you?',
    breach: 'What specific action or failure caused your harm?',
    causation: 'How did their actions directly lead to your losses?',
    material_misrepresentation: 'What specific false statement was made? Who said it, when, and where?',
    falsity: 'How do you know the statement was false?',
    scienter: 'Do you have evidence they knew it was false?',
    justifiable_reliance: 'What did you do in reliance on their statement?',
    ownership_or_right: 'Can you prove you owned or had rights to the property?',
    unauthorized_dominion: 'How did they take control of your property without permission?',
    enrichment: 'What benefit did they receive?',
    at_plaintiff_expense: 'How did this benefit come at your expense?',
    inequity: 'Why would it be unfair for them to keep this benefit?',
    fiduciary_relationship: 'What was your relationship that created a duty of loyalty?',
    false_statement: 'What exactly was said, and when?',
    publication: 'Who else heard or saw the statement?',
    fault: 'Did they know it was false?',
    attorney_client_relationship: 'When did the attorney-client relationship begin?',
    negligence: 'What specifically did the attorney do wrong?',
    case_within_case: 'What would have happened if they hadn\'t made this mistake?',
    physician_patient_relationship: 'When did you become a patient?',
    standard_of_care: 'How did the doctor deviate from proper medical practice?',
  };

  return questions[elementName] || `Please provide more details about ${elementName.replace(/_/g, ' ')}.`;
}

export function analyzeAgainstCause(
  facts: ExtractedFact[],
  entities: { type: string; value: string }[],
  cause: CauseOfAction
): GapAnalysis {
  const requirements = getRequirements(cause);
  const elementStatuses: ElementStatus[] = [];

  for (const req of requirements) {
    const supporting = facts.filter(fact => factSupportsElement(fact, req));

    let status: 'satisfied' | 'partial' | 'missing';
    let confidence: number;
    let gapDesc: string | undefined;

    if (supporting.length === 0) {
      status = 'missing';
      confidence = 0;
      gapDesc = `No facts found supporting ${req.element_name}`;
    } else if (supporting.length >= 2) {
      status = 'satisfied';
      confidence = Math.min(0.95, Math.max(...supporting.map(f => f.confidence)) + 0.1);
      gapDesc = undefined;
    } else {
      status = 'partial';
      confidence = supporting[0].confidence;
      gapDesc = `Limited support for ${req.element_name}`;
    }

    // Check for heightened pleading requirements
    if (req.specificity_required === 'heightened' && status !== 'missing') {
      const hasSpecificDetails = supporting.some(f => 
        f.entities['date'] && f.statement.toLowerCase().match(/said|stated|represented|told/)
      );
      if (!hasSpecificDetails) {
        status = 'partial';
        gapDesc = `CPLR 3016(b) requires heightened specificity for ${req.element_name}`;
      }
    }

    elementStatuses.push({
      element_name: req.element_name,
      status,
      confidence,
      supporting_facts: supporting,
      gap_description: gapDesc,
    });
  }

  // Calculate overall readiness
  const totalWeight = requirements.reduce((sum, req) => sum + (req.required ? 2 : 1), 0);
  let satisfiedWeight = 0;

  elementStatuses.forEach((es, idx) => {
    const weight = requirements[idx].required ? 2 : 1;
    if (es.status === 'satisfied') satisfiedWeight += weight;
    else if (es.status === 'partial') satisfiedWeight += weight * 0.5;
  });

  const overallReadiness = totalWeight > 0 ? satisfiedWeight / totalWeight : 0;

  // Generate follow-up questions
  const followupQuestions = elementStatuses
    .filter(es => es.status === 'missing' || es.status === 'partial')
    .map((es, idx) => ({
      element: es.element_name,
      question: generateFollowupQuestion(es.element_name),
      priority: es.status === 'missing' ? 1 : 2,
    }))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);

  return {
    cause_of_action: cause,
    elements: elementStatuses,
    overall_readiness: Math.round(overallReadiness * 100) / 100,
    followup_questions: followupQuestions,
  };
}

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

export function recommendCauses(
  facts: ExtractedFact[],
  entities: { type: string; value: string }[],
  causes: CauseOfAction[] = ['breach_of_contract', 'negligence', 'fraud', 'unjust_enrichment']
): { cause_of_action: string; readiness: number; strength: string; elements_satisfied: string; missing_elements: string[] }[] {
  const recommendations = causes.map(cause => {
    const analysis = analyzeAgainstCause(facts, entities, cause);
    const satisfied = analysis.elements.filter(e => e.status === 'satisfied').length;
    const total = analysis.elements.length;

    let strength: string;
    if (analysis.overall_readiness >= 0.7) strength = 'Strong';
    else if (analysis.overall_readiness >= 0.4) strength = 'Moderate';
    else strength = 'Weak';

    return {
      cause_of_action: cause,
      readiness: analysis.overall_readiness,
      strength,
      elements_satisfied: `${satisfied}/${total}`,
      missing_elements: analysis.elements
        .filter(e => e.status === 'missing')
        .map(e => e.element_name),
    };
  });

  return recommendations.sort((a, b) => b.readiness - a.readiness);
}
