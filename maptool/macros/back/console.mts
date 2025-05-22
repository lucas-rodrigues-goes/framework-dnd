[h: argument = arg(0)]
[h: quote = "'"]
[h: command = '
	try {
		'+argument+'
	}
	catch {
		console.log('+quote+'Error occurred when running: { '+argument+' }'+quote+', "debug")
	}
']

[r, if(0):js.evalNS("main",command); js.evalNS("main",argument)]