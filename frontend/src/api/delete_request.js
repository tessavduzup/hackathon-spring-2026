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

export async function deleteKey(id) {
    try {
        const response = await API.delete(`api/keys/${id}/delete/`);
        return response
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка при удалении ключа')
    }
}