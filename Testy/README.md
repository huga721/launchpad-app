## Tests-Only Package

This folder contains test files prepared for standalone upload.

- Frontend tests: copied from `frontend/launchpad/src/**/*.spec.ts`
- Backend tests: custom tests added in `backend/tests/test_api.py`

Latest local test run:
- Frontend (`npm test -- --watch=false --browsers=ChromeHeadless`): 13 total, 8 failed, 5 passed
- Backend (`py -m pytest`): 2 passed
