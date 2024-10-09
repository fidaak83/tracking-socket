console.log("client waiting...")

const socket = io("http://localhost:5000");

var vid = 0;

socket.on("track-message", message => {
    console.log(message)
    const speed = `Speed ${message.speed} Km/h`
    const location = message.location
    let status = message.status === 1 ? 'Active' : 'Offline';
    const parking =  message.parking === 0 ? 'Moving' : 'Parked';

    $('#vehicle').html(message.vehicle)
    $('#status').html(`${status} / ${parking}`)
    $('#speed').html(speed)
    $('#temp').html(message.temperature + " C")
    $('#location').html(location)
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
}



