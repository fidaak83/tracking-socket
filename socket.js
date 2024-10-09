import express from 'express';
import { createServer } from 'http';
import axios from 'axios';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: { origin: "*" // Adjust this for production as needed
    }
});

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("A client connected:", socket.id);
    
    socket.on("track", async (payload) => {
        const data = await searchData(payload.data);
        io.to(socket.id).emit("track-message", data);
    });
});

// GET route for fetching data
app.get('/', async (req, res) => {
    res.status(200).send(`${PORT} vehicle tracking...`);
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});

// Function to search for data
const searchData = async (data) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://safetracking.beamwave.sa/api/api.php?cmd=status&agents=${data.id}&node=4`,
        headers: {
            'authorization': 'Basic ZmF6YWw6TmV3QDIwMTA='
        }
    };

    try {
        const response = await axios.request(config);
        let temperature = null;
        
        if (response.data.data[0].sensors_status) {
            const sensors = response.data.data[0].sensors_status;
            sensors.forEach(s => {
                if (s.name === 'Temperature') {
                    temperature = s.dig_value;
                }
            });
        }

        let vehicle = {
            vehicle: response.data.data[0].vehiclenumber,
            status: response.data.data[0].status.active,
            parking: response.data.data[0].status.parking,
            speed: response.data.data[0].status.speed,
            location: `${response.data.data[0].status.lat}, ${response.data.data[0].status.lon}`,
            temperature: parseInt(temperature),
            timestamp: parseInt(response.data.data[0].status.unixtimestamp)
        };

        return vehicle;
    } catch (error) {
        console.log(error);
        return "error";
    }
};
