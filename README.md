# NY Complaint Platform

AI-powered platform for preparing New York verified complaints.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ny-complaint-platform)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requirements/all` | List all causes of action |
| GET | `/api/requirements/{cause}` | Get requirements for a cause |
| POST | `/api/intakes` | Create intake session |
| GET | `/api/intakes/{id}` | Get intake details |
| POST | `/api/intakes/{id}/add-text` | Add more text to intake |
| POST | `/api/intakes/{id}/analyze` | Analyze against causes |
| POST | `/api/intakes/{id}/draft` | Generate draft complaint |

## Example Usage

```bash
# Create intake with client's story
curl -X POST http://localhost:3000/api/intakes \
  -H "Content-Type: application/json" \
  -d '{"initial_text": "I hired ABC Corp for $50,000. They never delivered."}'

# Analyze
curl -X POST http://localhost:3000/api/intakes/{id}/analyze \
  -H "Content-Type: application/json" \
  -d '{"causes": ["breach_of_contract"]}'

# Generate draft
curl -X POST http://localhost:3000/api/intakes/{id}/draft \
  -H "Content-Type: application/json" \
  -d '{"cause_of_action": "breach_of_contract", "variables": {"plaintiff_name": "John Smith"}}'
```

## Supported Causes of Action

- Breach of Contract (4 elements)
- Negligence (4 elements)
- Fraud (6 elements, CPLR 3016(b) heightened pleading)
- Conversion (3 elements)
- Unjust Enrichment (3 elements)
- Breach of Fiduciary Duty (3 elements)
- Defamation (4 elements)
- Legal Malpractice (5 elements)
- Medical Malpractice (4 elements)

## License

Proprietary - Cohort Learning Labs
