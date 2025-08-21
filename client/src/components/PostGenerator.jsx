import { useState } from "react";
import { classifyPostClient } from "../services/postService";

export default function PostGenerator() {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setPreview(null);
    try {
      const result = await classifyPostClient(input);
      setPreview(result);
    } catch (err) {
      setPreview({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-2">AI Post Generator</h1>
      <textarea
        className="w-full border p-2 rounded"
        rows="4"
        placeholder="Type your post..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Generate Preview"}
      </button>

      {preview && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h2 className="font-bold mb-2">Post Preview Data</h2>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(preview, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
