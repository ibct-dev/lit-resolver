import { Injectable, PipeTransform, ArgumentMetadata } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { BadRequestException } from "@common/errors/http.error";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = plainToClass(metatype, value);
        const errors = await validate(object);
        if (errors.length > 0) {
            throw new BadRequestException(
                `Validation failed Errors: ${JSON.stringify(
                    errors.map(error => {
                        if (error.constraints) return error.constraints;
                        else if (error.children.length) {
                            let ret = {};
                            for (const iterator of error.children) {
                                ret = { ...ret, ...iterator.constraints };
                            }
                            return ret;
                        }
                    })
                )}`
            );
        }
        return value;
    }

    private toValidate(metatype: any): boolean {
        const types = [String, Boolean, Number, Array, Object];
        return !types.find(type => metatype === type);
    }
}
