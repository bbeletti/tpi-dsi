"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PastasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const provincia_entity_1 = require("./entities/provincia.entity");
const localidad_entity_1 = require("./entities/localidad.entity");
const barrio_entity_1 = require("./entities/barrio.entity");
const unidad_medida_entity_1 = require("./entities/unidad-medida.entity");
const ingrediente_entity_1 = require("./entities/ingrediente.entity");
const producto_entity_1 = require("./entities/producto.entity");
const receta_entity_1 = require("./entities/receta.entity");
const user_entity_1 = require("./entities/user.entity");
const cliente_entity_1 = require("./entities/cliente.entity");
const venta_entity_1 = require("./entities/venta.entity");
const detalle_venta_entity_1 = require("./entities/detalle-venta.entity");
const auxiliar_controller_1 = require("./controllers/auxiliar.controller");
const clientes_controller_1 = require("./controllers/clientes.controller");
const ingredientes_controller_1 = require("./controllers/ingredientes.controller");
const productos_controller_1 = require("./controllers/productos.controller");
const ventas_controller_1 = require("./controllers/ventas.controller");
let PastasModule = class PastasModule {
};
exports.PastasModule = PastasModule;
exports.PastasModule = PastasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                provincia_entity_1.Provincia,
                localidad_entity_1.Localidad,
                barrio_entity_1.Barrio,
                unidad_medida_entity_1.UnidadMedida,
                ingrediente_entity_1.Ingrediente,
                producto_entity_1.Producto,
                receta_entity_1.Receta,
                user_entity_1.User,
                cliente_entity_1.Cliente,
                venta_entity_1.Venta,
                detalle_venta_entity_1.DetalleVenta,
            ]),
        ],
        controllers: [
            auxiliar_controller_1.AuxiliarController,
            clientes_controller_1.ClientesController,
            ingredientes_controller_1.IngredientesController,
            productos_controller_1.ProductosController,
            ventas_controller_1.VentasController,
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], PastasModule);
//# sourceMappingURL=pastas.module.js.map