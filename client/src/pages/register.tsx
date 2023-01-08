import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useRegisterMutation } from "../generated/graphql";
import ToErrorMap from "../utils/toErrorMap";
import CreateUrqlClient from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

interface RegisterProps {}

const Register: React.FC<RegisterProps> = ({}) => {
  const [, register] = useRegisterMutation();
  const router = useRouter();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (value, { setErrors }) => {
          const response = await register(value);
          if (response.data?.register.errors) {
            const formatErrors = ToErrorMap(response.data.register.errors);
            setErrors(formatErrors);
          } else if (response.data?.register.user) {
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
                Register
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(CreateUrqlClient)(Register);
