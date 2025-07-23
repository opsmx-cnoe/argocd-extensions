(() => {
const flameIcon = "https://cdn-icons-png.flaticon.com/512/753/753345.png";
const skullIcon = "https://cdn-icons-png.flaticon.com/512/2753/2753911.png";
const backgroundImg = "https://images.unsplash.com/photo-1602474390217-4d91002c36db?auto=format&fit=crop&w=1950&q=80";

const ChatExtension = () => {
const [apps, setApps] = React.useState([]);
const [selectedApp, setSelectedApp] = React.useState("");
const [messages, setMessages] = React.useState([]);
const [input, setInput] = React.useState("");
const [loading, setLoading] = React.useState(false);
const [backendUrl, setBackendUrl] = React.useState("");
const [apiRequest, setApiRequest] = React.useState(null);
const [appJson, setAppJson] = React.useState(null);
const [counter, setCounterAppJson] = React.useState(new Map());
const [apiOutput, setApiOutput] = React.useState(null);
const [username, setUsername] = React.useState(null);
const [sessionTimestamp, setSessionTimestamp] = React.useState(null);

// Fetch user info once when extension loads
React.useEffect(() => {
  fetch(`${window.location.origin}/api/v1/session/userinfo`)
    .then(res => res.json())
    .then(data => setUsername(data.username || "unknown"))
    .catch(() => setUsername("unknown"));
}, []);

React.useEffect(() => {
  fetch(`${window.location.origin}/api/v1/applications`)
    .then(res => res.json())
    .then(data => setApps(data.items.map(i => i.metadata.name)))
    .catch(console.error);
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
  setSessionTimestamp(Date.now());
  setMessages([]);
  setInput("");
  setApiRequest(null);
  setApiOutput(null);
  if (!isValidUrl(backendUrl)) {
    alert("Please enter a valid backend URL");
    return;
  }

  setLoading(true);
  fetch(`${window.location.origin}/api/v1/applications/${appName}`)
    .then(res => res.json())
    .then(setAppJson)
    .catch(err => {
      console.error(err);
      setMessages(m => [...m, { user: "Agent", text: "Error getting analysis." }]);
    })
    .finally(() => setLoading(false));
};

const getSessionId = () => {
  if (!username || !sessionTimestamp) return "unknown-session";
  return `${username}-${sessionTimestamp}`;
};

const handleSend = () => {
  if (!input.trim()) return;
  setMessages(m => [...m, { user: "You", text: input }]);
  setInput("");
  if (!isValidUrl(backendUrl)) return alert("Invalid backend URL");

  const isFirst = counter.get(selectedApp) == null;
  const body = {
    message: input,
    sessionId: getSessionId(),
    application: selectedApp,
    ...(isFirst && appJson ? { status: appJson.status, spec: appJson.spec } : {})
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
      if (isFirst) {
        const newCounter = new Map(counter);
        newCounter.set(selectedApp, 1);
        setCounterAppJson(newCounter);
      }
    })
    .catch(err => {
      console.error(err);
      setMessages(m => [...m, { user: "Agent", text: "Chat error." }]);
    });
};

const runSuggestedRequest = () => {
  if (!apiRequest) return alert("No request");
  const fullUrl = apiRequest.url.startsWith("http") ? apiRequest.url : `${window.location.origin}${apiRequest.url}`;

  fetch(fullUrl, {
    method: apiRequest.method,
    headers: { "Content-Type": "application/json" },
    body: apiRequest.body ? JSON.stringify(apiRequest.body) : null
  })
    .then(res => res.json())
    .then(data => setApiOutput(JSON.stringify(data, null, 2)))
    .catch(err => {
      console.error(err);
      setApiOutput("❌ Failed to send request.");
    });
};

const sendOutputToAI = () => {
  if (!apiOutput) return;
  setMessages(m => [...m, { user: "You", text: apiOutput }]);
  setApiOutput(null);
  const body = {
    message: apiOutput,
    sessionId: getSessionId(),
    application: selectedApp,
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

// (The rest of the UI rendering stays unchanged from the previous version)

return (
  // Same JSX code as earlier version — omitted here for brevity
  // You can paste the rendering part from previous version without change
);
};

window.extensionsAPI.registerSystemLevelExtension(ChatExtension, "Chat", "/chat", "fa-comments");
})();