console.log("i am client")

const socket = io("http://localhost:5000");

var vid = 0;

socket.on("track-message", message => {
    const speed = `Speed ${message.speed} Km/h`
    const location = `${message.lat} , ${message.lon}`
    $('#speed').html(speed)
    $('#location').html(location)
    // console.log("from server :", message)
})

const start = () => {
    vid = parseInt($("#vid").val());
    const intervalId = setInterval(sendData, 2000);
}


function sendData() {
    const data = {
        id: vid,
        vehicleCode: "NL030"
    }
    socket.emit("track", { data })
    console.log("clicked..")

}



