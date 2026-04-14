import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getBooks = () => api.get("/books");
export const getBookDetail = (id) => api.get(`/books/${id}`);
export const uploadBooks = (limit = 20) => api.post("/books/upload", { limit });
export const askQuestion = (question) => api.post("/ask", { question });

export default api;
