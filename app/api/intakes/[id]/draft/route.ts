import { NextResponse } from 'next/server';
import { getIntake, updateIntake } from '@/lib/store';
import { analyzeAgainstCause } from '@/lib/analysis';
import { isValidCause, CauseOfAction, getRequirements } from '@/lib/requirements';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const intakeId = params.id;
    const intake = getIntake(intakeId);

    if (!intake) {
      return NextResponse.json(
        { error: 'Intake not found' },
        { status: 404 }
      );
    }

    if (intake.extracted_facts.length === 0) {
      return NextResponse.json(
        { error: 'No facts extracted. Add text first.' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const causeStr = body.cause_of_action || 'breach_of_contract';

    if (!isValidCause(causeStr)) {
      return NextResponse.json(
        { error: `Unknown cause: ${causeStr}` },
        { status: 400 }
      );
    }

    const cause = causeStr as CauseOfAction;
    const variables = body.variables || {};

    // Get or run analysis
    let analysis = intake.gap_analyses[cause];
    if (!analysis) {
      analysis = analyzeAgainstCause(
        intake.extracted_facts,
        intake.entities,
        cause
      );
    }

    // Extract variables from entities
    const autoVariables: Record<string, string> = {
      county: 'New York',
      plaintiff_type: '[individual/corporation]',
      defendant_type: '[individual/corporation]',
      damages_amount: '$[AMOUNT]',
    };

    for (const entity of intake.entities) {
      if (entity.type === 'amount' && !autoVariables['damages_amount'].startsWith('$[')) {
        autoVariables['damages_amount'] = entity.value;
      }
      if (entity.type === 'date' && !autoVariables['contract_date']) {
        autoVariables['contract_date'] = entity.value;
      }
    }

    const allVariables = { ...autoVariables, ...variables };

    // Generate draft
    const draft = generateDraft(cause, allVariables, analysis);

    // Update intake
    updateIntake(intakeId, {
      draft_text: draft,
      status: 'drafted',
    });

    // Generate TODO items
    const todoItems = analysis.elements
      .filter((e: any) => e.status === 'missing' || e.status === 'partial')
      .map((e: any) => {
        if (e.status === 'missing') {
          return `MISSING: Add facts for ${e.element_name.replace(/_/g, ' ')}`;
        }
        return `REVIEW: ${e.element_name.replace(/_/g, ' ')} - ${e.gap_description || 'needs more detail'}`;
      });

    return NextResponse.json({
      intake_id: intakeId,
      cause_of_action: cause,
      readiness: analysis.overall_readiness,
      draft_text: draft,
      variables_used: Object.keys(allVariables),
      todo_items: todoItems,
    });
  } catch (error) {
    console.error('Error generating draft:', error);
    return NextResponse.json(
      { error: 'Failed to generate draft' },
      { status: 500 }
    );
  }
}

function generateDraft(
  cause: CauseOfAction,
  variables: Record<string, string>,
  analysis: any
): string {
  const requirements = getRequirements(cause);
  const causeName = cause.replace(/_/g, ' ').toUpperCase();

  let draft = `SUPREME COURT OF THE STATE OF NEW YORK
COUNTY OF ${variables.county || '[COUNTY]'}

${variables.plaintiff_name || '[PLAINTIFF NAME]'},
                    Plaintiff,
        -against-
${variables.defendant_name || '[DEFENDANT NAME]'},
                    Defendant.

VERIFIED COMPLAINT

PARTIES

1. Plaintiff ${variables.plaintiff_name || '[PLAINTIFF NAME]'} is ${variables.plaintiff_type || '[individual/corporation]'}.

2. Defendant ${variables.defendant_name || '[DEFENDANT NAME]'} is ${variables.defendant_type || '[individual/corporation]'}.

JURISDICTION AND VENUE

3. This Court has jurisdiction pursuant to CPLR § 301.

4. Venue is proper in ${variables.county || '[COUNTY]'} County.

FACTUAL ALLEGATIONS

`;

  // Add factual allegations from requirements
  let paraNum = 5;
  for (const req of requirements) {
    let text = req.example_language || `[Allege ${req.element_name}]`;
    
    // Replace placeholders
    for (const [key, value] of Object.entries(variables)) {
      text = text.replace(new RegExp(`\\[${key.toUpperCase()}\\]`, 'g'), value);
    }
    
    draft += `${paraNum}. ${text}\n\n`;
    paraNum++;
  }

  draft += `FIRST CAUSE OF ACTION - ${causeName}

${paraNum}. Plaintiff repeats and realleges paragraphs 1 through ${paraNum - 1}.

${paraNum + 1}. By reason of the foregoing, Plaintiff has been damaged.

PRAYER FOR RELIEF

WHEREFORE, Plaintiff demands judgment as follows:

(a) Compensatory damages in an amount not less than ${variables.damages_amount || '$[AMOUNT]'};
(b) Pre-judgment interest;
(c) Costs of this action; and
(d) Such other relief as the Court deems just.

Dated: ${new Date().toLocaleDateString()}
        ${variables.county || '[COUNTY]'}, New York

                                    ____________________________
                                    Attorney for Plaintiff
`;

  // Add TODO section
  const todos = analysis.elements
    .filter((e: any) => e.status !== 'satisfied')
    .map((e: any) => `• ${e.status.toUpperCase()}: ${e.element_name.replace(/_/g, ' ')} - ${e.gap_description || 'needs attention'}`);

  if (todos.length > 0) {
    draft += `
============================================================
TODO - ITEMS NEEDING ATTENTION:
============================================================
${todos.join('\n')}
`;
  }

  return draft;
}
