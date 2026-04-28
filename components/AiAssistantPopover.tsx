"use client";

import Ai_assistant from "@/components/Ai_assistant";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function AiAssistantPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="fixed bottom-6 border border-gray-500 font-semibold cursor-pointer right-6 z-50 bg-gray-950 text-white px-5 py-3 rounded-full shadow-lg transition-all duration-200 ">
          AI ASSISTANT
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="
              bg-gray-950 border border-gray-800
              w-[95vw] max-w-xl
              sm:w-[80vw] sm:max-w-lg
              md:w-[60vw] md:max-w-xl
              lg:w-[40vw] lg:max-w-xl
              xl:w-[32vw] xl:max-w-xl
              mr-1 md:mr-5
            "
      >
        <Ai_assistant />
      </PopoverContent>
    </Popover>
  );
}
