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
exports.Receta = void 0;
const typeorm_1 = require("typeorm");
const producto_entity_1 = require("./producto.entity");
const ingrediente_entity_1 = require("./ingrediente.entity");
let Receta = class Receta {
    id;
    cantidad;
    ingrediente;
    producto;
};
exports.Receta = Receta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Receta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 3, default: 0, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        } }),
    __metadata("design:type", Number)
], Receta.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ingrediente_entity_1.Ingrediente, { onDelete: 'RESTRICT', nullable: false, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ingrediente_id' }),
    __metadata("design:type", ingrediente_entity_1.Ingrediente)
], Receta.prototype, "ingrediente", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producto_entity_1.Producto, (producto) => producto.recetas, { onDelete: 'RESTRICT', nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'producto_id' }),
    __metadata("design:type", producto_entity_1.Producto)
], Receta.prototype, "producto", void 0);
exports.Receta = Receta = __decorate([
    (0, typeorm_1.Entity)('pastas_receta')
], Receta);
//# sourceMappingURL=receta.entity.js.map