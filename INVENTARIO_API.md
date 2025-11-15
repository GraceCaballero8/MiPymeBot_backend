# 📦 API de Inventario - Documentación

## 🎯 Resumen del Sistema

Este sistema implementa un **Kardex** (sistema de control de inventario) que evita condiciones de carrera mediante un modelo de **eventos inmutables**.

### 🔑 Concepto Clave: El Kardex

**En lugar de editar un stock actual**, cada movimiento (ingreso o egreso) se registra como una **fila inmutable** en la tabla `inventory_movements`.

El **stock actual NO se guarda**, se **CALCULA** cuando se necesita:

```
Stock Actual = SUM(Ingresos) - SUM(Egresos)
```

**Ventajas:**

- ✅ Sin condiciones de carrera (Race Conditions)
- ✅ Auditoría completa (historial inmutable)
- ✅ Escalable para múltiples usuarios concurrentes

---

## 📋 Endpoints Disponibles

### 1️⃣ Gestión de Productos (Catálogo)

#### **POST** `/products` - Registrar Nuevo Producto

Crea un nuevo producto en el catálogo de la compañía.

**Headers:**

```
Authorization: Bearer <token>
```

**Body:**

```json
{
  "sku": "PT0002",
  "name": "POLO BASICO TALLA M",
  "unit_id": 1,
  "group_id": 2,
  "min_stock": 50,
  "price": 25.5
}
```

**Respuesta Exitosa (201):**

```json
{
  "id": 3,
  "sku": "PT0002",
  "name": "POLO BASICO TALLA M",
  "slug": "polo-basico-talla-m-pt0002",
  "price": "25.50",
  "min_stock": 50,
  "unit_id": 1,
  "group_id": 2,
  "user_id": 5,
  "company_id": 1,
  "created_at": "2025-03-09T10:00:00.000Z",
  "updated_at": "2025-03-09T10:00:00.000Z",
  "unit": {
    "abbreviation": "UND"
  },
  "group": {
    "name": "Producto Terminado"
  }
}
```

**Errores:**

- `400` - El SKU ya existe en la compañía
- `404` - La unidad o grupo no existe

---

#### **GET** `/products/search?term=PT` - Buscar Productos (Autocomplete)

Busca productos por SKU o nombre. Usado para el autocompletado en "Registro de Movimientos".

**Headers:**

```
Authorization: Bearer <token>
```

**Query Params:**

- `term` (string): Término de búsqueda (SKU o nombre)

**Ejemplo:**

```
GET /products/search?term=POLO
```

**Respuesta Exitosa (200):**

```json
[
  {
    "id": 3,
    "sku": "PT0002",
    "name": "POLO BASICO TALLA M",
    "unit": {
      "abbreviation": "UND"
    }
  },
  {
    "id": 1,
    "sku": "PT0001",
    "name": "POLO CUELLO CAMISA",
    "unit": {
      "abbreviation": "UND"
    }
  }
]
```

---

### 2️⃣ Registro de Movimientos (Kardex)

#### **POST** `/inventory/movements` - Registrar Movimiento

Registra un movimiento de inventario (INGRESO o EGRESO).

**Headers:**

```
Authorization: Bearer <token>
```

**Body:**

```json
{
  "product_code": "PT0002",
  "type": "INGRESO",
  "quantity": 100,
  "movement_date": "2025-03-09T14:30:00.000Z",
  "observations": "Compra a proveedor XYZ"
}
```

**Campos:**

- `product_code`: SKU del producto
- `type`: `"INGRESO"` o `"EGRESO"`
- `quantity`: Cantidad (siempre positiva)
- `movement_date`: Fecha en formato ISO
- `observations`: Comentarios opcionales

**Respuesta Exitosa (201):**

```json
{
  "id": 15,
  "product_id": 3,
  "type": "INGRESO",
  "quantity": 100,
  "movement_date": "2025-03-09T14:30:00.000Z",
  "observations": "Compra a proveedor XYZ",
  "user_id": 5,
  "company_id": 1,
  "created_at": "2025-03-09T14:35:00.000Z",
  "product": {
    "sku": "PT0002",
    "name": "POLO BASICO TALLA M"
  },
  "message": "Ingreso de 100 unidades registrado exitosamente"
}
```

**Errores:**

- `404` - El producto no existe en el catálogo

---

### 3️⃣ Control de Inventario

#### **GET** `/inventory/status` - Estado Actual del Inventario

Obtiene todos los productos de la compañía con su **stock actual CALCULADO**.

**Headers:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**

```json
[
  {
    "codigo": "MP0002",
    "nombre": "HILO COLOR BLANCO",
    "unidad": "UND",
    "grupo": "Materia Prima",
    "stock_minimo": 10,
    "stock_actual": 0,
    "estado": "Sin Stock"
  },
  {
    "codigo": "PT0002",
    "nombre": "POLO BASICO TALLA M",
    "unidad": "UND",
    "grupo": "Producto Terminado",
    "stock_minimo": 50,
    "stock_actual": 0,
    "estado": "Sin Stock"
  },
  {
    "codigo": "PT0001",
    "nombre": "POLO CUELLO CAMISA",
    "unidad": "UND",
    "grupo": "Producto Terminado",
    "stock_minimo": 10,
    "stock_actual": 10,
    "estado": "Stock Bajo"
  }
]
```

**Estados:**

- `"Sin Stock"` - stock_actual = 0
- `"Stock Bajo"` - stock_actual <= stock_minimo
- `"Stock OK"` - stock_actual > stock_minimo

**🔥 MAGIA DEL KARDEX:**
El `stock_actual` **NO está guardado en ninguna tabla**. Se calcula en tiempo real:

```typescript
const totalIngresos = SUM(movements WHERE type='INGRESO')
const totalEgresos = SUM(movements WHERE type='EGRESO')
const stock_actual = totalIngresos - totalEgresos
```

---

#### **GET** `/inventory/kardex?sku=PT0002` - Kardex Completo de un Producto

Obtiene el historial completo de movimientos de un producto con saldo acumulado.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Params:**

- `sku` (string): Código del producto

**Respuesta Exitosa (200):**

```json
{
  "producto": {
    "sku": "PT0002",
    "nombre": "POLO BASICO TALLA M"
  },
  "kardex": [
    {
      "fecha": "2025-03-09T10:00:00.000Z",
      "tipo": "INGRESO",
      "cantidad": 100,
      "saldo": 100,
      "observaciones": "Compra inicial",
      "registrado_por": "Juan Pérez"
    },
    {
      "fecha": "2025-03-09T14:30:00.000Z",
      "tipo": "EGRESO",
      "cantidad": 2,
      "saldo": 98,
      "observaciones": "Venta a Cliente A",
      "registrado_por": "María García"
    },
    {
      "fecha": "2025-03-09T15:00:00.000Z",
      "tipo": "EGRESO",
      "cantidad": 7,
      "saldo": 91,
      "observaciones": "Venta a Cliente B",
      "registrado_por": "María García"
    }
  ]
}
```

---

## 🎬 Flujo de Trabajo Completo

### Escenario: "Registro de Movimientos" (Imagen 3)

1. **Usuario selecciona producto** usando el autocompletado:

   ```
   GET /products/search?term=PT
   ```

2. **Usuario completa el formulario:**
   - Código: `PT0002` (autocompletado)
   - Fecha: `03/09/2025`
   - Tipo: `INGRESO`
   - Cantidad: `100`
   - Observaciones: `Compra a proveedor XYZ`

3. **Usuario presiona "Guardar Movimiento":**

   ```json
   POST /inventory/movements
   {
     "product_code": "PT0002",
     "type": "INGRESO",
     "quantity": 100,
     "movement_date": "2025-03-09T00:00:00.000Z",
     "observations": "Compra a proveedor XYZ"
   }
   ```

4. **Sistema inserta fila en `inventory_movements`** (NO edita nada).

---

### Escenario: "Control de Inventario" (Imagen 2)

1. **Usuario abre la pantalla:**

   ```
   GET /inventory/status
   ```

2. **Sistema calcula el stock** de CADA producto:

   ```typescript
   for (producto in productos) {
     ingresos = SUM(movements WHERE product_id=X AND type='INGRESO')
     egresos = SUM(movements WHERE product_id=X AND type='EGRESO')
     stock_actual = ingresos - egresos
   }
   ```

3. **Sistema determina el estado:**
   - Si `stock_actual == 0` → ❌ "Sin Stock" (fondo rojo)
   - Si `stock_actual <= min_stock` → ⚠️ "Stock Bajo" (fondo amarillo)
   - Si `stock_actual > min_stock` → ✅ "Stock OK" (fondo verde)

---

## 🔐 Seguridad

- ✅ Todos los endpoints requieren autenticación (`@Auth()`)
- ✅ Los usuarios solo ven datos de su `company_id`
- ✅ El `user.id` se registra en cada movimiento para auditoría

---

## 🚀 Próximos Pasos

Para probar los endpoints necesitas:

1. **Correr las migraciones:**

   ```bash
   npx prisma migrate dev
   ```

2. **Poblar datos iniciales (Seed):**
   - Crear grupos de productos (Materia Prima, Producto Terminado)
   - Crear unidades de medida (Unidades, Kilos, Litros)

3. **Autenticarte:**

   ```
   POST /auth/login
   ```

4. **Usar el token en los headers:**
   ```
   Authorization: Bearer <tu_token>
   ```

---

## 🎓 Conceptos Clave

### ¿Por qué NO guardar el stock en una columna?

**Problema:** Condición de Carrera

```typescript
// ❌ FORMA INCORRECTA (con una columna stock_actual)
// Proceso A: Lee stock = 10
// Proceso B: Lee stock = 10
// Proceso A: Calcula nuevo_stock = 10 - 2 = 8
// Proceso B: Calcula nuevo_stock = 10 - 7 = 3
// Proceso A: Escribe stock_actual = 8
// Proceso B: Escribe stock_actual = 3 (¡gana el último!)
// Resultado: Vendiste 9 pero tu base dice 3 😱
```

**Solución:** Kardex (Eventos Inmutables)

```typescript
// ✅ FORMA CORRECTA (con tabla de movimientos)
// Proceso A: INSERTA [EGRESO, 2, user_id: 123]
// Proceso B: INSERTA [EGRESO, 7, user_id: 456]
// Stock Actual = SUM(Ingresos) - SUM(Egresos) = 100 - 2 - 7 = 91 ✅
```

### Ventajas del Kardex

1. **Sin Conflictos:** Múltiples usuarios pueden insertar movimientos simultáneamente.
2. **Auditoría Completa:** Sabes quién, cuándo y por qué cambió el stock.
3. **Trazabilidad:** Puedes reconstruir el stock en cualquier fecha pasada.
4. **Escalabilidad:** La base de datos está diseñada para millones de inserciones.

---

¡Tu sistema de inventario está listo! 🎉
