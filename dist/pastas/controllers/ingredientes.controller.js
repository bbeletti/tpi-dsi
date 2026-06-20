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
exports.IngredientesController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const ingrediente_entity_1 = require("../entities/ingrediente.entity");
let IngredientesController = class IngredientesController {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async findAll() {
        return this.dataSource.getRepository(ingrediente_entity_1.Ingrediente).find({
            relations: { unidad_medida: true },
            order: { id: 'DESC' },
        });
    }
    async findOne(id) {
        const ingrediente = await this.dataSource.getRepository(ingrediente_entity_1.Ingrediente).findOne({
            where: { id },
            relations: { unidad_medida: true },
        });
        if (!ingrediente) {
            throw new common_1.NotFoundException(`Ingrediente con ID ${id} no encontrado`);
        }
        return ingrediente;
    }
    async create(body) {
        const repo = this.dataSource.getRepository(ingrediente_entity_1.Ingrediente);
        const ingrediente = new ingrediente_entity_1.Ingrediente();
        this.mapBodyToEntity(ingrediente, body);
        return repo.save(ingrediente);
    }
    async update(id, body) {
        const repo = this.dataSource.getRepository(ingrediente_entity_1.Ingrediente);
        const ingrediente = await repo.findOneBy({ id });
        if (!ingrediente) {
            throw new common_1.NotFoundException(`Ingrediente con ID ${id} no encontrado`);
        }
        this.mapBodyToEntity(ingrediente, body);
        return repo.save(ingrediente);
    }
    async remove(id) {
        const repo = this.dataSource.getRepository(ingrediente_entity_1.Ingrediente);
        const result = await repo.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Ingrediente con ID ${id} no encontrado`);
        }
        return { success: true };
    }
    mapBodyToEntity(ingrediente, body) {
        ingrediente.nombre = body.nombre;
        ingrediente.costo = parseFloat(body.costo) || 0;
        if (body.unidad_medida_id) {
            ingrediente.unidad_medida = { id: body.unidad_medida_id };
        }
    }
};
exports.IngredientesController = IngredientesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IngredientesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IngredientesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IngredientesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], IngredientesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IngredientesController.prototype, "remove", null);
exports.IngredientesController = IngredientesController = __decorate([
    (0, common_1.Controller)('api/ingredientes'),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], IngredientesController);
//# sourceMappingURL=ingredientes.controller.js.map