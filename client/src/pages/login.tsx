import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import CreateUrqlClient from "../utils/createUrqlClient";
import ToErrorMap from "../utils/toErrorMap";

interface LoginProps {}

const Login: React.FC<LoginProps> = ({}) => {
  const [, login] = useLoginMutation();
  const router = useRouter();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
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
              name={"username"}
              placeholder={"username"}
              label={"Username"}
            />
            <Box mt={4}>
              <InputField
                name={"password"}
                placeholder={"password"}
                label={"Password"}
                type="password"
              />
            </Box>
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
