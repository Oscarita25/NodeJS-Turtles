const ws = new WebSocket("ws://localhost:8081")
let selected_turtle = 0

ws.onopen = (function(){
  ws.send("request_ctl_name")
  refreshTurtles()
});

async function refreshTurtles(){
  await ws.send("request_turtle_list,"+ selected_turtle )
}

function moveTurtleBackward(){
    ws.send("return turtle.back(),"+ selected_turtle )
}

async function refuelTurtle() {
  // refuelTurtle
  await ws.send("return turtle.refuel(0),"+ selected_turtle )
}

async function moveTurtleForward(){
    await ws.send("return turtle.forward(),"+ selected_turtle )
}

async function detect(){
  await ws.send("return turtle.detect(),"+ selected_turtle )
}

async function detectUp(){
  await ws.send("return turtle.detectUp(),"+ selected_turtle )
}

async function detectDown(){
  await ws.send("return turtle.detectDown(),"+ selected_turtle )
}

async function moveTurtleLeft(){
    ws.send("return turtle.turnLeft(),"+ selected_turtle )
}
async function moveTurtleRight(){
    ws.send("return turtle.turnRight(),"+ selected_turtle )
}
async function moveTurtleUp(){
    ws.send("return turtle.up(),"+ selected_turtle )
}
async function moveTurtleDown(){
    ws.send("return turtle.down(),"+ selected_turtle )
}

function updateSelectedTurtle(){
  const element = document.getElementById('turtleSelection')
  if (element.hasChildNodes()) {
    selected_turtle = element.options[element.selectedIndex].value
  }
}

ws.addEventListener("message",msg=>{
    if(msg.data.includes("set_uid:")){
      data = msg.data.replace("set_uid:", "").toString().split(",")
      ws.id = data[0]
      ws.name = data[1]
      console.log(ws.id, ws.name)
      return
    }

    if(msg.data.includes("turtle_list")){
      const element = document.getElementById('turtleSelection')
      element.innerHTML = ''

      const obj = JSON.parse(msg.data)
      for (const turtle of obj){
        if (turtle.name === "turtle_list"){ continue;}
        console.log(turtle)
        const opt = document.createElement("option")
        opt.value = turtle.uid
        opt.innerHTML = turtle.name
        element.appendChild(opt)

        //element.appendChild(textnode)
      }

      selected_turtle = element.options[element.selectedIndex].value
    }

    console.log(msg.data)
})
