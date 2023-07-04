import { useAtom } from "jotai";
import { selectedFarmAtom } from "@store/atoms";
import AddSectionStandard from "./AddSectionStandard";
import AddSectionStable from "./AddSectionStable";
import { FC } from "react";

const AddLiquidityModal: FC = () => {
  const [selectedFarm] = useAtom(selectedFarmAtom);

  if (!!selectedFarm) {
    if (selectedFarm?.farmType == "StandardAmm") {
      return <AddSectionStandard />;
    } else if (selectedFarm?.farmType == "StableAmm") {
      return <AddSectionStable />;
    } else {
      return <div></div>;
    }
  } else {
    return <div></div>;
  }
};

export default AddLiquidityModal;
