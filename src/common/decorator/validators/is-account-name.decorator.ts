import { registerDecorator, ValidationOptions } from "class-validator";

export function IsAccountName(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: "isAccountName",
            target: object.constructor,
            propertyName: propertyName,
            // constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: string): boolean {
                    if (!value.length || value.length > 12) return false;

                    for (let index = 0; index < value.length; index++) {
                        const char = value.charCodeAt(index);
                        let hasDot = false;
                        if (char === 46) {
                            if (hasDot === false) hasDot = true;
                            else {
                                return false;
                            }
                        } else {
                            if (
                                !(char >= 49 && char <= 53) &&
                                !(char >= 97 && char <= 122)
                            ) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
            },
        });
    };
}
