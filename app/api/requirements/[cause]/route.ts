import { NextResponse } from 'next/server';
import { getRequirements, isValidCause, ALL_CAUSES, CauseOfAction } from '@/lib/requirements';

export async function GET(
  request: Request,
  { params }: { params: { cause: string } }
) {
  const cause = params.cause;

  // Special case: list all causes
  if (cause === 'all') {
    return NextResponse.json({
      causes: ALL_CAUSES,
      count: ALL_CAUSES.length,
    });
  }

  // Validate cause of action
  if (!isValidCause(cause)) {
    return NextResponse.json(
      {
        error: `Unknown cause of action: ${cause}`,
        available_causes: ALL_CAUSES,
      },
      { status: 400 }
    );
  }

  const requirements = getRequirements(cause as CauseOfAction);

  return NextResponse.json({
    cause_of_action: cause,
    requirements,
    count: requirements.length,
    required_count: requirements.filter(r => r.required).length,
  });
}
