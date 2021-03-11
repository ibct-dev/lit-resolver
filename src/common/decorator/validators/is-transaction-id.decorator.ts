import { registerDecorator, ValidationOptions } from "class-validator";

export function IsTransactionId(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: "isTransactionId",
            target: object.constructor,
            propertyName: propertyName,
            // constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: string): boolean {
                    const regex = /^(0x|0h)?[A-Fa-f0-9]{64}$/g;
                    return regex.test(value);
                },
            },
        });
    };
}
