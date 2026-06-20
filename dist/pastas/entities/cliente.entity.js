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
exports.Cliente = void 0;
const typeorm_1 = require("typeorm");
const base_nombre_entity_1 = require("./base-nombre.entity");
const barrio_entity_1 = require("./barrio.entity");
const localidad_entity_1 = require("./localidad.entity");
const provincia_entity_1 = require("./provincia.entity");
const user_entity_1 = require("./user.entity");
let Cliente = class Cliente extends base_nombre_entity_1.BaseNombre {
    numero_documento;
    direccion;
    celular;
    telefono;
    email;
    barrio;
    localidad;
    provincia;
    user;
};
exports.Cliente = Cliente;
__decorate([
    (0, typeorm_1.Column)('bigint', { name: 'numero_documento', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value ? parseInt(value, 10) : null,
        } }),
    __metadata("design:type", Number)
], Cliente.prototype, "numero_documento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Cliente.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value ? parseInt(value, 10) : null,
        } }),
    __metadata("design:type", Number)
], Cliente.prototype, "celular", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value ? parseInt(value, 10) : null,
        } }),
    __metadata("design:type", Number)
], Cliente.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 254, nullable: true }),
    __metadata("design:type", String)
], Cliente.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => barrio_entity_1.Barrio, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'barrio_id' }),
    __metadata("design:type", barrio_entity_1.Barrio)
], Cliente.prototype, "barrio", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => localidad_entity_1.Localidad, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'localidad_id' }),
    __metadata("design:type", localidad_entity_1.Localidad)
], Cliente.prototype, "localidad", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => provincia_entity_1.Provincia, { onDelete: 'RESTRICT', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'provincia_id' }),
    __metadata("design:type", provincia_entity_1.Provincia)
], Cliente.prototype, "provincia", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'RESTRICT', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Cliente.prototype, "user", void 0);
exports.Cliente = Cliente = __decorate([
    (0, typeorm_1.Entity)('pastas_cliente'),
    (0, typeorm_1.Index)('pastas_cliente_unico', ['numero_documento', 'user'])
], Cliente);
//# sourceMappingURL=cliente.entity.js.map