import { Tooltip as TooltipChakra } from "@chakra-ui/react";
import { FC } from "react";

interface Props {
  label: React.ReactNode;
  children: JSX.Element;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
}

/**
 * Tooltips display informative text when users hover, focus on, or tap an element.
 * @param label - The text to be displayed in the tooltip
 * @param children - The element to be wrapped by the tooltip
 * @param placement - top, bottom, left, right and auto
 */
const Tooltip: FC<Props> = ({ label, children, placement = "bottom" }) => {
  return (
    <TooltipChakra
      label={label}
      aria-label={`${label} Info`}
      paddingY="12px"
      paddingX="12px"
      fontSize="12px"
      fontWeight="600"
      rounded="8px"
      lineHeight="18px"
      maxWidth="320px"
      hasArrow={true}
      placement={placement}
      bg="#FFFFFF"
      color="#344054"
    >
      {children}
    </TooltipChakra>
  );
};

export default Tooltip;
