import { Controller, Get } from "@nestjs/common";

@Controller()
export class IdentifierControllerRoot {
    constructor() {}
    @Get()
    async handleRequest(): Promise<any> {
        // Add your logic here to handle requests to the root path
        return '{"message":"HealthCheck."}';
    }
}
