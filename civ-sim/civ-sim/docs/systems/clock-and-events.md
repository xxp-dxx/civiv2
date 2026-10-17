# Simulation Clock and Scheduled Events

## Current model

The server converts wall-clock milliseconds into world seconds:

`worldTimeS = worldEpochS + ((nowMs - realEpochMs) / 1000) * worldSecondsPerRealSecond`

The current default is 60 world seconds per real second. Walking speed defaults to 5 km per world hour. These are prototype defaults, not finalized balance decisions.

Journeys store origin, destination, departure world time, expected arrival world time, owner, and status. A scheduled arrival event references the journey. Due events are sorted by event time and sequence number; an arrival is applied only if the journey remains in progress.

## Processing behavior

Due events are processed lazily during authenticated `GET /state` and `POST /commands` requests, not by an always-running timer. `GET /time` only computes the displayed clock. This allows a sleeping process to catch up on the next relevant request, provided the state file is available and the application process starts successfully.

## Requirements for future changes

- Keep the server clock authoritative; do not trust a client clock.
- Validate clock scale and movement parameters rather than accepting nonsensical configuration.
- Use stable ordering for events that share a due time.
- Ensure event application is safe if called repeatedly.
- Persist enough information to resume scheduled actions after reload or restart.
- Use unique command IDs and define duplicate handling.
- Add tests for late processing, equal-time event order, invalid config, and restart recovery when expanding the scheduler.

The current scheduler stores events in an array and sorts it when advancing. This is adequate for the small prototype but may need a priority queue if event volumes grow.
