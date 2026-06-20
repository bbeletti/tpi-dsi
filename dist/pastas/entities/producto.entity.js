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
exports.Producto = void 0;
const typeorm_1 = require("typeorm");
const base_nombre_entity_1 = require("./base-nombre.entity");
const receta_entity_1 = require("./receta.entity");
let Producto = class Producto extends base_nombre_entity_1.BaseNombre {
    ganancia;
    es_relleno;
    recetas;
    get precio() {
        if (!this.recetas)
            return 0;
        const total = this.recetas.reduce((sum, receta) => {
            const recetaCosto = receta.ingrediente?.costo ?? 0;
            return sum + (receta.cantidad * recetaCosto);
        }, 0);
        return Math.round(total * this.ganancia * 100) / 100;
    }
};
exports.Producto = Producto;
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        } }),
    __metadata("design:type", Number)
], Producto.prototype, "ganancia", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Producto.prototype, "es_relleno", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => receta_entity_1.Receta, (receta) => receta.producto, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], Producto.prototype, "recetas", void 0);
exports.Producto = Producto = __decorate([
    (0, typeorm_1.Entity)('pastas_producto')
], Producto);
//# sourceMappingURL=producto.entity.js.map