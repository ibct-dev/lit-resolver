import { Controller, Inject, Get, Header, Param } from "@nestjs/common";

@Controller()
export class IdentifierControllerRoot {
    @Get()
    async handleRootRequest(): Promise<any> {
        // Add your logic here to handle requests to the root path
        return "HealthCheck.";
    }
}
