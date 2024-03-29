export class MessageLogger {
	private log: Array<string> = []
	private currentTime: number = 0

	public setCurrentTimeInTenthOfASecond = (time: number) => {
		this.currentTime = time
	}

	public passengerPressesButton = (requestFloor: number, destinationFloor: number): this => {
		this.log.push(
			`Time ${(this.currentTime / 10).toFixed(1)} Floor ${requestFloor} Passenger Pressed ${requestFloor < destinationFloor ? 'Up' : 'Down'} (Going to Floor ${destinationFloor}).`
		)
		return this
	}

	public elevatorRespondsToCall = (elevatorId: number, currentFloor: number, destinationFloor: number): this => {
		this.log.push(
			`Time ${(this.currentTime / 10).toFixed(1)} Call Response to Floor ${destinationFloor}. Elevator ${elevatorId} on Floor ${currentFloor}. ${currentFloor < destinationFloor ? 'Ascending' : 'Descending'} to Floor ${destinationFloor}.`
		)
		return this
	}

	public elevatorArrivedWaitingAndMovingOn = (elevatorId: number, arrivalFloor: number, waitInSeconds: number, destinationFloor: number): this => {
		this.log.push(
			`Time ${(this.currentTime / 10).toFixed(1)} Elevator ${elevatorId} arrived Floor ${arrivalFloor}. Waited ${waitInSeconds} seconds. Moving to Floor ${destinationFloor}.`
		)
		return this
	}

	public elevatorArrivedAndWaiting = (elevatorId: number, arrivalFloor: number, waitInSeconds: number): this => {
		this.log.push(`Time ${(this.currentTime / 10).toFixed(1)} Elevator ${elevatorId} arrived Floor ${arrivalFloor}. Waited ${waitInSeconds} seconds.`)
		return this
	}

	public passengerArrives = (destinationFloor: number, passengerTotalTime: number, allPassengerTotalTime: number): this => {
		this.log.push(`Passenger on Floor ${destinationFloor} - Total time ${passengerTotalTime} total all passengers is ${allPassengerTotalTime}.`)
		return this
	}

	public outputAllLogs = () => {
		this.log.forEach(logLine => console.log(logLine))
	}
}
