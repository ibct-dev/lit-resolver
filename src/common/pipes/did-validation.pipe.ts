import { Injectable, PipeTransform } from "@nestjs/common";
import { BadRequestException } from "@common/errors/http.error";
import { decode } from "bs58";

@Injectable()
export class DidValidationPipe implements PipeTransform<string> {
    async transform(value: string) {
        const slice = value.split(":");

        if (slice[0] !== "did" || slice[1] !== "lit") {
            throw new BadRequestException("Invalid did format", {
                context: "ValidationPipe",
            });
        }

        const hexStr = decode(slice[2]).toString("hex");
        if (hexStr.length === 32) return slice[2];
        throw new BadRequestException(
            "Invalid did, id string must be 32 byte",
            {
                context: "ValidationPipe",
            }
        );
    }
}
