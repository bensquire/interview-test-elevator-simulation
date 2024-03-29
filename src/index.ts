import { requestEvents } from './requestEvents'
import { Controller } from './Controller'
import { Elevator } from './Elevator'
import { MessageLogger } from './MessageLogger'

const TOTAL_ELEVATORS = 5
const TOTAL_FLOORS = 50
const FLOOR_HEIGHT_METRES = 3
const elevators = []

const logger = new MessageLogger()
for (let x = 0; x < TOTAL_ELEVATORS; x++) {
	elevators.push(new Elevator(x + 1, Math.floor(Math.random() * (TOTAL_FLOORS + 1)), FLOOR_HEIGHT_METRES, TOTAL_FLOORS, logger))
}

const controller = new Controller(elevators, requestEvents, logger)
controller.execute()
logger.outputAllLogs()
// console.log(`Total Request Events: ${requestEvents.length}`)
// console.log(`Total Dropped Off Passengers: ${controller.passengers.filter(passenger => passenger.hasCompletedJourney).length}`)
// console.log(`Total Non-dropped Off Passengers: ${controller.passengers.filter(passenger => !passenger.hasCompletedJourney).length}`)
