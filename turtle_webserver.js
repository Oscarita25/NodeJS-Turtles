// Web Server package
const WebS = require("ws")
var fs = require('fs')
const {uniqueNamesGenerator, names} = require("unique-names-generator")
// create Web Server
const wss = new WebS.Server({port:8081})

fs.readFile('turtles.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  turtles = JSON.parse(data)
  console.log(turtles)
});

var turtles = {}
var connected_turtles = {}
// on connection event

wss.on("connection",ws=>{

    ws.isAlive = true;
    ws.on("pong", function heartbeat(){
      ws.isAlive = true
    });

    ws.on("message",msg=>{
      if(msg.toString().includes("turtle.")){
        const playerData = msg.toString().split(",")
        connected_turtles[playerData[1]].send(JSON.stringify({func:playerData[0]}))
        //console.log(connected_turtles)
        return
      }

      if (msg.toString().includes("request_turtle_list")) {
        let _trtl = [{uid:"turtle_list", name:"turtle_list"}]
        for ( const [key, value] of Object.entries(turtles)){
          for (const [key1, value1] of Object.entries(connected_turtles)){
            if (key === key1){
              _trtl.push({uid:key, name:value})
            }
          }
        }

        let _turtlesMapped = _trtl.map(_turtle => ({uid:_turtle.uid, name:_turtle.name}))

        ws.send(JSON.stringify(_turtlesMapped))
        console.log(msg.toString() + " by: "+ data[0]+", "+data[1])
        return
      }

      if (msg.toString().includes("request_turtle_connect")) {
        _uid = msg.toString().replace("request_turtle_connect@", "")
        connected_turtles[_uid] = ws
        console.log(msg.toString() + " by: "+ _uid +", "+ turtles[_uid])
        return
      }


      if (msg.toString().includes("request_turtle_name")) {
        data = [wss.getUniqueID(), wss.getNewName()]
        connected_turtles[data[0]] = ws
        turtles[data[0]] = data[1]
        fs.writeFile("turtles.json", JSON.stringify(turtles), function(err, result) {
          if(err) console.log('error', err);
        });
        ws.send(JSON.stringify({func:"return set_uid('"+data[0]+"','"+data[1]+"')"}))
        console.log(msg.toString() + " by: "+ data[0]+", "+data[1])
        return
      }

      if (msg.toString().includes("request_ctl_name")) {
        data = [wss.getUniqueID(), "ctl"]
        ws.send("set_uid:"+data[0]+","+data[1])
        console.log(msg.toString() + " by: "+ data[0]+", "+data[1])
        return
      }


    })


  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false){
          if (typeof connected_turtles[ws.id] !== 'undefined'){connected_turtles.delete(ws.id)}
          ws.terminate()
        }

        ws.isAlive = false;
        ws.ping();
      })
    ;}, 30000);
});

// on close event
wss.on("close", ws=>{
  connected_turtles.delete(ws.id)
  console.log("closing")
});

// generate UniqueID
wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

wss.getNewName = function getNewName(){
  return uniqueNamesGenerator({dictionaries: [names], style: 'lowerCase'});
}

// send to all clients
wss.broadcast = function broadcast(msg){
    wss.clients.forEach(function each(client) {
        client.send(msg)
    });
};
