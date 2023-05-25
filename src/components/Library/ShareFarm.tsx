import { Fragment, useEffect, useState, memo } from "react";
import { Menu, Dialog, Transition } from "@headlessui/react";
import { ClipboardIcon, XIcon } from "@heroicons/react/outline";
import { ShareIcon } from "@heroicons/react/solid";
import { trackEventWithProperty } from "@utils/analytics";
import { formatFirstLetter } from "@utils/farmListMethods";
import useScreenSize from "@hooks/useScreenSize";
import { useAtom } from "jotai";
import { hashAtom } from "@store/atoms";

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

function classNames(classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

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
        <ShareIcon className="w-6 text-[#AFAFAF]" />
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
        <Menu.Items className="z-20 origin-top-left font-spaceGrotesk absolute right-0 mt-2 min-w-max rounded-lg shadow-lg bg-[#011433] ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
          <div>
            <Menu.Item>
              {({ active }: any) => (
                <a
                  href={tweetUrl}
                  className={classNames([
                    active ? "bg-baseBlueMid" : "",
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

                    trackEventWithProperty("farm-share", {
                      shareVia: "copy",
                      farmAddress: farm.asset?.address,
                      farmId: farm.id,
                    });
                  }}
                  className={classNames([
                    active ? "bg-baseBlueMid" : "",
                    "group flex justify-start gap-x-2 px-6 py-4 rounded-b-lg border-t border-gray-800 text-sm w-full",
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
  farm,
}: ShareModalPropsType) => {
  return (
    <div className="sm:hidden">
      <div
        className="py-4 transition-all duration-200"
        onClick={() => setOpen(true)}
      >
        <ShareIcon className="w-5 text-white" />
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
              <div className="relative font-spaceGrotesk inline-block sm:hidden align-middle bg-baseBlue rounded-lg overflow-hidden transform transition-all w-full max-w-sm">
                {/* Close Button */}
                <div className="absolute top-0 right-0 pt-2 pr-2 sm:block">
                  <div className="flex items-center p-1 group rounded-full active:bg-neutral-700">
                    <button
                      type="button"
                      className="text-slate-600 active:text-slate-200 focus:outline-none"
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
                    className="text-lg pb-3 text-center leading-6 px-5 font-spaceGrotesk font-medium text-white"
                  >
                    Share farm
                  </Dialog.Title>
                  <div className="w-full pt-0">
                    <div className="flex flex-col w-full text-white">
                      {/* Share on Twitter button */}
                      <a
                        href={tweetUrl}
                        className="group flex justify-center gap-x-2 w-full text-sm font-medium border-y border-slate-800 py-4 px-6 active:text-neutral-100 active:bg-baseBlueMid cursor-pointer"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          trackEventWithProperty("farm-share", {
                            shareVia: "twitter",
                            farmAddress: farm?.asset.address,
                            farmId: farm?.id,
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
                          setOpen(false);
                          trackEventWithProperty("farm-share", {
                            shareVia: "copy",
                            farmAddress: farm?.asset.address,
                            farmId: farm?.id,
                          });
                        }}
                        className="text-sm inline-flex justify-center font-medium border-b border-neutral-700 py-4 px-6 active:text-neutral-100 active:bg-neutral-700 cursor-pointer"
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
