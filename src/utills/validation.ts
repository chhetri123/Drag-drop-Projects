export interface Validator {
  value: number | string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  max?: number;
  min?: number;
}
// validation logic
export function validate(inputValue: Validator): boolean {
  let isValid = true;

  if (inputValue.required) {
    isValid = isValid && inputValue.value.toString().trim().length !== 0;
  }

  if (inputValue.maxLength && typeof inputValue.value === "string") {
    isValid = isValid && inputValue.value.length < inputValue.maxLength;
  }
  if (inputValue.minLength && typeof inputValue.value === "string") {
    isValid = isValid && inputValue.value.length > inputValue.minLength;
  }
  if (inputValue.min != null && typeof inputValue.value === "number") {
    isValid = isValid && inputValue.value > inputValue.min;
  }
  if (inputValue.max != null && typeof inputValue.value === "number") {
    isValid = isValid && inputValue.value < inputValue.max;
  }

  return isValid;

  //  ****** Reusable method
  // interface validation {
  //   [propertyName: string]: {
  //     [propertyName: string]: string[];
  //   };
  // }
  // const regestratedValidator: validation = {};

  // function Required(target: any, propName: string) {
  //   regestratedValidator[target.constructor.name] = {
  //     ...regestratedValidator[target.constructor.name],
  //     [propName]: ["required"],
  //   };
  // }

  // function Positve(target: any, propName: string) {
  //   regestratedValidator[target.constructor.name] = {
  //     ...regestratedValidator[target.constructor.name],
  //     [propName]: ["positive"],
  //   };
  // }

  // function validate(obj: any) {
  //   console.log(obj);
  //   const objValidator = regestratedValidator[obj.constructor.name];
  //   if (!objValidator) {
  //     return true;
  //   }
  //   let isValid = true;
  //   for (const propName in objValidator) {
  //     for (const validator of objValidator[propName]) {
  //       switch (validator) {
  //         case "required":
  //           isValid = isValid && !!obj[propName];
  //           break;
  //         case "positive":
  //           isValid = isValid && obj[propName] > 0;
  //           break;
  //       }
  //     }
  //   }
  //   return isValid;
  // }
}
