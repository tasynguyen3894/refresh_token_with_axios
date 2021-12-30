require('dotenv').config();
const axios = require('axios');
const PORT = process.env.PORT || 3535;
const host = `http://localhost:${PORT}`;
const axios_instance = axios.create({
    baseURL: host,
    headers: {
        'Content-Type': 'application/json'
    }
});

let access_token = 'bad';
let refreshing_token = null;

axios_instance.interceptors.request.use((config) => {
    config.headers['access_token'] = access_token;
    return config;
});

function refresh_token() {
    console.log('Refreshing access token')
    return axios.get(`${host}/refresh`);
}

axios_instance.interceptors.response.use((response) => {
    return response
}, async (error) => {
    const config = error.config;
    // Check status code and retry flag
    if(error.response && error.response.status === 401 && !config._retry) {
        config._retry = true;
        try {
            refreshing_token = refreshing_token ? refreshing_token : refresh_token();
            let res = await refreshing_token;
            refreshing_token = null;
            if(res.data.access_token) {
                access_token = res.data.access_token;
            }
            return axios_instance(config);
        } catch (err) {
            return Promise.reject(err)
        }
    }
    return Promise.reject(error)
});

function request() {
    console.log('Start request');
    axios_instance.get('/access').then(function (response) {
        console.log('Status code', response.status);
        console.log('Status code', JSON.stringify(response.data));
    }).catch(err => {
        console.log(`Error ${err.response.status}`);
    });
}

request();
// Un comment it if you want to check multiple request in same time.
// request();
// request();