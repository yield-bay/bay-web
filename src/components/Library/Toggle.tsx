import { FC } from "react";
import { Switch } from "@headlessui/react";
import clsx from "clsx";
import { showSupportedFarmsAtom } from "@store/atoms";
import { useAtom } from "jotai";

interface Props {
  label: string;
}

const Toggle: FC<Props> = ({ label }) => {
  const [enabled, setEnabled] = useAtom(showSupportedFarmsAtom);
  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      className={clsx(
        enabled ? "bg-[#D7D7FF]" : "bg-[#EAEAF1]",
        "relative inline-flex h-5 sm:h-6 w-10 sm:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
      )}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={clsx(
          enabled ? "translate-x-5" : "translate-x-0",
          "pointer-events-none inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        )}
      />
    </Switch>
  );
};

export default Toggle;
