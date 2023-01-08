import { Box, Flex } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useEffect } from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import IsServer from "../utils/isServer";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: fetchingLogout }, logout] = useLogoutMutation();
  const [{ fetching, data }, me] = useMeQuery({
    // pause: IsServer(),// causes hydration error 
  });

  useEffect(() => {
    // reexecute once loaded on client 
    // creates one every render excessive api call
    // but didn't find the proper solution in urql maybe will be fixable in Apollo Client
    //TODO: Fix once on Apollo Client
    me({requestPolicy: "cache-and-network"}) 
  }, []) 

  let body = null;
  if (fetching) {
  } else if (!data?.me) {
    body = (
      <>
        <Box mr={2} ml="auto">
          <NextLink href={"/login"}>login</NextLink>
        </Box>
        <Box>
          <NextLink href={"/register"}>register</NextLink>
        </Box>
      </>
    );
  } else {
    body = (
      <>
        <Box ml="auto" mr={2}>
          {data.me.username}
        </Box>
        <Button
          isLoading={fetchingLogout}
          onClick={() => {
            logout();
          }}
          variant={"link"}
        >
          logout
        </Button>
      </>
    );
  }
  return (
    <Flex color={"white"} p={4} bg={"crimson"}>
      {body}
    </Flex>
  );
};
export default NavBar;
