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
      fontSize="14px"
      fontWeight="500"
      rounded="8px"
      zIndex={9999}
      lineHeight="20px"
      maxWidth="320px"
      hasArrow={true}
      placement={placement}
      bg="#FFFFFF"
      color="#344054"
      boxShadow="0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)"
    >
      {children}
    </TooltipChakra>
  );
};

export default Tooltip;
