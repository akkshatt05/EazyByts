import axios from "axios";

const API = axios.create({
  baseURL: "https://eazybyts-1kdw.onrender.com/api",
});

export default API;