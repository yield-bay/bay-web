import { Fragment, useEffect, useState, memo } from "react";
import { Menu, Dialog, Transition } from "@headlessui/react";
import { ClipboardIcon, XIcon } from "@heroicons/react/outline";
import { ShareIcon } from "@heroicons/react/solid";
import { useAtom } from "jotai";
import { isNotificationAtom } from "@store/atoms";
import { trackEventWithProperty } from "@utils/analytics";
import { formatFirstLetter } from "@utils/farmListMethods";
import useScreenSize from "@hooks/useScreenSize";

// Types
type ShareFarmPropsType = {
  farm: any;
  apr: string;
};

type ShareMenuPropsType = {
  farm: any;
  url: string;
  tweetUrl: string;
  isNotificationSet: (update: boolean) => void;
};

type ShareModalPropsType = {
  open: boolean;
  setOpen: (value: boolean) => void;
  url: string;
  tweetUrl: string;
  isNotificationSet: (value: boolean) => void;
  farmAddress: string;
  farmId: number;
};

function classNames(classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const ShareFarm = ({ farm, apr }: ShareFarmPropsType) => {
  const [, isNotificationSet] = useAtom(isNotificationAtom);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  let [url, setUrl] = useState<string>("");
  const screenSize = useScreenSize();

  // Tweet's URL with required parameters
  const tweetUrl =
    `https://twitter.com/share?text=I%20found%20this%20farm%20with%20${apr}%25%20APR%20on%20${formatFirstLetter(
      farm.protocol
    )}%21%0A%0AWhen%20looking%20for%20yield%20farms%20in%20Dotsama%2C%20%40yield_bay%20is%20the%20place%20to%20go%20%F0%9F%8F%84%F0%9F%8F%96%EF%B8%8F%20%0A%0A%E2%86%92` +
    encodeURIComponent(url);

  // UTM paramters for tracking
  const utmLink =
    "&utm_campaign=share-farm&utm_source=yb-list&utm_medium=textlink";

  useEffect(() => {
    setUrl(
      `${
        typeof window !== "undefined"
          ? window.location.host // for testing locally
          : "https://list.yieldbay.io"
      }/?farm=${farm?.asset?.address}&id=${farm?.id}` + utmLink
    );
  }, [farm]);

  return (
    <div>
      {screenSize === "xs" ? (
        <ShareModal
          open={modalOpen}
          setOpen={setModalOpen}
          url={url}
          tweetUrl={tweetUrl}
          isNotificationSet={isNotificationSet}
          farmAddress={farm?.asset.address}
          farmId={farm?.id}
        />
      ) : (
        <ShareMenu
          farm={farm}
          url={url}
          tweetUrl={tweetUrl}
          isNotificationSet={isNotificationSet}
        />
      )}
    </div>
  );
};

// Share menu for desktop view
const ShareMenu = ({
  farm,
  url,
  tweetUrl,
  isNotificationSet,
}: ShareMenuPropsType) => {
  return (
    <Menu as="div" className="relative hidden sm:inline-block">
      <div className="">
        <Menu.Button className="p-4 rounded-lg bg-bodyGray dark:bg-baseBlueMid hover:bg-primaryWhite dark:hover:bg-baseBlueDark active:bg-primaryWhite dark:active:bg-baseBlueMid hover:ring-[3px] dark:hover:ring-2 active:ring-2 ring-[#B5D0FF] dark:ring-blueSilver dark:active:ring-0 cursor-pointer transition-all duration-200">
          <ShareIcon className="w-4 h-4 text-primaryBlue dark:text-bodyGray" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="z-20 origin-top-left font-spaceGrotesk absolute right-0 mt-2 max-w-max rounded-lg shadow-lg bg-white dark:bg-[#011433] ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
          <div>
            <Menu.Item>
              {({ active }: any) => (
                <a
                  href={tweetUrl}
                  className={classNames([
                    active ? "bg-bodyGray dark:bg-baseBlueMid" : "",
                    "group flex justify-start gap-x-2 px-6 py-4 text-sm w-full rounded-t-lg text-primaryBlue",
                  ])}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackEventWithProperty("farm-share", {
                      shareVia: "twitter",
                      farmAddress: farm.asset?.address,
                      farmId: farm.id,
                    })
                  }
                >
                  <span className="sr-only">Share on Twitter</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  Share on Twitter
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }: any) => (
                <button
                  onClick={(e) => {
                    navigator.clipboard.writeText(url);
                    isNotificationSet(true);
                    setTimeout(() => {
                      isNotificationSet(false);
                    }, 2000); // Duration for Toast

                    trackEventWithProperty("farm-share", {
                      shareVia: "copy",
                      farmAddress: farm.asset?.address,
                      farmId: farm.id,
                    });
                  }}
                  className={classNames([
                    active ? "bg-bodyGray dark:bg-baseBlueMid" : "",
                    "group flex justify-start gap-x-2 px-6 py-4 rounded-b-lg border-t dark:border-gray-800 text-sm w-full",
                  ])}
                >
                  <ClipboardIcon className="h-5 w-5" aria-hidden="true" />
                  Copy link
                </button>
              )}
            </Menu.Item>
          </div>
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
  isNotificationSet,
  farmAddress,
  farmId,
}: ShareModalPropsType) => {
  return (
    <div className="sm:hidden">
      <div
        className="py-4 px-[19px] hover:scale-105 active:scale-100 rounded-md bg-bodyGray dark:bg-baseBlueMid text-primaryBlue dark:text-primaryWhite active:ring-2 ring-[#B5D0FF] dark:ring-blueSilver transition-all duration-200"
        onClick={() => setOpen(true)}
      >
        <ShareIcon className="w-[18px]" />
      </div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={setOpen}
        >
          <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-slate-500 bg-opacity-70 transition-opacity" />
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
              <div className="relative font-spaceGrotesk inline-block sm:hidden align-middle bg-white dark:bg-[#011433] rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-sm">
                {/* Close Button */}
                <div className="absolute top-0 right-0 pt-2 pr-2 sm:block">
                  <div className="flex items-center p-1 group rounded-full active:bg-neutral-100 dark:active:bg-neutral-700">
                    <button
                      type="button"
                      className="text-neutral-600 dark:text-slate-600 active:text-neutral-900 dark:active:text-slate-200 focus:outline-none"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {/* Modal content */}
                <div className="mt-3 w-full">
                  <Dialog.Title
                    as="h3"
                    className="text-lg pb-3 text-center leading-6 px-5 font-spaceGrotesk font-medium text-neutral-900 dark:text-white"
                  >
                    Share farm
                  </Dialog.Title>
                  <div className="w-full pt-0">
                    <div className="flex flex-col w-full text-primaryBlue dark:text-white">
                      {/* Share on Twitter button */}
                      <a
                        href={tweetUrl}
                        className="group flex justify-center gap-x-2 w-full text-sm font-medium border-y border-bodyGray dark:border-slate-800 py-4 px-6 active:dark:text-neutral-100 active:bg-bodyGray dark:active:bg-baseBlueMid cursor-pointer"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          trackEventWithProperty("farm-share", {
                            shareVia: "twitter",
                            farmAddress: farmAddress,
                            farmId: farmId,
                          });
                          setOpen(false);
                        }}
                      >
                        <span className="sr-only">Share on Twitter</span>
                        <svg
                          className="h-5 w-5 mr-3 text-primaryBlue"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                        Share on Twitter
                      </a>
                      {/* Copy Link Button */}
                      <button
                        onClick={(e) => {
                          navigator.clipboard.writeText(url);
                          isNotificationSet(true);
                          setTimeout(() => {
                            isNotificationSet(false);
                          }, 2000); // Duration for Toast
                          setOpen(false);
                          trackEventWithProperty("farm-share", {
                            shareVia: "copy",
                            farmAddress: farmAddress,
                            farmId: farmId,
                          });
                        }}
                        className="text-sm inline-flex justify-center font-medium border-b border-neutral-100 dark:border-neutral-700 py-4 px-6 active:text-neutral-600 active:dark:text-neutral-100 active:bg-neutral-100 dark:active:bg-neutral-700 cursor-pointer"
                      >
                        <ClipboardIcon
                          className="mr-3 h-5 w-5"
                          aria-hidden="true"
                        />
                        Copy link
                      </button>
                    </div>
                  </div>
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
