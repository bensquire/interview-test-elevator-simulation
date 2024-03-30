import { Elevator } from './Elevator'
import { MessageLogger } from './MessageLogger'

describe('Elevator', () => {
	let logger: MessageLogger

	beforeEach(() => {
		logger = new MessageLogger()
	})

	test('should move to requested floor', () => {
		const elevator = new Elevator(1, 0, 3, 50, logger)
		elevator.addFloorToDestinationQueue(10)
		// Simulate some ticks for the elevator to move (1.5 seconds per floor,
		for (let i = 0; i < 60; i++) {
			elevator.tick()
		}
		expect(elevator.floor).toBe(10)
		expect(elevator['holdTime']).toBe(100)
	})

	test('knows if its between floors', () => {
		const elevator = new Elevator(1, 0, 3, 50, logger)

		elevator.addFloorToDestinationQueue(10)
		elevator.tick()
		expect(elevator.isBetweenFloors).toBe(true)
	})

	test("knows can tell me it's current floor", () => {
		const elevator = new Elevator(1, 0, 3, 50, logger)
		expect(elevator.floor).toBe(0)

		elevator.addFloorToDestinationQueue(1)
		elevator.tick() // 0.5m
		elevator.tick()
		elevator.tick()
		elevator.tick()
		elevator.tick() // 2.5
		expect(elevator.floor).toBe(0)
		elevator.tick() // 3m
		expect(elevator.floor).toBe(1)
	})

	test("knows it's exactly at a floor", () => {
		const elevator = new Elevator(1, 0, 3, 50, logger)
		expect(elevator.isAtFloor).toBe(true)
		elevator.addFloorToDestinationQueue(1)
		elevator.tick() // 0.5m
		expect(elevator.isAtFloor).toBe(false)
	})

	test("knows it's at a floor it needs to stop at", () => {
		const elevator = new Elevator(1, 0, 3, 50, logger)
		elevator.addFloorToDestinationQueue(1)
		elevator.tick() // 0.5m
		elevator.tick()
		elevator.tick()
		elevator.tick()
		elevator.tick()
		elevator.tick()
		elevator.tick() // 3m
		expect(elevator.isAtADestinationFloor).toBe(false)
	})

	test("knows it's current state", () => {
		const elevator = new Elevator(1, 0, 3, 50, logger)
		expect(elevator.isIdle).toBe(true)
		elevator.addFloorToDestinationQueue(10)
		expect(elevator.isAscending).toBe(true)
		expect(elevator.isDescending).toBe(false)

		const elevator2 = new Elevator(1, 10, 3, 50, logger)
		expect(elevator2.isIdle).toBe(true)
		elevator2.addFloorToDestinationQueue(1)
		expect(elevator2.isDescending).toBe(true)
	})

	test("knows when it's destination queue is empty or not", () => {
		const elevator = new Elevator(1, 0, 3, 50, logger)
		expect(elevator.isDestinationQueueEmpty).toBe(true)
		elevator.addFloorToDestinationQueue(10)
		expect(elevator.isDestinationQueueEmpty).toBe(false)
	})

	test("can remove the current floor from it's destination queue", () => {
		const elevator = new Elevator(1, 0, 3, 50, logger)
		elevator.addFloorToDestinationQueue(0)
		expect(elevator.isDestinationQueueEmpty).toBe(true)
		elevator.removeFloorFromDestinationQueue()
		expect(elevator.isDestinationQueueEmpty).toBe(true)
	})

	test("can remove the current floor from it's destination queue", () => {
		const elevator = new Elevator(1, 0, 3, 50, logger)
		elevator.addFloorToDestinationQueue(1)
		expect(elevator.isDestinationQueueEmpty).toBe(false)
		elevator.tick() // 0.5m
		elevator.tick()
		elevator.tick()
		elevator.tick()
		elevator.tick()
		elevator.tick() // 3m
		expect(elevator.floor).toBe(1)
		elevator.removeFloorFromDestinationQueue() // We're at floor 1
		expect(elevator.isDestinationQueueEmpty).toBe(true)
	})

	test('can add a floor to the destination queue', () => {
		const elevator = new Elevator(1, 0, 3, 10, logger)
		elevator.addFloorToDestinationQueue(5)
		expect(elevator['destinationQueue']).toContain(5)
	})

	test('will throw error for invalid floors', () => {
		const elevator = new Elevator(1, 0, 3, 10, logger)
		expect(() => {
			elevator.addFloorToDestinationQueue(-1)
		}).toThrow('Elevator cannot go below floor 0 or above floor 10')
	})

	test('will update elevator state based on added floor', () => {
		const elevator = new Elevator(1, 2, 3, 10, logger)
		elevator.addFloorToDestinationQueue(5)
		expect(elevator.isAscending).toBeTruthy()
	})

	test('should return correct time to floor without intermediate stops', () => {
		const elevator = new Elevator(1, 0, 3, 50, logger)
		const time = elevator.timeToFloorInTenthSecond(5)
		const expectedTime = ((5 * 3) / 5) * 10 // Distance to floor / speed * 10 for tenths of a second
		expect(time).toEqual(expectedTime)
	})

	test('should account for hold time at stops', () => {
		const elevator = new Elevator(1, 0, 3, 50, logger)
		elevator.addFloorToDestinationQueue(2) // Add an intermediate stop
		elevator.addFloorToDestinationQueue(5)
		const time = elevator.timeToFloorInTenthSecond(5)
		// Calculate expected time considering an intermediate stop at 2nd floor
		const expectedTime = ((5 * 3) / 5) * 10 + 200 // Additional 100 tenths of a second for hold time (stopping at 2 floors)
		expect(time).toEqual(expectedTime)
	})

	test('should correctly simulate elevator movement towards a destination', () => {
		const elevator = new Elevator(1, 0, 3, 10, logger)
		elevator.addFloorToDestinationQueue(1)
		elevator.tick()

		expect(elevator.isAscending).toBeTruthy() // Check if the elevator has started ascending
		expect(elevator['elevationInMetres']).toBeGreaterThan(0)
	})

	test('should handle door hold time at a destination floor', () => {
		const elevator = new Elevator(1, 0, 3, 10, logger)
		elevator.addFloorToDestinationQueue(1)
		elevator.tick() // 1.0m
		elevator.tick()
		elevator.tick()
		elevator.tick()
		elevator.tick()
		elevator.tick() // 3.0m?
		expect(elevator['elevationInMetres']).toEqual(3.0)
		expect(elevator['holdTime']).toEqual(100)
		elevator.tick()
		expect(elevator['elevationInMetres']).toEqual(3.0) // Elevator shouldn't have moved
		expect(elevator['holdTime']).toEqual(99) // holdTime is decrementing in 1/10 of a second
	})

	// So if I got into an elevator on the ground (call it floor 0) and went to the top (floor 50) it would take 30 seconds to get to the top (=50 x 3/5)
	test('can run the exact example as outlined in the specification, floor 0 to floor 50 in 30 seconds', () => {
		const elevator: Elevator = new Elevator(1, 0, 3, 50, logger)
		expect(elevator.timeToFloorInTenthSecond(50)).toEqual(300)
		// As we're only predicting going from 1 floor to another, with nothing in-between, there is no 10 second holdtime to account for
	})

	// So if I got into an elevator on the ground (call it floor 0) and went to the top (floor 50) it would take 30 seconds to get to the top (=50 x 3/5) and 10 seconds.
	// So after 40 seconds that elevator is available for use again.
	test('can run the exact example as outlined in the specification, floor 0 to floor 50, with a stop in 40 seconds', () => {
		const elevator: Elevator = new Elevator(1, 0, 3, 50, logger)
		elevator.addFloorToDestinationQueue(10)
		expect(elevator.timeToFloorInTenthSecond(50)).toEqual(400)
	})

	// If I was on the 5th floor and the nearest elevator was on the 7th then it would take it 2 x 3/5 = 1.2 seconds to reach me and then
	test('can run the exact example as outlined in the specification, floor 7 to floor 5, in 1.2 seconds', () => {
		const elevator: Elevator = new Elevator(1, 7, 3, 50, logger)
		expect(elevator.timeToFloorInTenthSecond(5)).toEqual(12)
	})
})
