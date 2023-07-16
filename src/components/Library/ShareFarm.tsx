import { Fragment, useEffect, useState, memo } from "react";
import { Menu, Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { formatFirstLetter } from "@utils/farmListMethods";
import useScreenSize from "@hooks/useScreenSize";
import { useAtom } from "jotai";
import { hashAtom } from "@store/atoms";
import Image from "next/image";
import clsx from "clsx";

// Types
type ShareFarmPropsType = {
  farm: any;
};

type ShareMenuPropsType = {
  farm: any;
  url: string;
  tweetUrl: string;
};

type ShareModalPropsType = {
  open: boolean;
  setOpen: (value: boolean) => void;
  url: string;
  tweetUrl: string;
  farm: any;
};

const ShareFarm = ({ farm }: ShareFarmPropsType) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  let [url, setUrl] = useState<string>("");
  const screenSize = useScreenSize();

  const [hashVal, _] = useAtom(hashAtom);

  const apr = (farm?.apr.base + farm?.apr.reward).toFixed(2);
  // UTM paramters for tracking
  const utmLink =
    "&utm_campaign=share-farm&utm_source=yb-list&utm_medium=textlink";

  //Hash parameters for tracking
  const hashLink = hashVal ? `&hash=${hashVal}` : "";

  // Tweet's URL with required parameters
  const tweetUrl =
    `https://twitter.com/share?text=I%20found%20this%20farm%20with%20${apr}%25%20APR%20on%20${formatFirstLetter(
      farm.protocol
    )}%21%0A%0AWhen%20looking%20for%20yield%20farms%20in%20Dotsama%2C%20%40yield_bay%20is%20the%20place%20to%20go%20%F0%9F%8F%84%F0%9F%8F%96%EF%B8%8F%20%0A%0A%E2%86%92` +
    encodeURIComponent(url);

  useEffect(() => {
    const urlPath = `/farm/${farm?.id}?addr=${farm?.asset.address}`;
    setUrl(
      `${
        typeof window !== "undefined"
          ? `http://${window.location.host}` // for testing locally
          : "https://list.yieldbay.io"
      }${urlPath}` +
        utmLink +
        hashLink
    );
  }, [farm, hashVal]);

  return (
    <div>
      {screenSize === "xs" ? (
        <ShareModal
          open={modalOpen}
          setOpen={setModalOpen}
          url={url}
          tweetUrl={tweetUrl}
          farm={farm}
        />
      ) : (
        <ShareMenu farm={farm} url={url} tweetUrl={tweetUrl} />
      )}
    </div>
  );
};

// Share menu for desktop view
const ShareMenu = ({ farm, url, tweetUrl }: ShareMenuPropsType) => {
  return (
    <Menu as="div" className="relative hidden sm:inline-block">
      <Menu.Button className="p-3 cursor-pointer transition-all duration-200">
        <Image src="/icons/ShareIcon.svg" alt="share" height={24} width={24} />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="z-20 origin-top-right absolute right-0 mt-2 w-60 rounded-lg shadow-lg bg-white ring-1 ring-[#EAECF0] divide-y text-sm font-medium leading-5 divide-[#EAECF0] focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={(e) => {
                  navigator.clipboard.writeText(url);
                }}
                className={clsx([
                  active && "bg-gray-50",
                  "group text-left p-4 rounded-t-lg w-full",
                ])}
              >
                <span className="sr-only">Copy link</span>
                Copy link
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href={tweetUrl}
                className={clsx([
                  active && "bg-gray-50",
                  "group flex text-left p-4 rounded-b-lg w-full",
                ])}
                target="_blank"
                rel="noreferrer"
              >
                <span className="sr-only">Share on Twitter</span>
                Share on Twitter
              </a>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

// Share modal for mobile view
const ShareModal = ({
  open,
  setOpen,
  url,
  tweetUrl,
  farm,
}: ShareModalPropsType) => {
  return (
    <div className="sm:hidden">
      <div onClick={() => setOpen(true)}>
        <Image src="/icons/ShareIcon.svg" alt="share" height={24} width={24} />
      </div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={setOpen}
        >
          <div className="flex flex-col items-center justify-center min-h-screen px-8 text-left">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-[#11121D]/80 backdrop-blur-[8px]" />
            </Transition.Child>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="relative inline-block bg-white rounded-lg text-left shadow-xl py-8 px-6 align-bottom w-full transform transition-all">
                {/* Close Button */}
                <div className="absolute top-0 right-0 p-5">
                  <div className="flex items-center rounded-full p-1 hover:bg-gray-100">
                    <button
                      type="button"
                      className="text-[#101828] focus:outline-none"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {/* Modal content */}
                <div className="flex flex-col gap-y-6 w-full text-[#344054]">
                  {/* Share on Twitter button */}
                  <a
                    href={tweetUrl}
                    className="w-full text-sm font-semibold leading-5"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    Share on Twitter
                  </a>
                  {/* Copy Link Button */}
                  <button
                    onClick={(e) => {
                      navigator.clipboard.writeText(url);
                      setOpen(false);
                    }}
                    className="w-full text-left text-sm font-semibold leading-5"
                  >
                    Copy link
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default memo(ShareFarm);
