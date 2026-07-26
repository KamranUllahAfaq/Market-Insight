# Contributing to Market Insight

Thanks for helping improve Market Insight. Focused pull requests with clear
motivation and reproducible validation are easiest to review.

## Development workflow

1. Fork the repository and create a branch from `main`.
2. Copy `.env.example` and `frontend/.env.example` to local environment files.
3. Install backend and frontend dependencies as described in the README.
4. Make one cohesive change and include tests or validation where practical.
5. Run the checks below before opening a pull request.

```bash
python -m compileall main.py config MarketInsight
cd frontend
npm run lint
npm run build
```

## Pull requests

- Explain the user problem and the chosen solution.
- Keep unrelated formatting or dependency changes out of the same pull request.
- Include screenshots for visual changes.
- Never commit API keys, access tokens, `.env` files, or private market data.
- Clearly attribute third-party code, datasets, and assets and preserve their
  license requirements.

## Financial-data changes

When adding a research tool, validate ticker input, handle missing data, log
operational failures without exposing secrets, and avoid presenting estimates as
verified facts. New tools should have narrow descriptions so the agent can select
them reliably.

## Reporting problems

Use a GitHub issue for reproducible bugs and feature requests. Security issues
must follow the private reporting process in `SECURITY.md`.
