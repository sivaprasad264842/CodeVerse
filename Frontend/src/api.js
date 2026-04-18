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

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            console.log("Token expired or unauthorized");

            localStorage.removeItem("token");
        }
        return Promise.reject(err);
    },
);

export const getProblems = () => API.get("/problems/all");

export const createProblem = (data) => API.post("/problems/create", data);

export const getProblemById = (id) => API.get(`/problems/${id}`);
export const updateProblem = (id, data) => API.put(`/problems/${id}`, data);
export const deleteProblem = (id) => API.delete(`/problems/${id}`);

export default API;
