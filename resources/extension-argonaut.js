(() => {
const ChatExtension = () => {
const [apps, setApps] = React.useState([]);
const [selectedApp, setSelectedApp] = React.useState("");
const [messages, setMessages] = React.useState([]);
const [input, setInput] = React.useState("");
const [loading, setLoading] = React.useState(false);
const [backendUrl, setBackendUrl] = React.useState("");
const [apiRequest, setApiRequest] = React.useState(null);
const [apiResponse, setApiResponse] = React.useState(null);
const [appJson, setAppJson] = React.useState(null);
const [counter, setCounterAppJson] = React.useState(new Map());

React.useEffect(() => {
  fetch(`${window.location.origin}/api/v1/applications`)
    .then(res => res.json())
    .then(data => {
      const names = data.items.map(item => item.metadata.name);
      setApps(names);
    })
    .catch(err => {
      console.error("Failed to fetch applications:", err);
    });
}, []);

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
  setSelectedApp(appName);
  setMessages([]);
  setInput("");
  setApiRequest(null);
  setApiResponse(null);

  if (!isValidUrl(backendUrl)) {
    alert("Please enter a valid backend URL.");
    return;
  }

  setLoading(true);
  fetch(`${window.location.origin}/api/v1/applications/${appName}`)
    .then(res => res.json())
    .then(appData => {
      setAppJson(appData);
    })
    .catch(err => {
      console.error("Failed to fetch app details:", err);
      setMessages(prev => [...prev, { user: "Agent", text: "Error getting app data." }]);
    })
    .finally(() => setLoading(false));
};

const handleSend = (msg = null) => {
  const userInput = msg || input.trim();
  if (!userInput) return;

  setMessages(prev => [...prev, { user: "You", text: userInput }]);
  if (!msg) setInput("");

  if (!isValidUrl(backendUrl)) {
    alert("Please enter a valid backend URL.");
    return;
  }

  const firstTime = !counter.get(selectedApp);
  const newCounter = new Map(counter);
  newCounter.set(selectedApp, 1);
  setCounterAppJson(newCounter);

  const payload = {
    message: userInput,
    sessionId: selectedApp,
    application: selectedApp,
    ...(firstTime && appJson ? { status: appJson.status, spec: appJson.spec } : {})
  };

  fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      const output = data.output || {};
      const comment = output.comment || JSON.stringify(data);
      setMessages(prev => [...prev, { user: "Agent", text: comment }]);

      const method = output.method;
      const url = output.url;
      const body = output.body;
      const shouldRun = output.shouldRun;

      if (shouldRun && method && url && method !== "None" && url !== "None") {
        setApiRequest({ method, url, body, comment });
      } else {
        setApiRequest(null);
      }
    })
    .catch(err => {
      console.error("Chat backend error:", err);
      setMessages(prev => [...prev, { user: "Agent", text: "Error getting chat response." }]);
    });
};

const runSuggestedRequest = () => {
  if (!apiRequest || !apiRequest.method || !apiRequest.url) {
    alert("No valid API request to run.");
    return;
  }

  const fullUrl = apiRequest.url.startsWith("http")
    ? apiRequest.url
    : `${window.location.origin}${apiRequest.url}`;

  fetch(fullUrl, {
    method: apiRequest.method,
    headers: { "Content-Type": "application/json" },
    body: apiRequest.body ? JSON.stringify(apiRequest.body) : null
  })
    .then(res => res.json())
    .then(data => {
      setApiResponse(data);
    })
    .catch(err => {
      console.error("API request failed:", err);
      setApiResponse({ error: "Request failed: " + err.message });
    });
};

const sendApiResponseToAgent = () => {
  if (!apiResponse) return;
  const responseString = typeof apiResponse === "string"
    ? apiResponse
    : JSON.stringify(apiResponse, null, 2);
  handleSend(responseString);
};

const gothicFont = { fontFamily: '"MedievalSharp", cursive' };

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#1b1b1b",
    color: "#f2e6d9",
    ...gothicFont,
  },
  section: {
    marginBottom: "15px"
  },
  label: {
    marginRight: "10px",
    fontSize: "18px"
  },
  input: {
    backgroundColor: "#2c2c2c",
    color: "#fff",
    border: "1px solid #7f1d1d",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    width: "60%"
  },
  textarea: {
    width: "80%",
    height: "80px",
    backgroundColor: "#2c2c2c",
    color: "#f9f6f2",
    padding: "10px",
    border: "1px solid #7f1d1d",
    borderRadius: "6px",
    fontSize: "16px",
    ...gothicFont
  },
  button: {
    backgroundColor: "#7f1d1d",
    color: "#fcebb2",
    border: "none",
    padding: "10px 15px",
    marginLeft: "5px",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 0 10px #a83232"
  },
  select: {
    padding: "6px",
    backgroundColor: "#2c2c2c",
    color: "#f9f6f2",
    border: "1px solid #7f1d1d",
    borderRadius: "6px",
    fontSize: "16px"
  },
  chatBox: {
    border: "1px solid #5c1a1a",
    height: "300px",
    overflowY: "auto",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#2a1a1a",
    borderRadius: "6px"
  },
  message: {
    marginBottom: "8px",
    padding: "6px",
    borderRadius: "4px",
    backgroundColor: "#381313"
  },
  agentMessage: {
    backgroundColor: "#222",
    color: "#fcebb2"
  },
  responseBox: {
    marginTop: "15px",
    padding: "10px",
    border: "1px solid #444",
    backgroundColor: "#1e1e1e",
    color: "#f2f2f2",
    maxHeight: "200px",
    overflowY: "auto",
    whiteSpace: "pre-wrap",
    fontFamily: "monospace",
    borderRadius: "6px"
  }
};

return React.createElement("div", { style: styles.container },
  React.createElement("h2", null, "🧙 Argo CD Chat Assistant"),
  React.createElement("div", { style: styles.section },
    React.createElement("label", { htmlFor: "backendUrl", style: styles.label }, "Backend URL:"),
    React.createElement("input", {
      type: "text",
      id: "backendUrl",
      value: backendUrl,
      onChange: e => setBackendUrl(e.target.value),
      placeholder: "https://your-backend/api/analyze",
      style: styles.input
    })
  ),
  React.createElement("div", { style: styles.section },
    React.createElement("label", { htmlFor: "appSelect", style: styles.label }, "Select Application:"),
    React.createElement("select", {
      id: "appSelect",
      value: selectedApp,
      onChange: handleAppChange,
      style: styles.select
    },
      React.createElement("option", { value: "" }, "-- Choose --"),
      apps.map(app => React.createElement("option", { key: app, value: app }, app))
    )
  ),
  loading &&
    React.createElement("p", { style: { color: "#f59e0b" } }, "Summoning application..."),
  selectedApp &&
    React.createElement("div", null,
      React.createElement("div", { style: styles.chatBox },
        messages.map((msg, idx) =>
          React.createElement("div", {
            key: idx,
            style: {
              ...styles.message,
              ...(msg.user === "Agent" ? styles.agentMessage : {})
            }
          },
            React.createElement("strong", null, `${msg.user}: `),
            msg.text
          )
        )
      ),
      React.createElement("textarea", {
        value: input,
        onChange: e => setInput(e.target.value),
        placeholder: "Speak, mortal...",
        style: styles.textarea
      }),
      React.createElement("button", { onClick: () => handleSend(), style: styles.button }, "Send"),
      apiRequest &&
        React.createElement("div", { style: styles.section },
          React.createElement("p", null, `🛠️ ${apiRequest.comment || ""}`),
          React.createElement("p", null, `${apiRequest.method} ${apiRequest.url}`),
          React.createElement("button", { onClick: runSuggestedRequest, style: styles.button }, "Send Request")
        ),
      apiResponse &&
        React.createElement("div", { style: styles.responseBox },
          React.createElement("strong", null, "🧾 API Response:\n"),
          typeof apiResponse === "string"
            ? apiResponse
            : JSON.stringify(apiResponse, null, 2)
        ),
      apiResponse &&
        React.createElement("button", { onClick: sendApiResponseToAgent, style: styles.button }, "Send to AI")
    ),
  !selectedApp &&
    React.createElement("p", { style: { color: "#bbb" } }, "Select an application to begin your quest.")
);


};

// Inject gothic font if not present
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

window.extensionsAPI.registerSystemLevelExtension(
ChatExtension,
"Chat",
"/chat",
"fa-comments"
);
})();