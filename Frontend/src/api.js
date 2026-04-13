import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});

export const getProblems = () => API.get("/problems/all");

export const createProblem = (data) => API.post("/problems/create", data);

export const getProblemById = (id) => API.get(`/problems/${id}`);

export default API;
