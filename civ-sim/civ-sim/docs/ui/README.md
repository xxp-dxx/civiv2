# User Interface Status

## Current status

No browser frontend is implemented. The project currently exposes a JSON HTTP API. Do not describe the project as playable through a graphical interface yet.

## First client vertical slice

Build only the screens and interactions needed to prove the server/client contract:

1. Join as an anonymous player and store the returned bearer token in the browser.
2. Display the public map with Riverton, Hillford, and Port Saltmarsh plus direct route connections.
3. Show the current player's location or journey status and expected arrival.
4. Submit a travel command with a unique command ID.
5. Refresh state from the server and show errors and invalid actions clearly.

The client must not calculate authoritative outcomes or store authoritative resources. Keep the token client-side only as needed for the prototype, never log it, and never put it in URLs. A later authentication design should consider safer session handling before production deployment.

## Design guidance

Use readable labels, clear in-progress/completed states, visible action errors, responsive layout, keyboard navigation, and accessible contrast. Avoid building all ten planned screens before the initial client and shared-state workflows work.
