import { FC } from "react";
import { useAtom } from "jotai";
import { selectedFarmAtom } from "@store/atoms";
import RemoveSectionStandard from "./RemoveSectionStandard";
import RemoveSectionStable from "./RemoveSectionStable";
import RemoveSectionMangata from "./RemoveSectionMangata";
import { removeLiqModalOpenAtom } from "@store/commonAtoms";

const RemoveLiquidityModal: FC = () => {
  const [farm] = useAtom(selectedFarmAtom);
  const [isOpen] = useAtom(removeLiqModalOpenAtom);

  if (!!farm && isOpen) {
    if (
      farm?.chain.toLowerCase() == "mangata kusama" &&
      farm?.protocol.toLowerCase() == "mangata x"
    ) {
      return <RemoveSectionMangata />;
    }
    if (farm?.farmType == "StandardAmm") {
      return <RemoveSectionStandard />;
    } else if (farm?.farmType == "StableAmm") {
      return <RemoveSectionStable />;
    } else {
      return <div></div>;
    }
  } else {
    return <div></div>;
  }
};

export default RemoveLiquidityModal;
