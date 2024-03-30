import { Controller } from './Controller'
import { Elevator } from './Elevator'
import { ElevatorRequest } from './requestEvents'
import { MessageLogger } from './MessageLogger'

describe('The controller', () => {
	test('can direct a elevator to collect an passenger from the current floor and then move onto the destination', () => {
		const logger = new MessageLogger()
		const elevator: Elevator = new Elevator(1, 0, 3, 10, logger)
		const requests: ElevatorRequest[] = [[0, 0, 10]] // From floor 0 to floor 10

		const controller = new Controller([elevator], requests, logger)
		controller.execute()
		expect(controller['passengers'].length).toEqual(1)
		const allJourneysCompleted = controller['passengers'].every(passenger => passenger.hasCompletedJourney)
		expect(allJourneysCompleted).toBeTruthy()
	})

	test('can direct a elevator to collect an passenger from a floor and then move onto the destination', () => {
		const logger = new MessageLogger()
		const elevator: Elevator = new Elevator(1, 0, 3, 10, logger)
		const requests: ElevatorRequest[] = [[0, 1, 10]] // From floor 1 to floor 10

		const controller = new Controller([elevator], requests, logger)
		controller.execute()
		expect(controller['passengers'].length).toEqual(1)
		const allJourneysCompleted = controller['passengers'].every(passenger => passenger.hasCompletedJourney)
		expect(allJourneysCompleted).toBeTruthy()
	})

	test('can direct a elevator to collect multiple passengers on the same floor going to different destinations', () => {
		const logger = new MessageLogger()
		const elevator: Elevator = new Elevator(1, 0, 3, 10, logger)
		const requests: ElevatorRequest[] = [
			[0, 1, 10],
			[0, 1, 2]
		]

		const controller = new Controller([elevator], requests, logger)
		controller.execute()
		expect(controller['passengers'].length).toEqual(2)
		const allJourneysCompleted = controller['passengers'].every(passenger => passenger.hasCompletedJourney)
		expect(allJourneysCompleted).toBeTruthy()
	})

	test('can direct a elevator to collect passengers from multiple floors going to same destination floor', () => {
		const logger = new MessageLogger()
		const elevator: Elevator = new Elevator(1, 0, 3, 10, logger)
		const requests: ElevatorRequest[] = [
			[0, 1, 10],
			[1, 2, 10],
			[3, 3, 10]
		]

		const controller = new Controller([elevator], requests, logger)
		controller.execute()
		expect(controller['passengers'].length).toEqual(3)
		const allJourneysCompleted = controller['passengers'].every(passenger => passenger.hasCompletedJourney)
		expect(allJourneysCompleted).toBeTruthy()
	})

	test('can direct a elevator to collect passengers from multiple floors going to same destination floor, but backwards', () => {
		const logger = new MessageLogger()
		const elevator: Elevator = new Elevator(1, 10, 3, 10, logger)
		const requests: ElevatorRequest[] = [
			[0, 10, 1],
			[1, 9, 1],
			[3, 6, 1]
		]

		const controller = new Controller([elevator], requests, logger)
		controller.execute()
		expect(controller['passengers'].length).toEqual(3)
		const allJourneysCompleted = controller['passengers'].every(passenger => passenger.hasCompletedJourney)
		expect(allJourneysCompleted).toBeTruthy()
	})

	test('can direct a elevator to collect a an passenger and once finished reverse direction to get another', () => {
		const logger = new MessageLogger()
		const elevator: Elevator = new Elevator(1, 2, 3, 10, logger)
		const requests: ElevatorRequest[] = [
			[0, 3, 10],
			[1, 1, 2]
		]

		const controller = new Controller([elevator], requests, logger)
		controller.execute()
		expect(controller['passengers'].length).toEqual(2)
		const allJourneysCompleted = controller['passengers'].every(passenger => passenger.hasCompletedJourney)
		expect(allJourneysCompleted).toBeTruthy()
	})
})
