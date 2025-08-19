import AIchatbot from "./Aichatbot";

const ChatExtension =()=> {
useEffect(() => {
  console.log("AIchatbot mounted");
}, []);
return(
<AIchatbot></AIchatbot>
)
}

export default ChatExtension;