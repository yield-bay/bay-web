import { FC, Fragment } from "react";
import clsx from "clsx";
import { satoshiFont } from "@utils/localFont";
import { Toaster } from "react-hot-toast";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/outline";

type Status = "success" | "error" | "warning" | "info";

interface Props {
  title: string;
  visible: boolean;
  // status: Status;
}

const toaststatus = (status: Status) => {
  switch (status) {
    case "success":
      return "border-[#43B8A1]";
    case "warning":
      return "border-[#FF916F]";
    case "error":
      return "border-[#D56969]";
    case "info":
      return "border-[#D8C76D]";
    default:
      return "border-[#D8C76D]";
  }
};

const ToastWrapper: FC<Props> = ({ title, visible }) => {
  return (
    <div
      className={clsx(
        "z-50 w-[471px] py-3 px-6 rounded-lg font-bold border text-base text-left bg-black leading-[21.6px] text-white font-sans",
        // toaststatus(status),
        visible ? "animte-enter" : "animate-leave",
        satoshiFont.variable
      )}
    >
      {title}
    </div>
  );
};

export default ToastWrapper;
