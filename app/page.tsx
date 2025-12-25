export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>NY Complaint Platform API</h1>
      <p>AI-powered platform for preparing New York verified complaints.</p>
      
      <h2>API Endpoints</h2>
      
      <h3>Requirements</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`GET /api/requirements/all
GET /api/requirements/{cause_of_action}

Causes: breach_of_contract, negligence, fraud, conversion, 
        unjust_enrichment, breach_of_fiduciary_duty, defamation,
        legal_malpractice, medical_malpractice`}
      </pre>

      <h3>Intakes</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`POST /api/intakes
  Body: { "initial_text": "Your client's story..." }

GET /api/intakes/{id}
GET /api/intakes/{id}?include_facts=true

POST /api/intakes/{id}/add-text
  Body: { "text": "Additional information..." }

POST /api/intakes/{id}/analyze
  Body: { "causes": ["breach_of_contract"], "recommend": true }

POST /api/intakes/{id}/draft
  Body: { 
    "cause_of_action": "breach_of_contract",
    "variables": {
      "plaintiff_name": "John Smith",
      "defendant_name": "ABC Corp",
      "county": "New York"
    }
  }`}
      </pre>

      <h2>Quick Start</h2>
      <pre style={{ background: '#1a1a1a', color: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`# 1. Create intake with client's story
curl -X POST ${typeof window !== 'undefined' ? window.location.origin : ''}/api/intakes \\
  -H "Content-Type: application/json" \\
  -d '{"initial_text": "I hired ABC Corp on March 15, 2024 to build a website for $50,000. I paid them $20,000 upfront. They never delivered and refuse to refund my money."}'

# 2. Analyze against causes of action
curl -X POST ${typeof window !== 'undefined' ? window.location.origin : ''}/api/intakes/{id}/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"causes": ["breach_of_contract", "unjust_enrichment"]}'

# 3. Generate draft complaint
curl -X POST ${typeof window !== 'undefined' ? window.location.origin : ''}/api/intakes/{id}/draft \\
  -H "Content-Type: application/json" \\
  -d '{"cause_of_action": "breach_of_contract", "variables": {"plaintiff_name": "John Smith", "defendant_name": "ABC Corp"}}'`}
      </pre>

      <h2>Supported Causes of Action</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cause</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Elements</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ border: '1px solid #ddd', padding: '8px' }}>Breach of Contract</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>4</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td></tr>
          <tr><td style={{ border: '1px solid #ddd', padding: '8px' }}>Negligence</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>4</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td></tr>
          <tr><td style={{ border: '1px solid #ddd', padding: '8px' }}>Fraud</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>6</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>CPLR 3016(b) heightened pleading</td></tr>
          <tr><td style={{ border: '1px solid #ddd', padding: '8px' }}>Conversion</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>3</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td></tr>
          <tr><td style={{ border: '1px solid #ddd', padding: '8px' }}>Unjust Enrichment</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>3</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td></tr>
          <tr><td style={{ border: '1px solid #ddd', padding: '8px' }}>Breach of Fiduciary Duty</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>3</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td></tr>
          <tr><td style={{ border: '1px solid #ddd', padding: '8px' }}>Defamation</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>4</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td></tr>
          <tr><td style={{ border: '1px solid #ddd', padding: '8px' }}>Legal Malpractice</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>5</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>Case-within-a-case</td></tr>
          <tr><td style={{ border: '1px solid #ddd', padding: '8px' }}>Medical Malpractice</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>4</td><td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td></tr>
        </tbody>
      </table>

      <footer style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #ddd', color: '#666' }}>
        <p>© 2024 Cohort Learning Labs</p>
      </footer>
    </main>
  );
}
