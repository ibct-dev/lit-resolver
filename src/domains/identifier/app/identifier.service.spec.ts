// import * as faker from "faker";
import { Test, TestingModule } from "@nestjs/testing";
import { CqrsModule } from "@nestjs/cqrs";
import { anything, instance, mock, when } from "ts-mockito";
import { IdentifierService } from "./identifier.service";

import { QueryHandlers } from "@identifier/domain/queries/handlers";

import { LoggerService } from "@shared/modules/logger/logger.service";
import { LedgisService } from "@shared/modules/blockchain/ledgis/ledgis.service";

import { DidValidationPipe } from "@common/pipes/did-validation.pipe";

describe("IdentifierService", () => {
    let identifierService: IdentifierService;

    const mockLoggerService: LoggerService = mock(LoggerService);
    const mockLedgisService: LedgisService = mock(LedgisService);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CqrsModule],
            providers: [
                {
                    provide: "LoggerService",
                    useValue: instance(mockLoggerService),
                },
                {
                    provide: "LedgisService",
                    useValue: instance(mockLedgisService),
                },
                { provide: "IdentifierService", useClass: IdentifierService },
                ...QueryHandlers,
            ],
        }).compile();
        identifierService = module.get<IdentifierService>(IdentifierService);

        await module.init();
    });

    describe("#getDidDocument()", () => {
        const did = "did:lit:5b5D3F2Wuq9Yz5JGSuXQEk";

        const validator = new DidValidationPipe();

        when(mockLedgisService.getRawDid(anything())).thenReturn(
            new Promise(resolve => {
                resolve({
                    service: [],
                    verificationMethod: [
                        {
                            publicKey:
                                "EOS5aA6Czb3nSExURFVTrtairT2iK17QPokQCqsf8HdywhhG3Vw7N",
                            controller:
                                "49381006045822631699836847160353783849",
                        },
                        {
                            publicKey:
                                "EOS7SjcikyugKxeVHb874Mf5G4CPL4a5vUUj3X4jqrp2xZDrGYrtT",
                            controller:
                                "49381006045822631699836847160353783849",
                        },
                        {
                            publicKey:
                                "EOS7yXt52qA9WSDtDb6nWUZs935szyqi5f4s9hNM6372NSqtJQswX",
                            controller:
                                "49381006045822631699836847160353783849",
                        },
                        {
                            publicKey:
                                "EOS82EmJA13syCgai6KQhuHsb1WzQ3MurTsYuZnLM82zXmhDEXp8d",
                            controller:
                                "49381006045822631699836847160353783849",
                        },
                        {
                            publicKey:
                                "EOS6E2toofeXbvV2iKRwBh9tvmtfZzKfEfdUqTYEUsEnrFucvCMgv",
                            controller:
                                "49381006045822631699836847160353783849",
                        },
                        {
                            publicKey:
                                "EOS6jAppWzKfBGpspU5aH5KA1Dc8my4UJrYAUMsBBqizFztht5y6g",
                            controller:
                                "49381006045822631699836847160353783849",
                        },
                        {
                            publicKey:
                                "EOS8ZP8evpj8VfJ6BCozYLzGa1nXuqCMm2fB7z95gAoyr7W3FBGpz",
                            controller:
                                "49381006045822631699836847160353783849",
                        },
                        {
                            publicKey:
                                "EOS7zNonCSJuNhE6YUch2NKi97rTUhVMcUbebZ3iZyLeRZZbcx29j",
                            controller:
                                "49381006045822631699836847160353783849",
                        },
                        {
                            publicKey:
                                "EOS6PxS9dD2JBwztEd9oRaydDDeN3bWXbT2eupR5ws3sgbHzsMQW3",
                            controller:
                                "49381006045822631699836847160353783849",
                        },
                        {
                            publicKey:
                                "EOS5BUmS1NQppFPL4z1qgyFc82cUzgkzkGZe1Dycv5FdbjuKy64Ru",
                            controller:
                                "49381006045822631699836847160353783849",
                        },
                    ],
                    authentication: [
                        {
                            uuid: "49381006045822631699836847160353783849",
                            index: 0,
                        },
                    ],
                    assertionMethod: [
                        {
                            uuid: "49381006045822631699836847160353783849",
                            index: 1,
                        },
                    ],
                    keyAgreement: [
                        {
                            uuid: "49381006045822631699836847160353783849",
                            index: 2,
                        },
                    ],
                    capabilityInvocation: [],
                    capabilityDelegation: [
                        {
                            uuid: "49381006045822631699836847160353783849",
                            index: 3,
                        },
                    ],
                    controller: "testusertest",
                    uuid: "49381006045822631699836847160353783849",
                    createdAt: 1613978851,
                    updatedAt: 1613978851,
                });
            })
        );
        it("Did Document를 성공적으로 불러온다.", async () => {
            await validator.transform(did);

            const ret = await identifierService.getDidDocument(did);

            console.log(ret);
        });
    });
});
