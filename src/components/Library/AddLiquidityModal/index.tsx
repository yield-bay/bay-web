import { FC } from "react";
import { useAtom } from "jotai";
import { selectedFarmAtom } from "@store/atoms";
import AddSectionStandard from "./AddSectionStandard";
import AddSectionStable from "./AddSectionStable";
import AddSectionMangata from "./AddSectionMangata";
import { addLiqModalOpenAtom } from "@store/commonAtoms";

const AddLiquidityModal: FC = () => {
  const [farm] = useAtom(selectedFarmAtom);
  const [isOpen] = useAtom(addLiqModalOpenAtom);
  if (!!farm && isOpen) {
    if (
      farm?.chain.toLowerCase() == "mangata kusama" &&
      farm?.protocol.toLowerCase() == "mangata x"
    ) {
      return <AddSectionMangata />;
    }
    if (farm?.farmType == "StandardAmm") {
      return <AddSectionStandard />;
    } else if (farm?.farmType == "StableAmm") {
      return <AddSectionStable />;
    } else {
      return <div></div>;
    }
  } else {
    return <div></div>;
  }
};

export default AddLiquidityModal;
