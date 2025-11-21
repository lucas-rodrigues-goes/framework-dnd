[h: startTime = js.evalNS("main", "Date.now()") ]

[h: command = arg(0) ]
[r: js.evalNS("main", command) ]

[h: endTime = js.evalNS("main", "Date.now()") ]
[h: totalTime = endTime - startTime ]
[h,if(argCount() > 1): js.evalNS("main", 'console.log(`"'+command+'" took '+totalTime+'ms`)') ]