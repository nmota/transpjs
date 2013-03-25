function trafficSimulation (FLIGHT_TIME, TURN_TIME, SIMTIME,SEED,LAMBDA) {
	var sim = new Sim();
	var stats = new Sim.Population();
	
	// Estrutura eventual para um sistemas de eventos em vez de mensagens usado agora para manter registo da localização do avião
	var Location = ["Corvo",
					"Faial"
					];
					
	// Buffers array para as Gares, temporário até se mudar a lógica do passenger dispatcher				
	var gBuffers = new Array();
	
	//Necessário para a lógica atual de horário, a eliminar
	var gGare = new Array();
	
	//Buffers das Gares no final deverão existir 72 buffers destes..
	var Gare1 = new Sim.Buffer("Gare do Corvo",1000);
	var Gare2 = new Sim.Buffer("Gare do Faial",1500);
	
	// Buffers array para as Gares, temporário até se mudar a lógica do passenger dispatcher
	gBuffers[0]=Gare1;
	gBuffers[1]=Gare2;
	
	// Buffer do Avião -- no final cada avião deverá ter 9 buffers....
	var Plane1 = new Sim.Buffer("Q200_1",30);
	
	// Variiável aleatória;
	var random = new Random(SEED);
	
	//Controlo da prioritização de transporte -- esta função deverá aumentar de complexidade muito rapidamente	
	function passDispatcher (plane_BUFFER,gare_BUFFER) {
		var nPassTravel = 0;
		nPassTravel = Math.min(plane_BUFFER.size()-plane_BUFFER.current(),gare_BUFFER.current());
		return nPassTravel;
	};	
	
	//Entidade das Gares
	var Gare = {
		start: function () {
		//document.write("Gare do " +this.name+" está aberta <br>");
		},
		onMessage: function (sender,message) {
		//Receive message and schedule reply
		document.write("Avião está no " + this.name + "<br>");
		//Empty th plane
		this.getBuffer(sender.buff,sender.buff.current());
		//schedule new message for take off
		var newMessage = "Runway clear <br>";
		this.send(newMessage,TURN_TIME,sender);
		}
	};
		
	var Q200 = {
		currentLocation: 0, //the location of the plane 
		start: function () {
			//send start message - - deve mudar para acomodar diferentes locais de começo
			var aMessage = "Aterrei" + Location[this.currentLocation].name;
			this.send(aMessage,0,gCorvo);
			document.write("Primeira aterragem no "+  Location[this.currentLocation].name + " <br>");
		},
		onMessage: function (sender, message) {
			//receive messagem and procede with the take off and landing cycle
			//take off
			document.write(sender.name + "'s Runway clear <br>");	
		    document.write("Mensagem recebida, over <br>");
			//embarcar passageiros
			passEmbarca = passDispatcher(this.buff, sender.buff);
			this.putBuffer(this.buff,passEmbarca);
			//Logging
			document.write("Avião tem " + Plane1.current()+"<br>");
			document.write("Avião está no ar <br>");
			//Tirar passageiros da Gare
			this.getBuffer(sender.buff,passEmbarca);
			//landing procedure
			this.currentLocation = 1 - this.currentLocation;
			var aMessage = "Aterrei" + Location[this.currentLocation].name;
			this.send(aMessage,FLIGHT_TIME,gGare[this.currentLocation]);		
		}
	};	
		
	var centralReservas = {
		start: function () {
			var nextReserv = random.exponential(LAMBDA);
			this.putBuffer(gBuffers[0],1);
			document.write(""+gBuffers[0].current()+"<br>");
			this.putBuffer(gBuffers[1],1);
			this.setTimer(nextReserv).done(this.start);
		}
	};

	// Adicionar as primeiras entidade, central de resercas e Gares - Ordem é importante
	var Reservas = sim.addEntity(centralReservas);
	var gCorvo = sim.addEntity(Gare);
	var gFaial = sim.addEntity(Gare);
	
	//Extend entitys properties
	gCorvo.name = "Corvo";
	gFaial.name = "Faial";
	gCorvo.buff = Gare1;
	gFaial.buff = Gare2;
	
	gGare[0]=gCorvo;
	gGare[1]=gFaial; 
	
	// Adicionar aviões ao sistema e extender as suas propriedades
	var Q200_1 = sim.addEntity(Q200);
	Q200_1.name ="Q200";
	Q200_1.buff = Plane1;
	
	sim.setLogger(function (str) {
		document.write(str);
	});
		
	sim.simulate(SIMTIME);
}	