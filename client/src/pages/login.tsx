import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import CreateUrqlClient from "../utils/createUrqlClient";
import ToErrorMap from "../utils/toErrorMap";

const Login: NextPage = ({}) => {
  const [, login] = useLoginMutation();
  const router = useRouter();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (value, { setErrors }) => {
          const response = await login(value);
          if (response.data?.login.errors) {
            const formatErrors = ToErrorMap(response.data.login.errors);
            setErrors(formatErrors);
          } else if (response.data?.login.user) {
            // logged in
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name={"usernameOrEmail"}
              placeholder={"username or email"}
              label={"Username or Email"}
            />
            <Box mt={4}>
              <InputField
                name={"password"}
                placeholder={"password"}
                label={"Password"}
                type="password"
              />
            </Box>
            <NextLink href={"/forgot-password"}>
              <Link>forgot?</Link>
            </NextLink>
            <Box mt={4}>
              <Button
                colorScheme={"teal"}
                isLoading={isSubmitting}
                type="submit"
              >
                Login
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(CreateUrqlClient)(Login);
