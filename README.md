# Interview Test - Elevator Simulation

## Known limitations

- Elevators only go in 1 direction until idle, then they can go in the other direction

## Assumptions

- People get on and off of the elevator "instantly"

## Improvements:

- Read in JSON CSV rather than as pre-configured JS object
- Elevator efficiency improvements, current implementation is simplistic at best, move in 1 direction until nothing to
  do, only then can go in another direction
- Better logging (be useful to have debug messaging)
- More thorough unit tests
- Tighter object accessibility, for example controller is basically public
- Better formatter, prettier feels a bit brutal currently
- A build pipeline? Then don't need 'adjust-imports.mjs' hack
- Some sort of Event system to better track what's happening
  - Elevator granular tracking
  - Passenger data, request elevator, on, off
- Better handling of people getting on and off a same floor
- Output messages are as spec (I believe), but could be dramatically improved
  - Logs are weird where passenger requests but unable to instantly action request as we delay until elevator is free
