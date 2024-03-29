# ELEVATOR TEST Specification

## Note
Rewrite based on [elevatorTechnicalTest.docx](elevatorTechnicalTest.docx)


### Introduction

This programming challenge involves writing a Test Driven Code using JavaScript/TypeScript that manages 5 elevators in a
building, adhering to principles of MVC/OOP or built with Node.js/React.

### Scenario

A building with 50 floors (ground floor plus floors 1-50) contains five elevators. For simplicity, each elevator moves
at 5 meters per second, with each floor being 3 meters high. It takes 10 seconds from when elevator doors open until
they close. Elevators' doors remain open at a floor until moved away.

**Example:**

- From the ground floor (floor 0) to the top (floor 50), it would take 30 seconds to ascend and an additional 10 seconds
  for the doors, totaling 40 seconds before the elevator is available again.
- If on the 5th floor and the nearest elevator was on the 7th, it would take 1.2 seconds to reach, plus 10 seconds for
  door operations.

### Instructions

Your program should:

- Simulate the movement of the elevators.
- Read in a JSON Response of requests and handle them.
- Output a list of elevator movements, the time taken to move each person to their destination, and keep a total of the
  total passenger time. The goal is to minimize the overall total passenger time.
- Include tests to validate functionality.

### Guidelines

- Each request is a record in the JSON response, formatted as CSV with three comma-separated numbers.
- Elevators start at random floors.
- An elevator in motion can answer calls in its direction of movement.
- Uncalled elevators can move to a default floor.
- Each elevator has a large capacity, so fullness is not an issue.
- Treat door operations as a fixed ten-second delay, ignoring the opening and closing mechanics.
- Assume acceleration and deceleration are instantaneous.
- The optimized code minimizes the total time to satisfy requests.
- If descending, an elevator should not stop for a passenger wanting to ascend, and vice versa.
- Passenger journey time ends when the elevator arrives at the desired floor.

**Output Example:**

```
Time 4248.0 Floor 7 Passenger Pressed Up (Going to Floor 10).
Time 4248.0 Call Response to Floor 7. Elevator 1 on Floor 1. Ascending to Floor 7.
Time 4251.6 Elevator 1 arrived Floor 7. Waited 10 seconds. Moving to Floor 10.
Time 4263.4 Elevator 1 arrived Floor 10. Waited ten seconds.
Passenger on Floor 7 - Total time 15.4 total all passengers is 346.8.
```
