import { useEffect, useState } from "react";
import "./Aichatbot.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Aichatbot = () => {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState("");
  const [apiRequest, setApiRequest] = useState(null);
  const [appJson, setAppJson] = useState(null);
  const [username, setUsername] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [apiSuccess, setApiSuccess] = useState(false);
  const [processingApi, setProcessingApi] = useState(false);

  useEffect(() => {
    fetch(`${window.location.origin}/api/v1/applications`)
      .then(res => res.json())
      .then(data => setApps(data.items.map(i => i.metadata.name)))
      .catch(console.error);

    fetch(`${window.location.origin}/api/v1/session/userinfo`)
      .then(res => res.json())
      .then(data => setUsername(data.username || "unknown"))
      .catch(console.error);
    
    fetch(`${window.location.origin}/api/v1/config`)
    .then(res => res.json())
    .then(cfg => {
      const url = cfg.config["extension.n8n.url"] || "";
      setBackendUrl(url);
    })
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
    setAppJson(null);

    if (!isValidUrl(backendUrl)) {
      toast.warning("Please enter a valid Assistant URL.");
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
    if (!input.trim() || processingApi) return;
    setMessages(m => [...m, { user: "You", text: input }]);
    setInput("");

    if (!isValidUrl(backendUrl)) {
      toast.error("Invalid Assistant URL.");
      return;
    }

    const body = {
      message: input,
      sessionId,
      application: selectedApp,
      appData: { status: appJson.status, spec: appJson.spec }
    };
    setProcessingApi(true);
    fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        const out = data.output || {};
        setMessages(m => [
          ...m,
          { user: "Agent", text: out.comment || JSON.stringify(out),url: (!out.shouldRun && out.url) ? out.url : undefined,
    method: (!out.shouldRun && out.method) ? out.method : undefined, },
          ...(out.shouldRun && out.url && out.method
            ? [{
              user: "Agent",
              isApiSuggestion: true,
              method: out.method,
              url: out.url,
              body: out.body
            }]
            : [])
        ]);

        if (out.shouldRun && out.url && out.method) {
          setApiRequest({ method: out.method, url: out.url, body: out.body });
        }
        setProcessingApi(false);
      })
      .catch(() => {
        setMessages(m => [...m, { user: "Agent", text: "Backend error occurred." }]);
        setProcessingApi(false);
      });
  };

  const runSuggestedRequest = () => {
    if (!apiRequest) return;
    const fullUrl = apiRequest.url.startsWith("http") ? apiRequest.url : `${window.location.origin}${apiRequest.url}`;
    setProcessingApi(true);
    fetch(fullUrl, {
      method: apiRequest.method,
      headers: { "Content-Type": "application/json" },
      body: apiRequest.body ? JSON.stringify(apiRequest.body) : null
    })
      .then(res => res.json())
      .then(data => {
        const introMessage = {
          user: "Tool",
          text: "✅ Successfully executed API and here is the response."
        };

        const outputMessage = {
          user: "Tool",
          isApiOutput: true,
          apiOutput: JSON.stringify(data, null, 2),
          sentToAI: false
        };

        setMessages(prev => [...prev, introMessage, outputMessage]);
        setApiRequest(null);
        setApiSuccess(true);
        setProcessingApi(false);
      })
      .catch(async (err) => {
        const errorText = err?.message || "API call failed due to an unknown error.";
        const introMessage = {
          user: "Tool",
          text: "❌ API execution failed. Here's the error:"
        };

        const errorMessage = {
          user: "Tool",
          isApiOutput: true,
          apiOutput: errorText,
          sentToAI: false,
          noOutput: true
        };

        setMessages(prev => [...prev, introMessage, errorMessage]);
        setApiRequest(null);
        setApiSuccess(false);
        setProcessingApi(false);
      });
  };

  const sendOutputToAI = (index) => {
    const message = messages[index];
    if (!message || !message.apiOutput) return;

    const userMessage = apiSuccess
      ? "I ran the API the tool suggested. Here is the result."
      : "I tried running the suggested API, but it failed.";

    const userMsg = { user: "You", text: userMessage };

    const body = {
      message: userMessage,
      sessionId,
      application: selectedApp,
      appData: { apiResult: message.apiOutput }
    };
    setProcessingApi(true);
    setMessages(prev => {
      const updated = [...prev, userMsg];
      updated[index] = { ...updated[index], sentToAI: true };
      return updated;
    });

    fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        const out = data.output || {};
        setMessages(m => [
          ...m,
          { user: "Agent", text: out.comment || JSON.stringify(out) },
          ...(out.shouldRun && out.url && out.method
            ? [{
              user: "Agent",
              isApiSuggestion: true,
              method: out.method,
              url: out.url,
              body: out.body
            }]
            : [])
        ]);

        if (out.shouldRun && out.url && out.method) {
          setApiRequest({ method: out.method, url: out.url, body: out.body });
        }
        setProcessingApi(false);
      }).catch(() => {
        setMessages(prev => [
          ...prev,
          { user: "Agent", text: "❌ Failed to send output to AI assistant. Please try again later." }
        ]);
        setProcessingApi(false);
      });
  };

  const handleBackendUrl = (e) => {
    const value = e.target.value;
    if (value !== "") {
      setBackendUrl(value);
    } else {
      setBackendUrl("");
      setSelectedApp("");
      setMessages([]);
    }
  }

  return (
    <div className="ai-chat-container">
      <ToastContainer position="top-right" autoClose={4000} />
      <h2 className="ai-chat-title">💬 Argo CD Chat Assistant</h2>

      <div className="ai-chat-controls">
        <input
          className="ai-chat-input"
          placeholder="Enter Assistant URL"
          value={backendUrl}
          onChange={handleBackendUrl}
        />

        {isValidUrl(backendUrl) && (
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
        )}
      </div>


      {loading && <div className="ai-chat-loading">⏳ Analyzing app...</div>}


      {backendUrl && !isValidUrl(backendUrl) && (
        <p className="ai-chat-info">⚠️ Please enter a valid Assistant URL to continue.</p>
      )}
      {!backendUrl && (
        <p className="ai-chat-info" style={{ opacity: 0.6 }}>
          💡 Please provide your Assistant URL to begin.
        </p>
      )}

      {selectedApp && (
        <>
          <div className="ai-chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`ai-chat-message ${msg.user === "You" ? "user" : msg.user === "Tool" ? "tool" : "agent"
                  }`}
              >
                <span>
                  {msg.user === "You" ? "🧑" : msg.user === "Tool" ? "🔁" : "🤖"}{" "}
                  <strong>{msg.user}:</strong>{" "}
                  {msg.text}
                  {msg.url && msg.method && !msg.shouldRun &&  !msg.isApiSuggestion && (
                    <a
                      href={msg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginLeft: '8px', wordBreak: 'break-word' }}
                    >
                      🔗 {msg.url}
                    </a>
                  )}
                </span>

                {msg.isApiSuggestion && (
                  <>
                    <p style={{ margin: "6px 0" }}>I recommend calling:</p>
                    <code>{msg.method} {msg.url}</code>
                    <button
                      onClick={runSuggestedRequest}
                      className="ai-chat-button"
                      style={{ marginTop: '10px' }}
                    >
                      🚀 Run This API
                    </button>
                  </>
                )}

                {msg.isApiOutput && (
                  <>
                    <pre>{msg.apiOutput}</pre>
                    {!msg.sentToAI &&  !msg.noOutput && (
                      <button
                        onClick={() => sendOutputToAI(idx)}
                        className="ai-chat-button"
                        style={{ marginTop: '10px' }}
                      >
                        📤 Send Output
                      </button>
                    )}
                  </>
                )}
              </div>

            ))}
            {processingApi && <div className="ai-agent-thinking">🤖 Thinking...</div>}
          </div>

          <div className="ai-chat-footer">
            <textarea
              className="ai-chat-textarea"
              placeholder="Ask anything"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            />
            <button onClick={handleSend} className="ai-chat-button" disabled={processingApi}>
              {processingApi ? '⌛' : 'Send'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Aichatbot;
