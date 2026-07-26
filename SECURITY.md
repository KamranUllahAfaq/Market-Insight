# Security policy

## Supported versions

Security updates are applied to the latest version on the `main` branch.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Use GitHub's
**Report a vulnerability** option in the repository Security tab, if available,
or contact the repository owner privately through their GitHub profile.

Include the affected component, reproduction steps, expected impact, and any
suggested mitigation. Do not include real API keys, access tokens, or private
financial information in a report.

## Secrets

Market Insight reads credentials from environment variables. `.env` files must
remain local or be stored in the secret-management features of the deployment
provider. If a credential is exposed, revoke and rotate it immediately before
removing it from repository history.
