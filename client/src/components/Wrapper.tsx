import { Box } from "@chakra-ui/layout";
import React from "react";

interface WrapperProps {
  variant?: "small" | "regular";
  children: React.ReactElement;
}

const Wrapper: React.FC<WrapperProps> = ({ children, variant = "regular" }) => {
  return (
    <Box mt={8} mx="auto" w="100%" maxW={variant === "regular" ? "800px" : "400px"}>
      {children}
    </Box>
  );
};
export default Wrapper;
