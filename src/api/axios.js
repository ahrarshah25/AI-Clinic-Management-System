const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "";

const buildUrl = (path) => {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${apiBaseURL}${path}`;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const request = async ({ method = "GET", url, data, headers = {} }) => {
  const response = await fetch(buildUrl(url), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    const error = new Error(
      payload?.error || payload?.message || "Request failed"
    );
    error.response = { data: payload, status: response.status };
    throw error;
  }

  return { data: payload, status: response.status };
};

const axiosInstance = {
  post: (url, data, config = {}) =>
    request({ method: "POST", url, data, headers: config.headers || {} }),
  get: (url, config = {}) =>
    request({ method: "GET", url, headers: config.headers || {} }),
};

export default axiosInstance;

