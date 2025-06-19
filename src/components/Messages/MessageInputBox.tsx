"use client";

import { EmojiIcon, PaperClipIcon, SendMessageIcon } from "@/assets/icons";
import { useMessages } from "@/hooks/useMessages";
import { useState } from "react";

interface MessageInputBoxProps {
  selectedUserId: string;
}

const MessageInputBox = ({ selectedUserId }: MessageInputBoxProps) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { sendMessage } = useMessages(selectedUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(messageText.trim(), selectedUserId);
      setMessageText("");
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="sticky bottom-0 border-t border-stroke bg-white px-7.5 py-5 dark:border-dark-3 dark:bg-gray-dark">
        <form onSubmit={handleSubmit} className="flex items-center justify-between space-x-4.5">
          <div className="relative w-full">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={isSending}
              placeholder="Введите сообщение..."
              className="h-13 w-full rounded-[7px] border border-stroke bg-gray-1 py-2 pl-5 pr-22.5 text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary disabled:opacity-50"
            />
            <div className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-end gap-4.5">
              <button type="button" className="hover:text-primary disabled:opacity-50" disabled={isSending}>
                <PaperClipIcon />
              </button>
              <button type="button" className="hover:text-primary disabled:opacity-50" disabled={isSending}>
                <EmojiIcon />
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={!messageText.trim() || isSending}
            className="flex h-13 w-full max-w-13 items-center justify-center rounded-md bg-primary text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <SendMessageIcon />
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default MessageInputBox;
