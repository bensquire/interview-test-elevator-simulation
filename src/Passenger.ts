export class Passenger {
	public originFloor: number = 0
	public destinationFloor: number = 0
	public timeRequested: number = 0
	public timeEnteredElevator?: number = undefined
	public timeExitedElevator?: number = undefined
	public elevatorId: number

	constructor(timeRequested: number, originFloor: number, destinationFloor: number, elevatorId: number) {
		this.timeRequested = timeRequested // In tenths of a second
		this.originFloor = originFloor
		this.destinationFloor = destinationFloor
		this.elevatorId = elevatorId
	}

	get hasEnteredElevator(): boolean {
		return this.timeEnteredElevator !== undefined
	}

	get hasCompletedJourney(): boolean {
		return this.timeExitedElevator !== undefined
	}

	get timeToCompletionInTenthSecond(): number {
		if (!this.timeExitedElevator) {
			throw new Error('Passenger has not yet exited the elevator')
		}

		return this.timeExitedElevator - this.timeRequested
	}

	// Currently unused outside of tests
	get timeSpentInElevatorInTenthSecond(): number {
		if (!this.timeEnteredElevator) {
			throw new Error('Passenger has not yet entered the elevator')
		}

		if (!this.timeExitedElevator) {
			throw new Error('Passenger has not yet exited the elevator')
		}

		return this.timeExitedElevator - this.timeEnteredElevator
	}

	setTimeEnteredElevator = (timeEnteredElevator: number): this => {
		this.timeEnteredElevator = timeEnteredElevator
		return this
	}

	setTimeExitedElevator = (timeExitedElevator: number): this => {
		this.timeExitedElevator = timeExitedElevator
		return this
	}
}
