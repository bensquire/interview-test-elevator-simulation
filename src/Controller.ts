import { type ElevatorInterface } from './Elevator'
import { type ElevatorRequest, type ElevatorRequests } from './requestEvents'
import { Passenger } from './Passenger'
import { MessageLogger } from './MessageLogger'

export class Controller {
	private readonly elevators: ElevatorInterface[] = []
	private readonly rawRequests: ElevatorRequests = []
	private logger: MessageLogger
	private unprocessedRequests: ElevatorRequests = []
	private passengers: Passenger[] = []
	private timeInTenthsOfASecond: number = 0

	public constructor(elevators: ElevatorInterface[], rawRequests: ElevatorRequests, logger: MessageLogger) {
		this.elevators = elevators
		this.rawRequests = rawRequests
		this.logger = logger
	}

	public execute(): void {
		let isStillRunning = true

		while (isStillRunning) {
			const foundEvents = this.findEventAtTime(this.timeInTenthsOfASecond, this.rawRequests)
			this.unprocessedRequests = [...foundEvents, ...this.unprocessedRequests].sort((a, b) => b[0] - a[0])

			for (let i = this.unprocessedRequests.length - 1; i >= 0; i--) {
				const request: ElevatorRequest = this.unprocessedRequests[i]

				// Note: If people get on and off at same floor, we could deal with that here.

				this.logger.passengerPressesButton(request[1], request[2])

				const quickestElevator = this.findQuickestElevatorToGetPassengerToFloor(request)
				if (quickestElevator === null) {
					continue
				}

				this.logger.elevatorRespondsToCall(quickestElevator.id, quickestElevator.floor, request[2])
				quickestElevator.addFloorToDestinationQueue(request[1]) // Pickup Floor
				quickestElevator.addFloorToDestinationQueue(request[2]) // Destination Floor
				this.passengers.push(new Passenger(request[0] * 10, request[1], request[2], quickestElevator.id))
				this.unprocessedRequests.splice(i, 1)
			}

			this.elevators.forEach(elevator => {
				this.offLoadPassengers(elevator)
				this.onboardPassengers(elevator) // Do before tick just in-case someone presses at time 0
				elevator.tick()
			})

			this.timeInTenthsOfASecond += 1 // 10th of 1 second
			isStillRunning = this.eventsToProcessOrPeopleOnElevator
			this.logger.setCurrentTimeInTenthOfASecond(this.timeInTenthsOfASecond)
		}
	}

	private get hasIncompleteRequests(): boolean {
		return (
			this.passengers.some(passenger => passenger.hasEnteredElevator && !passenger.hasCompletedJourney) ||
			this.elevators.some(elevator => !elevator.isDestinationQueueEmpty) ||
			this.unprocessedRequests.length > 0
		)
	}

	private get hasEventsAfterCurrentTime(): boolean {
		const lastEventIndex = this.rawRequests.length - 1
		return this.rawRequests[lastEventIndex]?.[0] * 10 > this.timeInTenthsOfASecond
	}

	private get eventsToProcessOrPeopleOnElevator(): boolean {
		return this.hasEventsAfterCurrentTime || this.hasIncompleteRequests
	}

	private get totalForAllCompletedJourneysInSeconds(): number {
		return (
			this.passengers
				.filter(passenger => passenger.hasCompletedJourney)
				.reduce((totalTime, passenger) => {
					return totalTime + passenger.timeToCompletionInTenthSecond
				}, 0) / 10
		)
	}

	private findEventAtTime = (timeInTenthsOfASecond: number, events: ElevatorRequests): ElevatorRequests => {
		return (
			events.filter(event => {
				return event[0] * 10 === timeInTenthsOfASecond
			}) || []
		)
	}

	private findQuickestElevatorToGetPassengerToFloor = (request: ElevatorRequest): ElevatorInterface | null => {
		const [_, startFloor, destinationFloor] = request
		const isAscensionRequest = startFloor < destinationFloor

		const candidateElevators = this.elevators
			.map(elevator => ({
				elevator,
				timeToStart: elevator.timeToFloorInTenthSecond(startFloor),
				isMovingTowards: isAscensionRequest
					? elevator.isAscending && elevator.floor <= startFloor
					: elevator.isDescending && elevator.floor >= startFloor
			}))
			.filter(({ elevator, isMovingTowards }) => elevator.isIdle || isMovingTowards)
			// Sorting to find the closest in terms of time, considering only suitable moving direction or idle state
			.sort((a, b) => a.timeToStart - b.timeToStart)

		// Return the first (closest) elevator in the sorted list or null if none are suitable
		return candidateElevators.length > 0 ? candidateElevators[0].elevator : null
	}

	private offLoadPassengers = (elevator: ElevatorInterface): void => {
		if (!elevator.isAtFloor) {
			return
		}

		this.passengers
			.filter(passenger => passenger.elevatorId === elevator.id && passenger.destinationFloor === elevator.floor && !passenger.hasCompletedJourney)
			.forEach((passenger: Passenger) => {
				// Note, doesn't take into account 10 secs, assumes person gets off of elevator instantly
				passenger.setTimeExitedElevator(this.timeInTenthsOfASecond)
				elevator.removeFloorFromDestinationQueue()
				this.logger.passengerArrives(elevator.floor, passenger.timeToCompletionInTenthSecond / 10, this.totalForAllCompletedJourneysInSeconds)
			})
	}

	private onboardPassengers = (elevator: ElevatorInterface): void => {
		if (!elevator.isAtFloor) {
			return
		}

		this.passengers
			.filter(
				passenger =>
					passenger.elevatorId === elevator.id &&
					passenger.originFloor === elevator.floor &&
					!passenger.hasEnteredElevator &&
					!passenger.hasCompletedJourney
			)
			.forEach((passenger: Passenger) => {
				// Note, doesn't take into account 10 secs, assumes person gets onto elevator instantly
				passenger.setTimeEnteredElevator(this.timeInTenthsOfASecond)
			})
	}
}
