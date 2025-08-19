import  ChatExtension  from "../src/components/ChatExtension";

(() => {
   window.extensionsAPI.registerSystemLevelExtension(ChatExtension, "Chat", "/chat", "fa-comments");
})();


