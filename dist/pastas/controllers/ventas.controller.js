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
exports.VentasController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const venta_entity_1 = require("../entities/venta.entity");
const detalle_venta_entity_1 = require("../entities/detalle-venta.entity");
let VentasController = class VentasController {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async findAll() {
        const ventas = await this.dataSource.getRepository(venta_entity_1.Venta).find({
            relations: {
                cliente: true,
                detalle: {
                    producto: {
                        recetas: {
                            ingrediente: true
                        }
                    }
                }
            },
            order: { id: 'DESC' },
        });
        return ventas.map(v => this.mapEntityToDto(v));
    }
    async findOne(id) {
        const venta = await this.dataSource.getRepository(venta_entity_1.Venta).findOne({
            where: { id },
            relations: {
                cliente: true,
                detalle: {
                    producto: {
                        recetas: {
                            ingrediente: true
                        }
                    }
                }
            },
        });
        if (!venta) {
            throw new common_1.NotFoundException(`Venta con ID ${id} no encontrada`);
        }
        return this.mapEntityToDto(venta);
    }
    async create(body) {
        const repoVenta = this.dataSource.getRepository(venta_entity_1.Venta);
        const repoDetalle = this.dataSource.getRepository(detalle_venta_entity_1.DetalleVenta);
        const venta = new venta_entity_1.Venta();
        venta.fecha = body.fecha;
        venta.cliente = { id: body.cliente_id };
        const savedVenta = await repoVenta.save(venta);
        if (body.detalle && Array.isArray(body.detalle)) {
            const detalles = body.detalle.map((d) => {
                const detalle = new detalle_venta_entity_1.DetalleVenta();
                detalle.venta = savedVenta;
                detalle.producto = { id: d.producto_id };
                detalle.cantidad = parseFloat(d.cantidad) || 0;
                return detalle;
            });
            await repoDetalle.save(detalles);
        }
        return this.findOne(savedVenta.id);
    }
    async remove(id) {
        const repoVenta = this.dataSource.getRepository(venta_entity_1.Venta);
        const repoDetalle = this.dataSource.getRepository(detalle_venta_entity_1.DetalleVenta);
        const venta = await repoVenta.findOneBy({ id });
        if (!venta) {
            throw new common_1.NotFoundException(`Venta con ID ${id} no encontrada`);
        }
        await repoDetalle.delete({ venta: { id } });
        await repoVenta.delete(id);
        return { success: true };
    }
    mapEntityToDto(v) {
        let totalVenta = 0;
        const detallesMapped = (v.detalle || []).map(d => {
            const precioUnitario = d.producto?.precio ?? 0;
            const subtotal = (d.cantidad ?? 0) * precioUnitario;
            totalVenta += subtotal;
            return {
                id: d.id,
                cantidad: d.cantidad,
                producto_id: d.producto?.id,
                producto_nombre: d.producto?.nombre,
                precio_unitario: precioUnitario,
                subtotal: Math.round(subtotal * 100) / 100,
            };
        });
        return {
            id: v.id,
            fecha: v.fecha,
            cliente: v.cliente ? {
                id: v.cliente.id,
                nombre: v.cliente.nombre,
            } : null,
            detalle: detallesMapped,
            total: Math.round(totalVenta * 100) / 100,
        };
    }
};
exports.VentasController = VentasController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "remove", null);
exports.VentasController = VentasController = __decorate([
    (0, common_1.Controller)('api/ventas'),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], VentasController);
//# sourceMappingURL=ventas.controller.js.map