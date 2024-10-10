import axios from "axios";



const list = async () => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://safetracking.beamwave.sa/api/api.php?cmd=list',
        headers: {
            'authorization': 'Basic ZmF6YWw6TmV3QDIwMTA='
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
    // console.log(ids.toString())
    return ids.toString()
}


const calculate_time = async(current, detination) => {
// console.log(current, detination);
// return;
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${detination}&origins=${current}&key=AIzaSyB_vHX-xvuS3kLLF5C18HL9gIpGlZudUyg`,
        headers: {}
    };

    let time = await axios.request(config)
        .then((response) => {
            return response.data.rows[0].elements[0].duration.value;
        })
        .catch((error) => {
            return false
        });

    return time
}


export const vehicles = async (current_location) => {
    const vlist = await list();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://safetracking.beamwave.sa/api/api.php?cmd=status&agents=${vlist}&node=4`,
        headers: {
            'authorization': 'Basic ZmF6YWw6TmV3QDIwMTA='
        }
    };

    const res = await axios.request(config)
        .then(async (response) => {
            let data = response.data.data;
            let finalData = [];

            const promises = data.map(async (v) => {
                let tt = await calculate_time(current_location, `${v.status.lat},${v.status.lon}`);
                const dd = {
                    name: v.vehiclenumber,
                    // location: `${v.status.lat},${v.status.lon}`,
                    time: tt
                };
                return dd; // Return the object to be collected
            });

            // Wait for all promises to resolve
            finalData = await Promise.all(promises);

            // Sort by time in ascending order and get the top 10
            const topTen = finalData
                .sort((a, b) => a.time - b.time) // Ensure time is numeric
                .slice(0, 10); // Get the top 10

            return topTen; // Return the sorted top 10
        })
        .catch((error) => {
            console.error(error);
            return []; // Return an empty array or handle the error as needed
        });

    // console.log(res); // This should now log the top 10 entries
    return res; // Return the top 10 entries
}




