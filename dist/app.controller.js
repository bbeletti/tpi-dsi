"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const typeorm_1 = require("typeorm");
const bolsin_entity_1 = require("./bolsin/entities/bolsin.entity");
let AppController = class AppController {
    appService;
    dataSource;
    constructor(appService, dataSource) {
        this.appService = appService;
        this.dataSource = dataSource;
    }
    getHello() {
        return this.appService.getHello();
    }
    async getBolsinesTest() {
        const bolsinRepo = this.dataSource.getRepository(bolsin_entity_1.Bolsin);
        const bolsines = await bolsinRepo.find();
        return bolsines.map((b) => {
            return {
                id: b.id,
                numeroBolsin: b.obtenerNumeroBolsin(),
                numeroPrecinto: b.obtenerNroPrecinto(),
                peso: b.peso,
                fechaCreacion: b.fechaCreacion,
                esTuCMOrigenDeOrigen: b.esTuCMOrigen(b.origen),
                esTuCMOrigenDeDestino: b.esTuCMOrigen(b.destino),
                cmDestinoNombre: b.obtenerCMDestino()?.obtenerNombre(),
                sosEnviado: b.sosEnviado(),
            };
        });
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('bolsines-test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getBolsinesTest", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        typeorm_1.DataSource])
], AppController);
//# sourceMappingURL=app.controller.js.map