import { MessageLogger } from './MessageLogger'

describe('MessageLogger', () => {
	let logger: MessageLogger

	beforeEach(() => {
		logger = new MessageLogger()
	})

	test('setCurrentTimeInTenthOfASecond sets the current time correctly', () => {
		logger.setCurrentTimeInTenthOfASecond(50)
		logger.passengerPressesButton(1, 2) // Example usage to check time formatting
		expect(logger['log'][0]).toContain('Time 5.0')
	})

	test('passengerPressesButton logs the correct message', () => {
		logger.setCurrentTimeInTenthOfASecond(30)
		logger.passengerPressesButton(1, 3)
		expect(logger['log'][0]).toContain('Time 3.0 Floor 1 Passenger Pressed Up (Going to Floor 3).')
	})

	test('elevatorRespondsToCall logs the correct message for ascending', () => {
		logger.setCurrentTimeInTenthOfASecond(40)
		logger.elevatorRespondsToCall(1, 1, 4)
		expect(logger['log'][0]).toContain('Call Response to Floor 4. Elevator 1 on Floor 1. Ascending to Floor 4.')
	})

	test('elevatorRespondsToCall logs the correct message for descending', () => {
		logger.setCurrentTimeInTenthOfASecond(20)
		logger.elevatorRespondsToCall(2, 5, 2)
		expect(logger['log'][0]).toContain('Call Response to Floor 2. Elevator 2 on Floor 5. Descending to Floor 2.')
	})

	test('elevatorArrivedWaitingAndMovingOn logs the correct message', () => {
		logger.setCurrentTimeInTenthOfASecond(60)
		logger.elevatorArrivedWaitingAndMovingOn(1, 3, 10, 5)
		expect(logger['log'][0]).toContain('Time 6.0 Elevator 1 arrived Floor 3. Waited 10 seconds. Moving to Floor 5.')
	})

	test('elevatorArrivedAndWaiting logs the correct message', () => {
		logger.setCurrentTimeInTenthOfASecond(70)
		logger.elevatorArrivedAndWaiting(1, 4, 5)
		expect(logger['log'][0]).toContain('Time 7.0 Elevator 1 arrived Floor 4. Waited 5 seconds.')
	})

	test('passengerArrives logs the correct message', () => {
		logger.passengerArrives(5, 120, 240)
		expect(logger['log'][0]).toContain('Passenger on Floor 5 - Total time 120 total all passengers is 240.')
	})
})
