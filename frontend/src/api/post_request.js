import axios from 'axios'

const API = axios.create({
    baseURL: 'http://localhost:8000'
})

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['Content-Type'] = 'application/json'
    return config
})

export async function loginUser(_email, _password) {
    try {
        const userData = {
            email: _email,
            password: _password
        }
        const jsonUserData = JSON.stringify(userData)
        const response = await API.post('api/login/', jsonUserData);
        console.log(response)
        return response
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка авторизации')
    }
}

export async function registerUser(userData) {
    try {
        const jsonUserData = JSON.stringify(userData)
        const response = await API.post('api/users/create/', jsonUserData);
        console.log(response)
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка регистрации');
    }
}

export async function logoutUser(refresh_token) {
    try {
        const jsonUserData = JSON.stringify({'refresh': refresh_token})
        const response = await API.post('api/logout/', jsonUserData);
        console.log(response)
        return response
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка авторизации')
    }
}