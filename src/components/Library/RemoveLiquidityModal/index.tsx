import { FC } from "react";
import { useAtom } from "jotai";
import { selectedFarmAtom } from "@store/atoms";
import RemoveSectionStandard from "./RemoveSectionStandard";
import RemoveSectionStable from "./RemoveSectionStable";

const AddLiquidityModal: FC = () => {
  const [selectedFarm] = useAtom(selectedFarmAtom);

  if (!!selectedFarm) {
    if (selectedFarm?.farmType == "StandardAmm") {
      return <RemoveSectionStandard />;
    } else if (selectedFarm?.farmType == "StableAmm") {
      return <RemoveSectionStable />;
    } else {
      return <div></div>;
    }
  } else {
    return <div></div>;
  }
};

export default AddLiquidityModal;
