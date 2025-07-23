(() => {
const flameIcon = "https://cdn-icons-png.flaticon.com/512/753/753345.png";
const skullIcon = "https://cdn-icons-png.flaticon.com/512/2753/2753911.png";
const backgroundImg = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/18017641-678b-47ac-b9f0-cbfbbfcea8d0/d58pwxm-34fe5e28-99b0-4c20-8ad7-fad2a96f43b4.png/v1/fill/w_894,h_894,q_70,strp/stone_wall_texture_by_zagreb_dubrava_d58pwxm-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvMTgwMTc2NDEtNjc4Yi00N2FjLWI5ZjAtY2JmYmJmY2VhOGQwXC9kNThwd3htLTM0ZmU1ZTI4LTk5YjAtNGMyMC04YWQ3LWZhZDJhOTZmNDNiNC5wbmciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.VqDs3PIEV8NxNjf2UDAreZ9DWwSSUxQ9ZXvsdHKHQhE";

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

const handleSend = () => {
  if (!input.trim()) return;
  setMessages(m => [...m, { user: "You", text: input }]);
  setInput("");
  if (!isValidUrl(backendUrl)) return alert("Invalid backend URL");

  const isFirst = counter.get(selectedApp) == null;
  const body = {
    message: input,
    sessionId: selectedApp,
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
    sessionId: selectedApp,
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

const gothicFont = `'Fraktur', 'Cinzel Decorative', 'MedievalSharp', serif`;
const baseColor = "#0f0e0e";
const textColor = "#fdf1cf";
const borderColor = "#3e2f1c";
const buttonColor = "#a92f2f";
const glow = "0 0 10px #dba400, 0 0 20px #dba400";

return React.createElement("div", {
  style: {
    padding: "20px",
    fontFamily: gothicFont,
    color: textColor,
    backgroundColor: baseColor,
    backgroundImage: `url(${backgroundImg})`,
    backgroundSize: "cover",
    minHeight: "100vh",
    textShadow: "1px 1px 2px black"
  }
},
  React.createElement("h2", {
    style: {
      fontSize: "32px",
    fontFamily: gothicFont,
      marginBottom: "20px",
      color: "#ffcc00",
      textShadow: "2px 2px 6px black"
    }
  }, "☠ Argo CD Chat Assistant ☠"),

  React.createElement("div", { style: { marginBottom: "10px", 
    fontFamily: gothicFont } },
    React.createElement("label", {}, "🔥 Backend URL: "),
    React.createElement("input", {
      value: backendUrl,
      onChange: e => setBackendUrl(e.target.value),
      style: {
        width: "60%",
        padding: "6px",
    fontFamily: gothicFont,
        background: "#1a1614",
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "4px"
      }
    })
  ),

  React.createElement("div", { style: { marginBottom: "10px",
    fontFamily: gothicFont } },
    React.createElement("label", {}, "⚔️ Select App: "),
    React.createElement("select", {
      value: selectedApp,
      onChange: handleAppChange,
      style: {
        padding: "6px",
        background: "#1a1614",
    fontFamily: gothicFont,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "4px"
      }
    },
      React.createElement("option", { value: "" }, "-- Choose --"),
      apps.map(app => React.createElement("option", { key: app, value: app }, app))
    )
  ),

  loading && React.createElement("p", { style: { color: "#f80",
    fontFamily: gothicFont } }, "🧠 Analyzing..."),

  selectedApp && React.createElement("div", null,
    React.createElement("div", {
      style: {
        border: `1px solid ${borderColor}`,
        height: "300px",
    fontFamily: gothicFont,
        overflowY: "auto",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: "rgba(0,0,0,0.6)"
      }
    },
      messages.map((msg, idx) =>
        React.createElement("div", { key: idx, style: { marginBottom: "8px", display: "flex", alignItems: "center" } },
          React.createElement("img", {
            src: msg.user === "Agent" ? skullIcon : flameIcon,
            style: { width: "20px", height: "20px", marginRight: "6px" }
          }),
          React.createElement("strong", null, `${msg.user}: `),
          msg.text
        )
      )
    ),

    React.createElement("textarea", {
      value: input,
      onChange: (e) => setInput(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend()),
      placeholder: "Speak your will...",
      rows: 3,
      style: {
        width: "80%",
        height: "70px",
        marginRight: "5px",
        padding: "8px",
        background: "#1a1614",
    fontFamily: gothicFont,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "6px",
        resize: "none"
      }
    }),

    React.createElement("button", {
      onClick: handleSend,
      style: {
        background: buttonColor,
        color: "#fff",
        padding: "10px 16px",
    fontFamily: gothicFont,
        borderRadius: "8px",
        border: `1px solid #700`,
        boxShadow: glow,
        fontWeight: "bold",
        cursor: "pointer"
      }
    }, "💬 Send"),

    apiRequest && React.createElement("div", { style: { marginTop: "10px" } },
      React.createElement("p", null, `📜 Suggested: ${apiRequest.method} ${apiRequest.url}`),
      React.createElement("button", {
        onClick: runSuggestedRequest,
        style: {
          background: "#6a4d21",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "6px",
    fontFamily: gothicFont,
          border: `1px solid ${borderColor}`,
          boxShadow: glow,
          marginRight: "10px",
          cursor: "pointer"
        }
      }, "🔥 Send Request")
    ),

    apiOutput && React.createElement("div", {
      style: {
        marginTop: "10px",
        padding: "10px",
        background: "rgba(0,0,0,0.6)",
        borderRadius: "6px",
    fontFamily: gothicFont,
        whiteSpace: "pre-wrap",
        border: `1px solid ${borderColor}`
      }
    }, apiOutput,
      React.createElement("div", { style: { marginTop: "8px" } },
        React.createElement("button", {
          onClick: sendOutputToAI,
          style: {
            background: "#b30000",
    fontFamily: gothicFont,
            color: "#fff",
            padding: "8px 14px",
            borderRadius: "6px",
            border: `1px solid ${borderColor}`,
            boxShadow: glow,
            cursor: "pointer"
          }
        }, "⚡ Send to AI")
      )
    )
  )
);

};

window.extensionsAPI.registerSystemLevelExtension(ChatExtension, "Chat", "/chat", "fa-comments");
})();