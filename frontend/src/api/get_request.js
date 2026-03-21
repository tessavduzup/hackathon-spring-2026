import axios from 'axios'

const API = axios.create({
    baseURL: 'http://localhost:8000'
})

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export async function getKey() {
    try {
        const response = await API.get('/users/getKey/');
        return response
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка при генерации ключа')
    }
}

export async function fetchUser() {
    try {
        const response = await API.get('/api/profile/')
        return response
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Пользователь не найден')
    }
}