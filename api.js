import axios from "axios";
import haversine from 'haversine-distance'

const passKey = 'Basic ZmF6YWw6TmV3QDIwMTA='

const list = async () => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://safetracking.beamwave.sa/api/api.php?cmd=list',
        headers: {
            'authorization': passKey
        }
    };

    const ids = await axios.request(config)
        .then((response) => {
            var vList = []
            let data = response.data.list;
            data.map(v => {
                vList.push(v.agentid)
            })
            return vList
        })
        .catch((error) => {
            return error
        });
    return ids.toString()
}

export const vehicles = async (current_location) => {
    const vlist = await list();
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://safetracking.beamwave.sa/api/api.php?cmd=status&agents=${vlist}&node=4`,
        headers: {
            'authorization': passKey
        }
    };

    const res = await axios.request(config)
        .then(async (response) => {
            let data = response.data.data;
            let finalData = [];

            const promises = data.map(async (v) => {

                const speed = v.status.speed
                const distance = haversine(current_location, { lat: v.status.lat, lon: v.status.lon }) / 1000
                const time = (distance / speed) * 3600

                if (distance < 2 && speed > 1) {
                    finalData.push({ name: v.vehiclenumber, speed, distance, time })
                }

            });

            // Sort by time in ascending order and get the top 5
            const topFive = finalData
                .sort((a, b) => a.time - b.time) // Ensure time is numeric
                .slice(0, 5); // Get the top 5

            return topFive; // Return the sorted top 5
        })
        .catch((error) => {
            console.error(error);
            return []; // Return an empty array or handle the error as needed
        });

    // console.log(res); // This should now log the top 5 entries
    return res; // Return the top 5 entries
}