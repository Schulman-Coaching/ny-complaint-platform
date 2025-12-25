import { NextResponse } from 'next/server';
import { getIntake, updateIntake } from '@/lib/store';
import { analyzeAgainstCause, recommendCauses } from '@/lib/analysis';
import { isValidCause, CauseOfAction } from '@/lib/requirements';

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
        { error: 'No facts extracted yet. Add text first.' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));

    // Determine which causes to analyze
    let causes: CauseOfAction[];
    if (body.causes && Array.isArray(body.causes)) {
      causes = [];
      for (const c of body.causes) {
        if (!isValidCause(c)) {
          return NextResponse.json(
            { error: `Unknown cause: ${c}` },
            { status: 400 }
          );
        }
        causes.push(c as CauseOfAction);
      }
    } else {
      causes = ['breach_of_contract', 'negligence', 'fraud', 'unjust_enrichment'];
    }

    // Run analysis
    const analyses: Record<string, any> = {};
    for (const cause of causes) {
      const analysis = analyzeAgainstCause(
        intake.extracted_facts,
        intake.entities,
        cause
      );
      analyses[cause] = analysis;

      // Store in intake
      intake.gap_analyses[cause] = analysis;
    }

    // Update intake
    updateIntake(intakeId, {
      gap_analyses: intake.gap_analyses,
      status: 'analyzed',
    });

    // Get recommendations if requested
    const shouldRecommend = body.recommend !== false;
    let recommendations = null;
    if (shouldRecommend) {
      recommendations = recommendCauses(
        intake.extracted_facts,
        intake.entities,
        causes
      );
    }

    const result: Record<string, any> = {
      intake_id: intakeId,
      analyses,
      facts_analyzed: intake.extracted_facts.length,
    };

    if (recommendations) {
      result.recommendations = recommendations;
      result.best_cause = recommendations[0]?.cause_of_action || null;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing intake:', error);
    return NextResponse.json(
      { error: 'Failed to analyze intake' },
      { status: 500 }
    );
  }
}
