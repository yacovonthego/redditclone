import { UserDataInput } from "../resolvers/UserDataInput";

const ValidateRegister = (input: UserDataInput) => {
  if (
    !input.email.match(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    )
  )
    return [
      {
        field: "email",
        message: "Invalid email",
      },
    ];

  if (input.username.length < 3)
    return [
      {
        field: "username",
        message: "Username should be at least 3 characters long",
      },
    ];

  if (input.username.includes("@"))
    return [
      {
        field: "username",
        message: "Cannot include @",
      },
    ];

  if (input.password.length < 3)
    return [
      {
        field: "password",
        message: "Password should be at least 3 characters long ",
      },
    ];

  return null;
};
export default ValidateRegister;
