import { FC } from "react";
import { useAtom } from "jotai";
import { selectedPositionAtom } from "@store/atoms";
import ClaimSectionDot from "./ClaimSectionDot";
import ClaimSectionEvm from "./ClaimSectionEvm";
import { claimModalOpenAtom } from "@store/commonAtoms";

const ClaimRewardsModal: FC = () => {
  const [position] = useAtom(selectedPositionAtom);
  const [isOpen] = useAtom(claimModalOpenAtom);
  if (!!position && isOpen) {
    if (
      position?.chain.toLowerCase() == "mangata kusama" &&
      position?.protocol.toLowerCase() == "mangata x"
    ) {
      return <ClaimSectionDot />;
    }
    return <ClaimSectionEvm />;
  } else {
    return <div></div>;
  }
};

export default ClaimRewardsModal;
