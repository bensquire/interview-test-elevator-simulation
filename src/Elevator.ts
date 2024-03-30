import { MessageLogger } from './MessageLogger'

const ELEVATOR_HOLD_TIME_IN_TENTHS_SECOND = 100
const ELEVATOR_SPEED_METRES_PER_SECOND = 5
const ELEVATOR_DISTANCE_PER_TENTH_SECOND = ELEVATOR_SPEED_METRES_PER_SECOND / 10

export enum ElevatorState {
	Up = 'Up',
	Down = 'Down',
	Idle = 'Idle'
}

export class Elevator {
	public id: number
	private readonly floorHeightInMetres: number
	private readonly totalFloors: number
	private elevationInMetres: number
	private destinationQueue: number[] = []
	private holdTime: number = 0
	private logger: MessageLogger
	private state: ElevatorState = ElevatorState.Idle

	constructor(id: number, floor: number, floorHeightInMetres: number, totalFloors: number, logger: MessageLogger) {
		this.id = id
		this.elevationInMetres = floor * floorHeightInMetres
		this.floorHeightInMetres = floorHeightInMetres
		this.totalFloors = totalFloors
		this.logger = logger
	}

	public get floor(): number {
		if (this.isIdle || this.isAscending) {
			return Math.floor(this.elevationInMetres / this.floorHeightInMetres)
		}

		return Math.ceil(this.elevationInMetres / this.floorHeightInMetres)
	}

	public get isAtFloor(): boolean {
		return this.elevationInMetres % this.floorHeightInMetres === 0
	}

	public get isBetweenFloors(): boolean {
		return !this.isAtFloor
	}

	public get isAtADestinationFloor(): boolean {
		if (this.isBetweenFloors) {
			return false
		}

		return this.destinationQueue.includes(this.floor)
	}

	public get isAscending(): boolean {
		return this.state === ElevatorState.Up
	}

	public get isDescending(): boolean {
		return this.state === ElevatorState.Down
	}

	public get isIdle(): boolean {
		return this.state === ElevatorState.Idle
	}

	public get isDestinationQueueEmpty(): boolean {
		return this.destinationQueue.length === 0
	}

	private get highestElevation(): number {
		return this.floorHeightInMetres * this.totalFloors
	}

	public removeFloorFromDestinationQueue = (): this => {
		this.destinationQueue = this.destinationQueue.filter(item => item !== this.floor)
		return this
	}

	public addFloorToDestinationQueue = (floor: number): this => {
		if (this.isFloorInQueue(floor)) {
			return this
		}

		if (floor < 0 || floor > this.totalFloors) {
			throw new Error(`Elevator cannot go below floor 0 or above floor ${this.totalFloors}`)
		}

		// Elevator is waiting on this floor already, assume people get on and off instantly
		if (this.floor === floor && (this.holdTime > 0 || this.isIdle)) {
			return this
		}

		this.destinationQueue.push(floor)
		this.destinationQueue = Array.from(new Set([...this.destinationQueue])) // Remove dupes

		if (this.isIdle) {
			this.state = this.floor > floor ? ElevatorState.Down : ElevatorState.Up
		}

		if (this.isAscending) {
			this.destinationQueue.sort((a, b) => a - b)
		} else if (this.isDescending) {
			this.destinationQueue.sort((a, b) => b - a)
		}

		return this
	}

	public timeToFloorInTenthSecond(targetFloor: number): number {
		const currentFloor = this.floor
		const floorsToMove = Math.abs(targetFloor - currentFloor)

		if (floorsToMove === 0) {
			return 0
		}

		// Time to move one floor in tenths of a second, considering the speed and floor height
		const timePerFloorTenthsSecond = (this.floorHeightInMetres / ELEVATOR_SPEED_METRES_PER_SECOND) * 10

		// Initial time to move to the target floor without stops, including any existing holdTime
		let totalTimeInTenthsSecond = floorsToMove * timePerFloorTenthsSecond + this.holdTime

		// Calculate the number of stops the elevator will make before reaching the target floor
		const stopsBeforeTarget = this.destinationQueue.filter(
			floor => (this.isAscending && floor <= targetFloor && floor > currentFloor) || (this.isDescending && floor >= targetFloor && floor < currentFloor)
		).length

		// Add hold time for each stop
		totalTimeInTenthsSecond += stopsBeforeTarget * ELEVATOR_HOLD_TIME_IN_TENTHS_SECOND
		return totalTimeInTenthsSecond
	}

	public tick = (): void => {
		// The elevator is opening/closing its doors
		if (this.holdTime > 0) {
			this.holdTime--

			if (this.holdTime === 0 && this.isDestinationQueueEmpty) {
				this.logger.elevatorArrivedAndWaiting(this.id, this.floor, ELEVATOR_HOLD_TIME_IN_TENTHS_SECOND / 10)
			} else if (this.holdTime === 0 && this.isDestinationQueueEmpty) {
				this.logger.elevatorArrivedWaitingAndMovingOn(this.id, this.floor, ELEVATOR_HOLD_TIME_IN_TENTHS_SECOND / 10, this.destinationQueue[0])
			}

			return
		}

		// The elevator has nowhere to go
		if (this.destinationQueue.length === 0) {
			this.state = ElevatorState.Idle
			return
		}

		if (this.isAscending && this.elevationInMetres < this.highestElevation) {
			this.elevationInMetres += ELEVATOR_DISTANCE_PER_TENTH_SECOND
		} else if (this.isDescending && this.elevationInMetres > 0) {
			this.elevationInMetres -= ELEVATOR_DISTANCE_PER_TENTH_SECOND
		}

		if (this.isAtADestinationFloor) {
			this.holdTime = ELEVATOR_HOLD_TIME_IN_TENTHS_SECOND
			this.removeFloorFromDestinationQueue()
		}

		this.state = this.destinationQueue[0] > this.floor ? ElevatorState.Up : ElevatorState.Down
	}

	private isFloorInQueue = (floor: number): boolean => {
		return this.destinationQueue.includes(floor)
	}
}
