// NY Complaint Platform - Core Types and Requirements

export type CauseOfAction =
  | 'breach_of_contract'
  | 'negligence'
  | 'fraud'
  | 'conversion'
  | 'unjust_enrichment'
  | 'breach_of_fiduciary_duty'
  | 'defamation'
  | 'legal_malpractice'
  | 'medical_malpractice';

export interface AllegationRequirement {
  element_name: string;
  description: string;
  required: boolean;
  cplr_reference?: string;
  specificity_required: 'general' | 'heightened';
  example_language?: string;
}

export interface ExtractedFact {
  statement: string;
  source_reference: string;
  source_type: string;
  entities: Record<string, string>;
  confidence: number;
}

export interface ElementStatus {
  element_name: string;
  status: 'satisfied' | 'partial' | 'missing';
  confidence: number;
  supporting_facts: ExtractedFact[];
  gap_description?: string;
}

export interface GapAnalysis {
  cause_of_action: string;
  elements: ElementStatus[];
  overall_readiness: number;
  followup_questions: { element: string; question: string; priority: number }[];
}

export interface IntakeRecord {
  intake_id: string;
  created_at: string;
  status: 'pending' | 'processed' | 'analyzed' | 'drafted';
  documents: { filename: string; uploaded_at: string }[];
  extracted_facts: ExtractedFact[];
  entities: { type: string; value: string }[];
  gap_analyses: Record<string, GapAnalysis>;
  draft_text?: string;
}

export interface TemplateRecord {
  template_id: string;
  name: string;
  cause_of_action: string;
  sections: { type: string; content: string; order: number }[];
  required_variables: { name: string; type: string; required: boolean }[];
  created_at: string;
  is_default: boolean;
}

// =============================================================================
// NY CAUSE OF ACTION REQUIREMENTS
// =============================================================================

export const NY_REQUIREMENTS: Record<CauseOfAction, AllegationRequirement[]> = {
  breach_of_contract: [
    {
      element_name: 'existence_of_contract',
      description: 'A valid and binding contract existed between the parties',
      required: true,
      specificity_required: 'general',
      example_language: 'On or about [DATE], Plaintiff and Defendant entered into a written agreement whereby...',
    },
    {
      element_name: 'plaintiff_performance',
      description: 'Plaintiff performed its obligations under the contract',
      required: true,
      specificity_required: 'general',
      example_language: 'Plaintiff fully performed all conditions precedent and all obligations required under the Agreement.',
    },
    {
      element_name: 'defendant_breach',
      description: 'Defendant failed to perform its obligations under the contract',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant breached the Agreement by failing to [SPECIFIC BREACH].',
    },
    {
      element_name: 'damages',
      description: 'Plaintiff suffered damages as a result of the breach',
      required: true,
      specificity_required: 'general',
      example_language: 'As a direct and proximate result of Defendant\'s breach, Plaintiff has suffered damages in an amount not less than $[AMOUNT].',
    },
  ],

  negligence: [
    {
      element_name: 'duty',
      description: 'Defendant owed a duty of care to the plaintiff',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant owed Plaintiff a duty to exercise reasonable care.',
    },
    {
      element_name: 'breach',
      description: 'Defendant breached that duty of care',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant breached its duty of care by [SPECIFIC ACTS/OMISSIONS].',
    },
    {
      element_name: 'causation',
      description: 'The breach was the proximate cause of plaintiff\'s injuries',
      required: true,
      specificity_required: 'general',
      example_language: 'As a direct and proximate result of Defendant\'s negligence, Plaintiff suffered [INJURIES].',
    },
    {
      element_name: 'damages',
      description: 'Plaintiff suffered actual damages',
      required: true,
      specificity_required: 'general',
      example_language: 'Plaintiff has sustained damages including [SPECIFIC DAMAGES].',
    },
  ],

  fraud: [
    {
      element_name: 'material_misrepresentation',
      description: 'Defendant made a material misrepresentation of fact',
      required: true,
      cplr_reference: 'CPLR 3016(b)',
      specificity_required: 'heightened',
      example_language: 'On [DATE], Defendant represented that [SPECIFIC FALSE STATEMENT].',
    },
    {
      element_name: 'falsity',
      description: 'The representation was false when made',
      required: true,
      cplr_reference: 'CPLR 3016(b)',
      specificity_required: 'heightened',
      example_language: 'The representation was false. In fact, [TRUE STATE OF AFFAIRS].',
    },
    {
      element_name: 'scienter',
      description: 'Defendant knew the representation was false or made it recklessly',
      required: true,
      cplr_reference: 'CPLR 3016(b)',
      specificity_required: 'heightened',
      example_language: 'Defendant knew this representation was false at the time it was made.',
    },
    {
      element_name: 'intent_to_induce',
      description: 'Defendant made the representation to induce plaintiff\'s reliance',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant made this misrepresentation to induce Plaintiff to [ACTION].',
    },
    {
      element_name: 'justifiable_reliance',
      description: 'Plaintiff justifiably relied on the misrepresentation',
      required: true,
      specificity_required: 'general',
      example_language: 'Plaintiff justifiably relied on Defendant\'s misrepresentation.',
    },
    {
      element_name: 'damages',
      description: 'Plaintiff suffered damages as a result of the reliance',
      required: true,
      specificity_required: 'general',
      example_language: 'As a result of Defendant\'s fraud, Plaintiff suffered damages of $[AMOUNT].',
    },
  ],

  conversion: [
    {
      element_name: 'ownership_or_right',
      description: 'Plaintiff had ownership or a superior right to possession',
      required: true,
      specificity_required: 'general',
      example_language: 'Plaintiff was the lawful owner of [PROPERTY].',
    },
    {
      element_name: 'unauthorized_dominion',
      description: 'Defendant exercised unauthorized dominion over the property',
      required: true,
      specificity_required: 'general',
      example_language: 'Without authorization, Defendant took possession of Plaintiff\'s property.',
    },
    {
      element_name: 'damages',
      description: 'Plaintiff suffered damages as a result',
      required: true,
      specificity_required: 'general',
      example_language: 'Plaintiff has been damaged in the amount of $[AMOUNT].',
    },
  ],

  unjust_enrichment: [
    {
      element_name: 'enrichment',
      description: 'Defendant was enriched',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant received a benefit in the form of [BENEFIT].',
    },
    {
      element_name: 'at_plaintiff_expense',
      description: 'The enrichment was at plaintiff\'s expense',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant\'s enrichment came at Plaintiff\'s expense.',
    },
    {
      element_name: 'inequity',
      description: 'It would be inequitable for defendant to retain the benefit',
      required: true,
      specificity_required: 'general',
      example_language: 'It would be against equity for Defendant to retain the benefit.',
    },
  ],

  breach_of_fiduciary_duty: [
    {
      element_name: 'fiduciary_relationship',
      description: 'A fiduciary relationship existed between the parties',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant owed fiduciary duties to Plaintiff.',
    },
    {
      element_name: 'breach',
      description: 'Defendant breached its fiduciary duties',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant breached its fiduciary duties by [ACTS/OMISSIONS].',
    },
    {
      element_name: 'damages',
      description: 'Plaintiff suffered damages as a result',
      required: true,
      specificity_required: 'general',
      example_language: 'Plaintiff sustained damages as a result of the breach.',
    },
  ],

  defamation: [
    {
      element_name: 'false_statement',
      description: 'Defendant made a false statement of fact',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant stated [EXACT WORDS].',
    },
    {
      element_name: 'publication',
      description: 'The statement was published to a third party',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant published this statement to [THIRD PARTIES].',
    },
    {
      element_name: 'fault',
      description: 'Defendant acted with the requisite degree of fault',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant knew the statement was false.',
    },
    {
      element_name: 'damages_or_per_se',
      description: 'The statement caused damages or is defamatory per se',
      required: true,
      specificity_required: 'general',
      example_language: 'The statement is defamatory per se.',
    },
  ],

  legal_malpractice: [
    {
      element_name: 'attorney_client_relationship',
      description: 'An attorney-client relationship existed',
      required: true,
      specificity_required: 'general',
      example_language: 'An attorney-client relationship existed between Plaintiff and Defendant.',
    },
    {
      element_name: 'negligence',
      description: 'The attorney failed to exercise ordinary skill',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant failed to exercise the skill commonly possessed by attorneys.',
    },
    {
      element_name: 'proximate_cause',
      description: 'The negligence was a proximate cause of damages',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant\'s negligence was a proximate cause of Plaintiff\'s damages.',
    },
    {
      element_name: 'actual_damages',
      description: 'Plaintiff suffered actual damages',
      required: true,
      specificity_required: 'general',
      example_language: 'Plaintiff has suffered actual damages.',
    },
    {
      element_name: 'case_within_case',
      description: 'But for the negligence, plaintiff would have prevailed',
      required: true,
      specificity_required: 'general',
      example_language: 'But for Defendant\'s negligence, Plaintiff would have prevailed.',
    },
  ],

  medical_malpractice: [
    {
      element_name: 'physician_patient_relationship',
      description: 'A physician-patient relationship existed',
      required: true,
      specificity_required: 'general',
      example_language: 'A physician-patient relationship existed.',
    },
    {
      element_name: 'standard_of_care',
      description: 'The defendant deviated from the accepted standard of care',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant deviated from good and accepted medical practice.',
    },
    {
      element_name: 'causation',
      description: 'The deviation was a proximate cause of injury',
      required: true,
      specificity_required: 'general',
      example_language: 'Defendant\'s deviation was a proximate cause of Plaintiff\'s injuries.',
    },
    {
      element_name: 'damages',
      description: 'Plaintiff suffered damages',
      required: true,
      specificity_required: 'general',
      example_language: 'Plaintiff has suffered injuries.',
    },
  ],
};

export const ALL_CAUSES: CauseOfAction[] = Object.keys(NY_REQUIREMENTS) as CauseOfAction[];

export function getRequirements(cause: CauseOfAction): AllegationRequirement[] {
  return NY_REQUIREMENTS[cause] || [];
}

export function isValidCause(cause: string): cause is CauseOfAction {
  return cause in NY_REQUIREMENTS;
}
