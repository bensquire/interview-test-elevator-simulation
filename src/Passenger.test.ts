import { Passenger } from './Passenger'

describe('Passenger', () => {
	test('constructor initializes properties correctly', () => {
		const passenger = new Passenger(10, 1, 5, 2)
		expect(passenger.originFloor).toBe(1)
		expect(passenger.destinationFloor).toBe(5)
		expect(passenger['timeRequested']).toBe(10)
		expect(passenger.elevatorId).toBe(2)
		expect(passenger.hasEnteredElevator).toBeFalsy()
		expect(passenger.hasCompletedJourney).toBeFalsy()
	})
})

describe('Time Setters and Getters', () => {
	let passenger: Passenger

	beforeEach(() => {
		passenger = new Passenger(100, 0, 10, 1) // timeRequested set at 100 tenths of a second
	})

	test('setTimeEnteredElevator updates timeEnteredElevator correctly', () => {
		passenger.setTimeEnteredElevator(200) // Passenger enters the elevator at 200 tenths of a second
		expect(passenger['timeEnteredElevator']).toBe(200)
		expect(passenger.hasEnteredElevator).toBeTruthy()
	})

	test('setTimeExitedElevator updates timeExitedElevator correctly and calculates journey times', () => {
		passenger.setTimeEnteredElevator(200) // Time entered
		passenger.setTimeExitedElevator(500) // Time exited
		expect(passenger['timeExitedElevator']).toBe(500)
		expect(passenger.hasCompletedJourney).toBeTruthy()
		expect(passenger.timeToCompletionInTenthSecond).toBe(400) // 500 - 100 = 400
		expect(passenger.timeSpentInElevatorInTenthSecond).toBe(300) // 500 - 200 = 300
	})

	test('timeToCompletionInTenthSecond throws if timeExitedElevator is not set', () => {
		expect(() => passenger.timeToCompletionInTenthSecond).toThrow('Passenger has not yet exited the elevator')
	})

	test('timeSpentInElevatorInTenthSecond throws if timeEnteredElevator or timeExitedElevator is not set', () => {
		passenger.setTimeEnteredElevator(200)
		expect(() => passenger.timeSpentInElevatorInTenthSecond).toThrow('Passenger has not yet exited the elevator')
		passenger['timeEnteredElevator'] = undefined // Reset to simulate not entering
		expect(() => passenger.timeSpentInElevatorInTenthSecond).toThrow('Passenger has not yet entered the elevator')
	})
})
