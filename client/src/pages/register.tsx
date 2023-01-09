import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useRegisterMutation } from "../generated/graphql";
import CreateUrqlClient from "../utils/createUrqlClient";
import ToErrorMap from "../utils/toErrorMap";

const Register: NextPage = ({}) => {
  const [, register] = useRegisterMutation();
  const router = useRouter();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (value, { setErrors }) => {
          const response = await register({ input: value });
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
            <InputField name={"email"} placeholder={"email"} label={"Email"} />
            <Box mt={4}>
              <InputField
                name={"username"}
                placeholder={"username"}
                label={"Username"}
              />
            </Box>
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
