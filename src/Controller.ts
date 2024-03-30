import { Elevator } from './Elevator'
import { type ElevatorRequest, type ElevatorRequests } from './requestEvents'
import { Passenger } from './Passenger'
import { MessageLogger } from './MessageLogger'

export class Controller {
	private readonly elevators: Elevator[] = []
	private readonly rawRequests: ElevatorRequests = []
	private logger: MessageLogger
	private unprocessedRequests: ElevatorRequests = []
	private passengers: Passenger[] = []
	private timeInTenthsOfASecond: number = 0

	public constructor(elevators: Elevator[], rawRequests: ElevatorRequests, logger: MessageLogger) {
		this.elevators = elevators
		this.rawRequests = rawRequests
		this.logger = logger
	}

	private get hasIncompleteRequests(): boolean {
		return (
			this.passengers.some(passenger => passenger.hasEnteredElevator && !passenger.hasCompletedJourney) ||
			this.elevators.some(elevator => !elevator.isDestinationQueueEmpty) ||
			this.unprocessedRequests.length > 0
		)
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

	public execute(): void {
		let isStillRunning = true

		while (isStillRunning) {
			const foundEvents = this.findEventAtTime(this.timeInTenthsOfASecond, this.rawRequests)
			this.unprocessedRequests = [...foundEvents, ...this.unprocessedRequests].sort((a, b) => b[0] - a[0])

			for (let i = this.unprocessedRequests.length - 1; i >= 0; i--) {
				const request: ElevatorRequest = this.unprocessedRequests[i]

				// Question: Do people getting on and off at the same floor, count as valid passengers
				// if (event[1] === event[2]) {
				// 	const sameFloorPassenger = new Passenger(event[0], event[1], event[2], this.elevators[0].id)
				// 	sameFloorPassenger.setTimeEnteredElevator(this.timeInTenthsOfASecond)
				// 	sameFloorPassenger.setTimeExitedElevator(this.timeInTenthsOfASecond)
				// 	this.passengers.push(sameFloorPassenger)
				// 	continue
				// }
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
				this.onboardPassengers(elevator) // Do before tick just in-case, someone presses at time 0
				elevator.tick()

				// Time 4251.6 Elevator 1 arrived Floor 7. Waited 10 seconds. Moving to Floor 10.
				// Time 4263.4 Elevator 1 arrived Floor 10. Waited ten seconds.
			})

			this.timeInTenthsOfASecond += 1 // 10th of 1 second
			isStillRunning = this.eventsToProcessOrPeopleOnElevator(this.rawRequests, this.elevators)
			this.logger.setCurrentTimeInTenthOfASecond(this.timeInTenthsOfASecond)
		}
	}

	private findEventAtTime = (timeInTenthsOfASecond: number, events: ElevatorRequests): ElevatorRequests => {
		return (
			events.filter(event => {
				return event[0] * 10 === timeInTenthsOfASecond
			}) || []
		)
	}

	private hasEventsAfterCurrentTime = (timeInTenthsOfASecond: number, events: ElevatorRequests): boolean => {
		const lastEventIndex = events.length - 1
		return events[lastEventIndex]?.[0] * 10 > timeInTenthsOfASecond
	}

	private eventsToProcessOrPeopleOnElevator = (events: ElevatorRequests, elevators: Elevator[]): boolean => {
		return this.hasEventsAfterCurrentTime(this.timeInTenthsOfASecond, events) || this.hasIncompleteRequests
	}

	private findQuickestElevatorToGetPassengerToFloor = (request: ElevatorRequest): Elevator | null => {
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

	private offLoadPassengers = (elevator: Elevator): void => {
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

	private onboardPassengers = (elevator: Elevator): void => {
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
