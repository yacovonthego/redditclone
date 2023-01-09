import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import router from "next/router";
import React, { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import CreateUrqlClient from "../utils/createUrqlClient";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [completed, setCompleted] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (value, { setErrors }) => {
          await forgotPassword(value);
          setCompleted(true);
        }}
      >
        {({ isSubmitting }) =>
          completed ? (
            <Box color={"green"} mt={1}>
              If account with such an email exists, it will recieve a recovery
              email
            </Box>
          ) : (
            <Form>
              <InputField
                name={"email"}
                placeholder={"email"}
                label={"Email"}
              />
              <Box mt={4}>
                <Button
                  colorScheme={"teal"}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  Forgot password
                </Button>
              </Box>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(CreateUrqlClient)(ForgotPassword);
