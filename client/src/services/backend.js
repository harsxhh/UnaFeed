import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export async function initSession() {
  // hit health via proxy to ensure cookie is set on the frontend origin
  await axios.get("/health", { withCredentials: true });
}

export async function getFeed({ page = 1, limit = 20, kind } = {}) {
  const res = await api.get("/posts", { params: { page, limit, kind } });
  return res.data;
}

export async function classify(text) {
  const res = await api.post("/classify", { text });
  return res.data;
}

export async function createPost(payload) {
  const res = await api.post("/posts", payload);
  return res.data;
}


