import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import CreateUrqlClient from "../../utils/createUrqlClient";
import ToErrorMap from "../../utils/toErrorMap";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [tokenError, setTokenError] = useState("");
  const [, changePassword] = useChangePasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (value, { setErrors }) => {
          const response = await changePassword({
            newPassword: value.newPassword,
            token,
          });
          if (response.data?.changePassword.errors) {
            const formatErrors = ToErrorMap(
              response.data.changePassword.errors
            );
            if ("token" in formatErrors) {
              setTokenError(formatErrors.token);
            }
            setErrors(formatErrors);
          } else if (response.data?.changePassword.user) {
            // logged in
            router.push("/login");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name={"newPassword"}
              placeholder={"new password"}
              label={"New password"}
              type="password"
            />
            {tokenError && (
              <Flex justifyContent={'space-between'} alignItems='center'>
                <Box color={"red"}>{tokenError}</Box>
                <NextLink href={"/forgot-password"}>
                  <Link>get a new one</Link>
                </NextLink>
              </Flex>
            )}
            <Box mt={4}>
              <Button
                colorScheme={"teal"}
                isLoading={isSubmitting}
                type="submit"
              >
                Change password
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => ({
  token: query.token as string,
});
export default withUrqlClient(CreateUrqlClient)(ChangePassword);
