import { EmojiIcon, PaperClipIcon, SendMessageIcon } from "@/assets/icons";

const MessageInputBox = () => {
  return (
    <>
      <div className="sticky bottom-0 border-t border-stroke bg-white px-7.5 py-5 dark:border-dark-3 dark:bg-gray-dark">
        <form className="flex items-center justify-between space-x-4.5">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Type something here..."
              className="h-13 w-full rounded-[7px] border border-stroke bg-gray-1 py-2 pl-5 pr-22.5 text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
            <div className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-end gap-4.5">
              <button className="hover:text-primary">
                <PaperClipIcon />
              </button>
              <button className="hover:text-primary">
                <EmojiIcon />
              </button>
            </div>
          </div>

          <button className="flex h-13 w-full max-w-13 items-center justify-center rounded-md bg-primary text-white hover:bg-opacity-90">
            <SendMessageIcon />
          </button>
        </form>
      </div>
    </>
  );
};

export default MessageInputBox;
