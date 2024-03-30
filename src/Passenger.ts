export interface PassengerInterface {
	originFloor: number
	destinationFloor: number
	elevatorId: number

	readonly hasEnteredElevator: boolean
	readonly hasCompletedJourney: boolean
	readonly timeToCompletionInTenthSecond: number
	readonly timeSpentInElevatorInTenthSecond: number

	setTimeEnteredElevator(timeEnteredElevator: number): this
	setTimeExitedElevator(timeExitedElevator: number): this
}

export class Passenger implements PassengerInterface {
	public originFloor: number
	public destinationFloor: number
	public elevatorId: number
	private readonly timeRequested: number
	private timeEnteredElevator?: number = undefined
	private timeExitedElevator?: number = undefined

	constructor(timeRequested: number, originFloor: number, destinationFloor: number, elevatorId: number) {
		this.timeRequested = timeRequested // In tenths of a second
		this.originFloor = originFloor
		this.destinationFloor = destinationFloor
		this.elevatorId = elevatorId
	}

	public get hasEnteredElevator(): boolean {
		return this.timeEnteredElevator !== undefined
	}

	public get hasCompletedJourney(): boolean {
		return this.timeExitedElevator !== undefined
	}

	public get timeToCompletionInTenthSecond(): number {
		if (!this.timeExitedElevator) {
			throw new Error('Passenger has not yet exited the elevator')
		}

		return this.timeExitedElevator - this.timeRequested
	}

	// Currently unused outside of tests
	public get timeSpentInElevatorInTenthSecond(): number {
		if (!this.timeEnteredElevator) {
			throw new Error('Passenger has not yet entered the elevator')
		}

		if (!this.timeExitedElevator) {
			throw new Error('Passenger has not yet exited the elevator')
		}

		return this.timeExitedElevator - this.timeEnteredElevator
	}

	public setTimeEnteredElevator = (timeEnteredElevator: number): this => {
		this.timeEnteredElevator = timeEnteredElevator
		return this
	}

	public setTimeExitedElevator = (timeExitedElevator: number): this => {
		this.timeExitedElevator = timeExitedElevator
		return this
	}
}
