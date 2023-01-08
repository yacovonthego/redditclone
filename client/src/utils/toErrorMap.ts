import { FieldError } from "../generated/graphql";

const ToErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {};
  for (let { field, message } of errors) {
    errorMap[field] = message;
  }
  return errorMap;
};
export default ToErrorMap;
