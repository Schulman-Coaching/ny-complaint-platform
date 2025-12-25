import { NextResponse } from 'next/server';
import { getIntake, updateIntake } from '@/lib/store';
import { extractFactsFromText } from '@/lib/analysis';

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

    const body = await request.json().catch(() => ({}));

    if (!body.text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    // Extract facts from new text
    const { facts, entities } = extractFactsFromText(body.text);

    // Merge with existing
    const existingEntityKeys = new Set(
      intake.entities.map(e => `${e.type}:${e.value}`)
    );

    const newEntities = entities.filter(
      e => !existingEntityKeys.has(`${e.type}:${e.value}`)
    );

    const updatedFacts = [...intake.extracted_facts, ...facts];
    const updatedEntities = [...intake.entities, ...newEntities];

    // Update intake
    updateIntake(intakeId, {
      extracted_facts: updatedFacts,
      entities: updatedEntities,
      status: 'processed',
      // Clear previous analyses since facts changed
      gap_analyses: {},
    });

    return NextResponse.json({
      intake_id: intakeId,
      new_facts_added: facts.length,
      new_entities_added: newEntities.length,
      total_facts: updatedFacts.length,
      total_entities: updatedEntities.length,
    });
  } catch (error) {
    console.error('Error adding text:', error);
    return NextResponse.json(
      { error: 'Failed to add text' },
      { status: 500 }
    );
  }
}
