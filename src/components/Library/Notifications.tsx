import { Transition } from "@headlessui/react";
import Image from "next/image";
import React from "react";
import { Toaster, resolveValue } from "react-hot-toast";

const Notifications = () => {
  return (
    <Toaster position="top-center">
      {(t) => (
        <Transition
          appear
          show={t.visible}
          className="transform mt-12 inline-flex items-center justify-between z-50 w-[300px] p-6 rounded-xl text-[#344054] border-b-[6px] border-[#C0F9C9] bg-white leading-5 text-sm font-medium shadow-toast"
          enter="transition-all duration-200"
          enterFrom="opacity-0 scale-0"
          enterTo="opacity-100 scale-100"
          leave="transition-all duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-75"
        >
          {/* <ToastIcon toast={t} /> */}
          <p className="px-2">{resolveValue(t.message, t)}</p>
          <Image
            height={32}
            width={32}
            src="/icons/CheckIcon.svg"
            alt="checkicon"
          />
        </Transition>
      )}
    </Toaster>
  );
};

export default Notifications;
