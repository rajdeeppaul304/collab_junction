import React, { useState, useEffect, useRef } from "react";
import { Send, User, Clock, ShieldCheck } from "lucide-react";
import { getSocket } from "../../utils/socket";
import Cookies from "js-cookie";

export default function OfferChat({ offerId, currentUserId, currentUserName }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!offerId) return;

    const socket = getSocket();
    const token = Cookies.get("access_token");

    // Join the offer chat room
    socket.emit("join_offer_room", {
      offer_id: offerId,
      user_id: currentUserId,
      auth: { token },
    });

    const handleJoined = (data) => {
      if (data.offer_id === offerId && data.messages) {
        setMessages(data.messages);
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleNewMessage = (msg) => {
      if (msg.offer_id === offerId) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleTyping = (data) => {
      setTypingUser(data.user_name);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 2500);
    };

    socket.on("joined_offer_room", handleJoined);
    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);

    return () => {
      socket.emit("leave_offer_room", { offer_id: offerId });
      socket.off("joined_offer_room", handleJoined);
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [offerId, currentUserId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const socket = getSocket();
    const token = Cookies.get("access_token");

    socket.emit("send_message", {
      offer_id: offerId,
      sender_id: currentUserId,
      content: inputValue.trim(),
      auth: { token },
    });

    setInputValue("");
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    const socket = getSocket();
    socket.emit("typing", {
      offer_id: offerId,
      user_name: currentUserName || "User",
    });
  };

  return (
    <div className="flex flex-col h-[520px] bg-[#1a1a1c] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="px-5 py-4 bg-[#212124] border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-semibold text-white">Deal Negotiation Chat</h3>
            <p className="text-[11px] text-neutral-400">Live communication linked to Offer #{offerId}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-yellow-400 font-medium bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Audit Logged
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs mt-1 text-neutral-600">
              Discuss deliverables, timeline, or ask questions right here.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mb-1 px-1">
                  <span>{isMe ? "You" : m.sender_name}</span>
                  {m.sender_role && (
                    <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                      {m.sender_role}
                    </span>
                  )}
                  <span>&bull;</span>
                  <span>{m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                </div>
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-yellow-400 text-black font-medium rounded-br-none shadow-md shadow-yellow-400/10"
                      : "bg-[#28282b] text-neutral-100 rounded-bl-none border border-neutral-700/60"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        {typingUser && (
          <div className="text-xs text-neutral-400 italic px-2 animate-pulse">
            {typingUser} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-[#212124] border-t border-neutral-800 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type a message or discuss terms..."
          className="flex-1 bg-[#141416] border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="p-2.5 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-300 disabled:opacity-40 disabled:hover:bg-yellow-400 transition-all flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
