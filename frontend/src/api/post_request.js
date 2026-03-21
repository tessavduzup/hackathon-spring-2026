import axios from 'axios'

const API = axios.create({
    baseURL: 'http://localhost:8000'
})

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access')
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

        if (response.data.access && response.data.refresh) {
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user))
        } else {
            throw new Error('Ошибка авторизации: некорректные данные с сервера')
        }
        
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

export async function getKey() {
    try {
        const response = await API.post('api/keys/create/');
        return response
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка при генерации ключа')
    }
}