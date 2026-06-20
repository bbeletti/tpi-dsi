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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientesController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const cliente_entity_1 = require("../entities/cliente.entity");
let ClientesController = class ClientesController {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async findAll() {
        return this.dataSource.getRepository(cliente_entity_1.Cliente).find({
            relations: { barrio: true, localidad: true, provincia: true, user: true },
            order: { id: 'DESC' },
        });
    }
    async findOne(id) {
        const cliente = await this.dataSource.getRepository(cliente_entity_1.Cliente).findOne({
            where: { id },
            relations: { barrio: true, localidad: true, provincia: true, user: true },
        });
        if (!cliente) {
            throw new common_1.NotFoundException(`Cliente con ID ${id} no encontrado`);
        }
        return cliente;
    }
    async create(body) {
        const repo = this.dataSource.getRepository(cliente_entity_1.Cliente);
        const cliente = new cliente_entity_1.Cliente();
        this.mapBodyToEntity(cliente, body);
        return repo.save(cliente);
    }
    async update(id, body) {
        const repo = this.dataSource.getRepository(cliente_entity_1.Cliente);
        const cliente = await repo.findOneBy({ id });
        if (!cliente) {
            throw new common_1.NotFoundException(`Cliente con ID ${id} no encontrado`);
        }
        this.mapBodyToEntity(cliente, body);
        return repo.save(cliente);
    }
    async remove(id) {
        const repo = this.dataSource.getRepository(cliente_entity_1.Cliente);
        const result = await repo.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Cliente con ID ${id} no encontrado`);
        }
        return { success: true };
    }
    mapBodyToEntity(cliente, body) {
        cliente.nombre = body.nombre;
        cliente.numero_documento = body.numero_documento ? parseInt(body.numero_documento, 10) : null;
        cliente.direccion = body.direccion || null;
        cliente.celular = body.celular ? parseInt(body.celular, 10) : null;
        cliente.telefono = body.telefono ? parseInt(body.telefono, 10) : null;
        cliente.email = body.email || null;
        if (body.barrio_id) {
            cliente.barrio = { id: body.barrio_id };
        }
        else {
            cliente.barrio = null;
        }
        if (body.localidad_id) {
            cliente.localidad = { id: body.localidad_id };
        }
        else {
            cliente.localidad = null;
        }
        if (body.provincia_id) {
            cliente.provincia = { id: body.provincia_id };
        }
        else {
            cliente.provincia = null;
        }
    }
};
exports.ClientesController = ClientesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "remove", null);
exports.ClientesController = ClientesController = __decorate([
    (0, common_1.Controller)('api/clientes'),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ClientesController);
//# sourceMappingURL=clientes.controller.js.map