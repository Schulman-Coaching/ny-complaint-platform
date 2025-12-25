import { NextResponse } from 'next/server';
import { getIntake } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const intakeId = params.id;
  const intake = getIntake(intakeId);

  if (!intake) {
    return NextResponse.json(
      { error: 'Intake not found' },
      { status: 404 }
    );
  }

  const url = new URL(request.url);
  const includeFacts = url.searchParams.get('include_facts') === 'true';

  const result: Record<string, any> = {
    intake_id: intake.intake_id,
    created_at: intake.created_at,
    status: intake.status,
    documents: intake.documents,
    facts_count: intake.extracted_facts.length,
    entities: intake.entities,
    gap_analyses: intake.gap_analyses,
  };

  if (includeFacts) {
    result.extracted_facts = intake.extracted_facts;
  }

  if (intake.draft_text) {
    result.has_draft = true;
  }

  return NextResponse.json(result);
}
