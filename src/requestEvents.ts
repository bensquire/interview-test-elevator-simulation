type timeInSeconds = number
type requestFloor = number
type destinationFloor = number

export type ElevatorRequest = [timeInSeconds, requestFloor, destinationFloor]
export type ElevatorRequests = ElevatorRequest[]

export const requestEvents: ElevatorRequests = [
	[2, 6, 10],
	[5, 5, 3],
	[8, 10, 5],
	[18, 5, 9],
	[22, 5, 3],
	[26, 1, 9],
	[32, 6, 10],
	[35, 7, 1],
	[45, 6, 4],
	[48, 9, 5],
	[58, 1, 10],
	[68, 3, 5],
	[69, 6, 9],
	[71, 5, 10],
	[81, 7, 10],
	[85, 2, 6],
	[92, 3, 15],
	[99, 1, 50],
	[105, 5, 3],
	[110, 2, 10],
	[114, 10, 8],
	[117, 2, 1],
	[120, 4, 2],
	[128, 2, 2], // Basically do nothing
	[134, 10, 4],
	[136, 10, 7],
	[146, 10, 1],
	[156, 4, 9],
	[162, 1, 37],
	[166, 2, 2], // Basically do nothing
	[172, 4, 7],
	[173, 6, 18],
	[176, 4, 1],
	[186, 1, 2],
	[193, 2, 5],
	[202, 10, 1],
	[208, 6, 1],
	[215, 2, 10],
	[225, 5, 10],
	[229, 7, 8],
	[233, 1, 10],
	[237, 5, 7],
	[246, 7, 9],
	[248, 10, 1],
	[254, 5, 1],
	[263, 5, 10],
	[271, 2, 9],
	[272, 2, 10],
	[275, 1, 6],
	[275, 1, 26],
	[283, 8, 1]
]
