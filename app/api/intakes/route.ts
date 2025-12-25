import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { IntakeRecord } from '@/lib/requirements';
import { saveIntake } from '@/lib/store';
import { extractFactsFromText } from '@/lib/analysis';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const intakeId = uuidv4();
    const now = new Date().toISOString();

    const intake: IntakeRecord = {
      intake_id: intakeId,
      created_at: now,
      status: 'pending',
      documents: [],
      extracted_facts: [],
      entities: [],
      gap_analyses: {},
    };

    // If initial text provided, extract facts immediately
    if (body.initial_text) {
      const { facts, entities } = extractFactsFromText(body.initial_text);
      intake.extracted_facts = facts;
      intake.entities = entities;
      intake.status = 'processed';
    }

    saveIntake(intake);

    const result: Record<string, any> = {
      intake_id: intakeId,
      status: intake.status,
      created_at: intake.created_at,
      message: 'Intake created successfully',
    };

    if (intake.extracted_facts.length > 0) {
      result.facts_extracted = intake.extracted_facts.length;
      result.entities_found = intake.entities.length;
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating intake:', error);
    return NextResponse.json(
      { error: 'Failed to create intake' },
      { status: 500 }
    );
  }
}
