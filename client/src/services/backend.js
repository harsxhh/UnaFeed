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

export async function getPostById(id) {
  const res = await api.get(`/posts/${id}`);
  return res.data;
}

export async function togglePostReaction(id, type) {
  const res = await api.post(`/posts/${id}/reactions`, { type });
  return res.data;
}

export async function getComments(postId) {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
}

export async function createComment(postId, payload) {
  const res = await api.post(`/posts/${postId}/comments`, payload);
  return res.data;
}

export async function toggleCommentReaction(postId, commentId, type) {
  const res = await api.post(`/posts/${postId}/comments/${commentId}/reactions`, { type });
  return res.data;
}


