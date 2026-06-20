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
exports.Ingrediente = void 0;
const typeorm_1 = require("typeorm");
const base_nombre_entity_1 = require("./base-nombre.entity");
const unidad_medida_entity_1 = require("./unidad-medida.entity");
let Ingrediente = class Ingrediente extends base_nombre_entity_1.BaseNombre {
    costo;
    unidad_medida;
};
exports.Ingrediente = Ingrediente;
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        } }),
    __metadata("design:type", Number)
], Ingrediente.prototype, "costo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => unidad_medida_entity_1.UnidadMedida, { onDelete: 'RESTRICT', nullable: false, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'unidad_medida_id' }),
    __metadata("design:type", unidad_medida_entity_1.UnidadMedida)
], Ingrediente.prototype, "unidad_medida", void 0);
exports.Ingrediente = Ingrediente = __decorate([
    (0, typeorm_1.Entity)('pastas_ingrediente')
], Ingrediente);
//# sourceMappingURL=ingrediente.entity.js.map