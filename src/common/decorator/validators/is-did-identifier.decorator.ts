import { registerDecorator, ValidationOptions } from "class-validator";
import { decode } from "bs58";

export function IsDidIdentifier(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: "isDidIdentifier",
            target: object.constructor,
            propertyName: propertyName,
            // constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: string): boolean {
                    try {
                        const slice = value.split(":");

                        if (slice[0] !== "did" || slice[1] !== "lit")
                            return false;

                        const hexStr = decode(slice[2]).toString("hex");
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
