import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthPath = error.config.url.includes('/auth/login') ||
            error.config.url.includes('/auth/register');

        if (error.response && error.response.status === 401 && !isAuthPath) {
            localStorage.clear();
            if (window.location.pathname !== '/login') {
                window.location.replace('/login');
            }
        }
        return Promise.reject(error);
    }
);

export const getEvents = () =>
    api.get(`/events`).then(res => res.data);

export const getEventsByCategory = (category: string) =>
    api.get(`/events/search/category?category=${category}`).then(res => res.data);

export const getEventsByStatus = (status: string) =>
    api.get(`/events/search/status?status=${status}`).then(res => res.data);

export const joinEvent = (eventId: number) =>
    api.post(`/events/${eventId}/join`).then(res => res.data);

export const leaveEvent = (eventId: number) =>
    api.delete(`/events/${eventId}/leave`).then(res => res.data);

export const deleteEvent = (eventId: number) =>
    api.delete(`/events/${eventId}`).then(res => res.data);

export const getMyOrganizedEvents = () =>
    api.get(`/events/my-organized`).then(res => res.data);

export const getMyJoinedEvents = () =>
    api.get(`/events/my-joined`).then(res => res.data);

export const updateEvent = (eventId: number, data: any) =>
    api.put(`/events/${eventId}`, data).then(res => res.data);

export const getOrganizedEventsCount = () =>
    api.get(`/events/organized/count`).then(res => res.data);

export const getRegisteredEventsCount = () =>
    api.get(`/events/registered/count`).then(res => res.data);


export default api;