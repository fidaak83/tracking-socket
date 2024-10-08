const app = require('express')();
const server = require('http').createServer(app);
const axios = require('axios');


const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    // console.log("conn", socket.id)
    socket.on("track", async (payload) => {
        // console.log(payload.data)
        const d = await searchData(payload.data);

        // io.emit("track-message", {...payload})
        io.to(socket.id).emit("track-message", d )
    })
})



server.listen(5000, () => console.log("server is active..."))




const searchData = async (data) => {
    // console.log(data.id)
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://safetracking.beamwave.sa/api/api.php?cmd=status&agents=${data.id}&node=4`,
        headers: {
            'authorization': 'Basic ZmF6YWw6TmV3QDIwMTA='
        }
    };

    const newData = { type: "from function", ...data }

   const d =  await axios.request(config)
        .then((response) => {
            // console.log(response.data)
            return response.data.data[0].status;
        })
        .catch((error) => {
            console.log(error);
            return "error";
        });

    return d
}







