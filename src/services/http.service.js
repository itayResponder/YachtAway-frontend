import router from '@/router'
import Axios from 'axios';

var axios = Axios.create({
    withCredentials: true
});

const BASE_URL = process.env.NODE_ENV === 'production'
    ? '/'
    : '//localhost:3000/'

export default {
    get(endpoint, data) {
        return ajax(endpoint, 'GET', null, data);
    },
    post(endpoint, data) {
        return ajax(endpoint, 'POST', data);
    },
    put(endpoint, data) {
        return ajax(endpoint, 'PUT', data);
    },
    delete(endpoint, data) {
        return ajax(endpoint, 'DELETE', data);
    }
}

async function ajax(endpoint, method = 'get', data = null, params = null) {
    try {
        const res = await axios({
            url: `${BASE_URL}${endpoint}`,
            method,
            data,
            params
        })
        return res.data;
    } catch (err) {
        if (err.response.status === 401) {
            router.push('/login');
            throw err
        }
    }
}