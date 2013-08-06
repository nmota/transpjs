function trafficSimulation (FLIGHT_TIME, TURN_TIME, SIMTIME,SEED,LAMBDA) {
	var sim = new Sim();
	var stats = new Sim.Population();
	
	// Struture to a possible event based sistem instead of messages to book keep vessels locations
	var Location = ["Corvo",
					"Faial"
					];
					
	// Buffers array to Gares, until we change the logic of passenger dispatcher				
	var gBuffers = [];
	
	//Needed to the current logic of schedules
    var gGare = [];
	
	//Gateway Buffers, aat the end there should be n*(n-1)....
	var Gare1 = new Sim.Buffer("Gare do Corvo",1000);
	var Gare2 = new Sim.Buffer("Gare do Faial",1500);
	
	//Gateway Buffers array, until we change the logic of passenger dispatcher
	gBuffers[0]=Gare1;
	gBuffers[1]=Gare2;
	
	// Vessel Buffers -- at the end each vessel shoud have at least 8 buffers...or maybe and proprety array with 8 length
	var Plane1 = new Sim.Buffer("Q200_1",30);
	
	// Random variable
	var random = new Random(SEED);
	
	//Function to control the logic of passenger travel it should model the passenger decision process based on known stats	
	function passDispatcher (plane_BUFFER,gare_BUFFER) {
		var nPassTravel = 0;
		nPassTravel = Math.min(plane_BUFFER.size()-plane_BUFFER.current(),gare_BUFFER.current());
		return nPassTravel;
	}	
	
	//Gateways entities
	var Gare = {
		start: function () {
		//document.write("Gare do " +this.name+" está aberta <br>");
		},
		onMessage: function (sender,message) {
        
		//Receive message and schedule reply
		document.write(this.time()+" - Avião está no " + this.name + "<br>");
        
		//Empty th plane
		this.getBuffer(sender.buff,sender.buff.current());
        
		//schedule new message for take off
		var newMessage = "Runway clear <br>";
		this.send(newMessage,TURN_TIME,sender);
		}
	};
		
	var Q200 = {
		currentLocation: 0, //the location of the vessel
		start: function () {
			//send start message - - this logic shoud change to support diferent starting points
			var aMessage = "Aterrei" + Location[this.currentLocation].name;
			this.send(aMessage,0,gCorvo);
			document.write(this.time()+" - Primeira aterragem no "+  Location[this.currentLocation].name + " <br>");
		},
		onMessage: function (sender, message) {
			//receive message and procede with the take off and landing cycle
			//take off
			document.write(this.time()+" - "+ sender.name + "'s Runway clear <br>");	
		    document.write(this.time()+" - Mensagem recebida, over <br>");
            
			//boarding passengers
			var passEmbarca = passDispatcher(this.buff, sender.buff);
			this.putBuffer(this.buff,passEmbarca);
            
			//Logging
			document.write(this.time()+" - Avião tem " + Plane1.current()+" passageiros <br>");
			document.write(this.time()+" - Avião está no ar <br>");
            
			//Tirar passageiros da Gare
			this.getBuffer(sender.buff,passEmbarca);
            
			//landing procedure
			this.currentLocation = 1 - this.currentLocation;
			var aMessage = "Aterrei" + Location[this.currentLocation].name;
			this.send(aMessage,FLIGHT_TIME,gGare[this.currentLocation]);		
		}
	};	
	
	//Ii poupulates the system
	var centralReservas = {
		start: function () {
			var nextReserv = random.exponential(LAMBDA);
			this.putBuffer(gBuffers[0],1);
			this.putBuffer(gBuffers[1],1);
			document.write(this.time()+" - "+gBuffers[0].name+" tem "+gBuffers[0].current()+" passageiros;<br> "+gBuffers[1].name+" tem " +gBuffers[1].current()+" passageiros;<br>");
			this.setTimer(nextReserv).done(this.start);
		}
	};

	// Initiate entities, centralReservas() and entiites - important to keep the order
    var Reservas = sim.addEntity(centralReservas);
	var gCorvo = sim.addEntity(Gare);
	var gFaial = sim.addEntity(Gare);
	
	//Extend entities properties
	gCorvo.name = "Corvo";
	gFaial.name = "Faial";
	gCorvo.buff = Gare1;
	gFaial.buff = Gare2;
	
	gGare[0]=gCorvo;
	gGare[1]=gFaial; 
	
	// Initiate vessels and extend it's properties
	var Q200_1 = sim.addEntity(Q200);
	Q200_1.name ="Q200";
	Q200_1.buff = Plane1;
	
	sim.setLogger(function (str) {
		document.write(str);
	});
		
	sim.simulate(SIMTIME);
}	