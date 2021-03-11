import { registerDecorator, ValidationOptions } from "class-validator";
import { PublicKey } from "eosjs/dist/PublicKey";

export function IsPublicKey(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: "isPublicKey",
            target: object.constructor,
            propertyName: propertyName,
            // constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: string): boolean {
                    try {
                        PublicKey.fromString(value);
                        return true;
                    } catch (error) {
                        return false;
                    }
                },
            },
        });
    };
}
