function RunSimulation() {
	var flight_time = parseFloat($('[name="FLIGHT_TIME"]').val());
	var turn_time = parseFloat($('[name="TURN_TIME"]').val());
	var simtime = parseFloat($('[name="SIMTIME"]').val());
	var seed = parseFloat($('[name="SEED"]').val());
	var lambda = parseFloat($('[name="LAMBDA"]').val());
			
	var results = trafficSimulation(flight_time, turn_time, simtime, seed,lambda);
	var msg = "Simulation Results for ["
						+ "travel time = " + flight_time
						+ ", Turnover tine = " + turn_time
						+ ", Simulation time = " + simtime
						+ ", Seed = " + seed
						+ ", Average number of passengers arrival = " + lambda
						+ "]";	
	$(".results").append(msg);
}

function clearResults() {
	$(".results").html('<a href="" id="clear_results">Clear</a><hr>');
}

function addNew(a) {
	$(a).children("table:first").clone().attr('prependTo(a));
}
