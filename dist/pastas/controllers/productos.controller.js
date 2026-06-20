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
exports.ProductosController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const producto_entity_1 = require("../entities/producto.entity");
const receta_entity_1 = require("../entities/receta.entity");
let ProductosController = class ProductosController {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async findAll() {
        const productos = await this.dataSource.getRepository(producto_entity_1.Producto).find({
            relations: { recetas: { ingrediente: { unidad_medida: true } } },
            order: { id: 'DESC' },
        });
        return productos.map(p => this.mapEntityToDto(p));
    }
    async findOne(id) {
        const producto = await this.dataSource.getRepository(producto_entity_1.Producto).findOne({
            where: { id },
            relations: { recetas: { ingrediente: { unidad_medida: true } } },
        });
        if (!producto) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        return this.mapEntityToDto(producto);
    }
    async create(body) {
        const repo = this.dataSource.getRepository(producto_entity_1.Producto);
        const producto = new producto_entity_1.Producto();
        producto.nombre = body.nombre;
        producto.ganancia = parseFloat(body.ganancia) || 0;
        producto.es_relleno = !!body.es_relleno;
        const savedProducto = await repo.save(producto);
        if (body.recetas && Array.isArray(body.recetas)) {
            const recetas = body.recetas.map((r) => {
                const receta = new receta_entity_1.Receta();
                receta.cantidad = parseFloat(r.cantidad) || 0;
                receta.ingrediente = { id: r.ingrediente_id };
                receta.producto = savedProducto;
                return receta;
            });
            await this.dataSource.getRepository(receta_entity_1.Receta).save(recetas);
        }
        return this.findOne(savedProducto.id);
    }
    async update(id, body) {
        const repo = this.dataSource.getRepository(producto_entity_1.Producto);
        const producto = await repo.findOneBy({ id });
        if (!producto) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        producto.nombre = body.nombre;
        producto.ganancia = parseFloat(body.ganancia) || 0;
        producto.es_relleno = !!body.es_relleno;
        const savedProducto = await repo.save(producto);
        await this.dataSource.getRepository(receta_entity_1.Receta).delete({ producto: { id } });
        if (body.recetas && Array.isArray(body.recetas)) {
            const recetas = body.recetas.map((r) => {
                const receta = new receta_entity_1.Receta();
                receta.cantidad = parseFloat(r.cantidad) || 0;
                receta.ingrediente = { id: r.ingrediente_id };
                receta.producto = savedProducto;
                return receta;
            });
            await this.dataSource.getRepository(receta_entity_1.Receta).save(recetas);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const repo = this.dataSource.getRepository(producto_entity_1.Producto);
        const producto = await repo.findOneBy({ id });
        if (!producto) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        await this.dataSource.getRepository(receta_entity_1.Receta).delete({ producto: { id } });
        await repo.delete(id);
        return { success: true };
    }
    mapEntityToDto(p) {
        return {
            id: p.id,
            nombre: p.nombre,
            ganancia: p.ganancia,
            es_relleno: p.es_relleno,
            precio: p.precio,
            recetas: (p.recetas || []).map(r => ({
                id: r.id,
                cantidad: r.cantidad,
                ingrediente_id: r.ingrediente?.id,
                ingrediente: r.ingrediente ? {
                    id: r.ingrediente.id,
                    nombre: r.ingrediente.nombre,
                    costo: r.ingrediente.costo,
                    unidad_medida: r.ingrediente.unidad_medida?.nombre,
                } : null,
            })),
        };
    }
};
exports.ProductosController = ProductosController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "remove", null);
exports.ProductosController = ProductosController = __decorate([
    (0, common_1.Controller)('api/productos'),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ProductosController);
//# sourceMappingURL=productos.controller.js.map