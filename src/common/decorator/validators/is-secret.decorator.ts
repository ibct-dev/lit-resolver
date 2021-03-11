import { registerDecorator, ValidationOptions } from "class-validator";
import { decode } from "bs58";

export function IsSecret(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: "isSecret",
            target: object.constructor,
            propertyName: propertyName,
            // constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: string): boolean {
                    try {
                        const hexStr = decode(value).toString("hex");
                        if (hexStr.length === 32) return true;
                        return false;
                    } catch (error) {
                        return false;
                    }
                },
            },
        });
    };
}
