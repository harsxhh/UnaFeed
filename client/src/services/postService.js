export async function classifyPostClient(prompt) {
  try {
    const response = await fetch("/api/classify-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: prompt }),
    });

    if (!response.ok) {
      throw new Error("Failed to classify post");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[FRONTEND_CLASSIFY_ERROR]", error);
    throw error;
  }
}
