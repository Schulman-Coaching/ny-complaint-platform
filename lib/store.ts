// In-memory store for MVP
// Note: Data is lost on server restart. For production, use Vercel KV or a database.

import { IntakeRecord, TemplateRecord } from './requirements';

// Simple in-memory stores
const intakes = new Map<string, IntakeRecord>();
const templates = new Map<string, TemplateRecord>();

// =============================================================================
// INTAKE OPERATIONS
// =============================================================================

export function saveIntake(intake: IntakeRecord): void {
  intakes.set(intake.intake_id, intake);
}

export function getIntake(intakeId: string): IntakeRecord | undefined {
  return intakes.get(intakeId);
}

export function updateIntake(intakeId: string, updates: Partial<IntakeRecord>): boolean {
  const intake = intakes.get(intakeId);
  if (!intake) return false;
  
  Object.assign(intake, updates);
  intakes.set(intakeId, intake);
  return true;
}

export function deleteIntake(intakeId: string): boolean {
  return intakes.delete(intakeId);
}

// =============================================================================
// TEMPLATE OPERATIONS
// =============================================================================

export function saveTemplate(template: TemplateRecord): void {
  templates.set(template.template_id, template);
}

export function getTemplate(templateId: string): TemplateRecord | undefined {
  return templates.get(templateId);
}

export function listTemplates(causeOfAction?: string): TemplateRecord[] {
  const all = Array.from(templates.values());
  if (causeOfAction) {
    return all.filter(t => t.cause_of_action === causeOfAction);
  }
  return all;
}

export function getDefaultTemplate(causeOfAction: string): TemplateRecord | undefined {
  const all = listTemplates(causeOfAction);
  return all.find(t => t.is_default) || all[0];
}

// =============================================================================
// STATS (for debugging)
// =============================================================================

export function getStats() {
  return {
    intakes: intakes.size,
    templates: templates.size,
  };
}
