import  { useEffect, useState } from "react";
import "./Aichatbot.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AIchatbot = () => {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState("");
  const [apiRequest, setApiRequest] = useState(null);
  const [appJson, setAppJson] = useState(null);
  const [apiOutput, setApiOutput] = useState(null);
  const [username, setUsername] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [apiSuccess, setApiSuccess] = useState(false);

  useEffect(() => {
    fetch(`${window.location.origin}/api/v1/applications`)
      .then(res => res.json())
      .then(data => setApps(data.items.map(i => i.metadata.name)))
      .catch(console.error);

    fetch(`${window.location.origin}/api/v1/session/userinfo`)
      .then(res => res.json())
      .then(data => setUsername(data.username || "unknown"))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const chatDiv = document.querySelector(".ai-chat-messages");
    if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
  }, [messages]);

  const isValidUrl = (url) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleAppChange = (e) => {
    const appName = e.target.value;
    const sid = `${username}_${Math.floor(Date.now() / 1000)}`;
    setSessionId(sid);
    setSelectedApp(appName);
    setMessages([]);
    setInput("");
    setApiRequest(null);
    setApiOutput(null);

    if (!isValidUrl(backendUrl)) {
      toast.warning("Please enter a valid backend URL.");
      return;
    }

    setLoading(true);
    fetch(`${window.location.origin}/api/v1/applications/${appName}`)
      .then(res => res.json())
      .then(setAppJson)
      .catch(() => {
        setMessages(prev => [...prev, { user: "Agent", text: "Failed to load app data." }]);
      })
      .finally(() => setLoading(false));
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { user: "You", text: input }]);
    setInput("");

    if (!isValidUrl(backendUrl)) {
      toast.error("Invalid backend URL.");
      return;
    }

    const body = {
      message: input,
      sessionId,
      application: selectedApp,
      appData: { status: appJson.status, spec: appJson.spec }
    };

    fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        const out = data.output || {};
        setMessages(m => [...m, { user: "Agent", text: out.comment || JSON.stringify(out) }]);
        if (out.shouldRun && out.url && out.method) {
          setApiRequest({ method: out.method, url: out.url, body: out.body });
          setApiOutput(null);
        }
      })
      .catch(() => {
        setMessages(m => [...m, { user: "Agent", text: "Backend error occurred." }]);
      });
  };

  const runSuggestedRequest = () => {
    if (!apiRequest) return;
    const fullUrl = apiRequest.url.startsWith("http") ? apiRequest.url : `${window.location.origin}${apiRequest.url}`;

    fetch(fullUrl, {
      method: apiRequest.method,
      headers: { "Content-Type": "application/json" },
      body: apiRequest.body ? JSON.stringify(apiRequest.body) : null
    })
      .then(res => res.json())
      .then(data => {
        setApiOutput(JSON.stringify(data, null, 2));
        setApiSuccess(true);
      })
      .catch(() => {
        setApiOutput("API call failed.");
        setApiSuccess(false);
      });
  };

  const sendOutputToAI = () => {
    if (!apiOutput) return;

    const userMessage = apiSuccess
      ? "Successfully executed API and here is the response."
      : "API execution failed.";

    setMessages(m => [...m, { user: "You", text: userMessage }]);
    setApiOutput(null);

    const body = {
      message: userMessage,
      sessionId,
      application: selectedApp,
      appData: { apiResult: apiOutput }
    };

    fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        const out = data.output || {};
        setMessages(m => [...m, { user: "Agent", text: out.comment || JSON.stringify(out) }]);
        if (out.shouldRun && out.url && out.method) {
          setApiRequest({ method: out.method, url: out.url, body: out.body });
          setApiOutput(null);
        }
      });
  };

  return (
    <div className="ai-chat-container">
       <ToastContainer position="top-right" autoClose={4000} />
      <h2 className="ai-chat-title">💬 Argo CD Chat Assistant</h2>

<div className="ai-chat-controls">
  <input
    className="ai-chat-input"
    placeholder="Enter backend URL"
    value={backendUrl}
    onChange={e => setBackendUrl(e.target.value)}
  />

  <select
    value={selectedApp}
    onChange={handleAppChange}
    className={`ai-chat-select ${selectedApp ? "selected" : ""}`}
  >
    <option value="" disabled>📦 Select an ArgoCD Application</option>
    {apps.map(app => (
      <option key={app} value={app}>{app}</option>
    ))}
  </select>
</div>

      {loading && <div className="ai-chat-loading">⏳ Analyzing app...</div>}

      {selectedApp && (
        <>
          <div className="ai-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-chat-message ${msg.user === "You" ? "user" : "agent"}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {msg.user === "You" ? "🧑" : "🤖"} <strong>{msg.user}:</strong>
                </div>
                <span>{msg.text}</span>
              </div>
            ))}

            {apiRequest && (
              <div className="ai-chat-message agent">
                <strong>🤖 Agent:</strong>
                <p style={{ margin: "6px 0" }}>I recommend calling:</p>
                <code>{apiRequest.method} {apiRequest.url}</code>
                <button onClick={runSuggestedRequest} className="ai-chat-button" style={{ marginTop: '10px' }}>
                  🚀 Run This API
                </button>
              </div>
            )}

            {apiOutput && (
              <div className="ai-chat-message user">
                <strong>🧑 You:</strong>
                <p>Here's the API response:</p>
                <pre>{apiOutput}</pre>
                <button onClick={sendOutputToAI} className="ai-chat-button" style={{ marginTop: '10px' }}>
                  📤 Send Output to AI
                </button>
              </div>
            )}
          </div>

          <div className="ai-chat-footer">
            <textarea
              className="ai-chat-textarea"
              placeholder="Ask anything"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            />
            <button onClick={handleSend} className="ai-chat-button">Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AIchatbot;
