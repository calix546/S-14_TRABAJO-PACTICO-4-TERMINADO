// Vector listado de productos.
// productos [ [producto1], [producto2], [producto3], ..N ]
const productos = [
    //cod  , precio , descripcion
    //[0]    [1]   [2]
    ["0001", 3500, "Sistema Web Personalizado"],
    ["0002", 500, "Computador Core I7"],
    ["0003", 200, "Monitor LG 20 pulgadas"],
    ["0004", 300, "Telefono Celular Samsung"],
    ["0005", 200, "Camara profesional Web."],
    ["0006", 150, "Servicio de Mantenimiento Anual"],
    ["0007", 100, "Servicio de Hosting Web (1 año)"],
    ["0008", 250, "Licencia Software Antivirus (1 año)"],
    ["0009", 400, "Impresora Multifuncional HP"],
    ["0010", 120, "Router Inalámbrico TP-Link"],
    ["0011", 180, "Teclado Mecánico RGB"],
    ["0012", 90, "Mouse Óptico USB"],
    ["0013", 75, "Audífonos con Micrófono"],
    ["0014", 60, "Disco Duro Externo 1TB"],
    ["0015", 45, "Memoria USB 64GB"],
    ["0016", 250, "Tablet Android 10 pulgadas"],
    ["0017", 300, "Smartwatch Deportivo"],
    ["0018", 400, "Proyector Multimedia HD"],
    ["0019", 150, "Cámara de Seguridad IP"],
    ["0020", 80, "Soporte para Laptop Ajustable"]
]
// Vector para guardar los detalles de la factura
// Cada elemento es a su vez un vector (arreglo) con la forma:
// [ codigo, descripcion, cantidad, precioUnitario, total ]
//     [0]       [1]         [2]         [3]          [4]
const facturaDetalles = []

// Valor fijo de descuento que pide el caso de estudio ($150.00)
const DESCUENTO_FIJO = 150.00
// Porcentaje de IVA que pide el caso de estudio (15%)
const PORCENTAJE_IVA = 0.15

// Referencias a los controles del formulario (Select, Input, Button, Table etc.)
const selectProducto = document.getElementById('id-select-producto')
const txtCantidad = document.getElementById('id-txt-cantidad')
const txtPrecio = document.getElementById('id-txt-precio')
const txtTotal = document.getElementById('id-txt-total')
const btnAgregar = document.getElementById('id-btn-agregar')
const tablaDetalle = document.querySelector('#id-table-detalle tbody')

// Referencias a las cajas de texto de totales
const txtSubtotal = document.getElementById('id-txt-subtotal')
const txtIva = document.getElementById('id-txt-iva')
const txtDescuento = document.getElementById('id-txt-descuento')
const txtTotalPagar = document.getElementById('id-txt-total-pagar')

// Al cargar el script, se llena el <select> de productos con las opciones
// del vector "productos" (se ejecuta una sola vez, al inicio).
cargarProductos()

// Se pinta el descuento fijo apenas carga la página (aunque no haya productos,
// el descuento siempre es $150.00 según las reglas del caso).
txtDescuento.value = "$" + DESCUENTO_FIJO.toFixed(2)

// ============================================================
// EVENTOS DEL FORMULARIO
// ============================================================

// EVENTO: cambio de selección en el combo de productos (id-select-producto)
// Se dispara cuando el usuario elige un producto distinto en la lista desplegable.
// Toma el precio del producto seleccionado (guardado en option.value),
// lo multiplica por la cantidad actual y actualiza los campos de precio y total.
selectProducto.addEventListener("change", function (e) {
    const precio = parseFloat(e.target.value)
    const cantidad = parseFloat(txtCantidad.value)
    const total = cantidad * precio

    //Formateamos los valores a 2 decimales
    txtPrecio.value = Number(precio).toFixed(2)
    txtTotal.value = Number(total).toFixed(2)
})

// EVENTO: cambio de valor en el campo de cantidad (id-txt-cantidad)
// Se dispara cuando el usuario modifica la cantidad del producto.
// Recalcula el total multiplicando la nueva cantidad por el precio ya mostrado.
txtCantidad.addEventListener("change", function (e) {
    const cantidad = parseFloat(e.target.value)
    const precio = parseFloat(txtPrecio.value)
    const total = cantidad * precio
    txtTotal.value = Number(total).toFixed(2)
})

// EVENTO: clic en el botón "+ Agregar" (id-btn-agregar)
// Se dispara cuando el usuario quiere añadir el producto seleccionado
// (con su cantidad, precio y total) al detalle de la factura.
// - Valida que se haya seleccionado un producto real (no la opción "--Seleccione--").
// - Valida que la cantidad sea 1 o mayor.
// - Si el producto ya existe en el detalle, suma la cantidad y recalcula su total.
// - Si no existe, lo agrega como una nueva fila/ítem al arreglo facturaDetalles.
// - Al final, siempre vuelve a dibujar la tabla y recalcula los totales de la
//   factura, para que todo se actualice en tiempo real.
btnAgregar.addEventListener("click", function (e) {
    //Extraer datos del producto seleccionado desde la lista desplegable
    const codigo = selectProducto.options[selectProducto.selectedIndex].dataset.codigo
    const descripcion = selectProducto.options[selectProducto.selectedIndex].textContent

    // VALIDACIÓN 1: debe haber un producto seleccionado.
    // La opción "--Seleccione--" no tiene dataset.codigo, por eso queda undefined.
    if (!codigo) {
        alert("Seleccione un producto valido!")
        return
    }

    const cantidad = parseFloat(txtCantidad.value)
    const precio = parseFloat(txtPrecio.value)

    // VALIDACIÓN 2: la cantidad no puede ser menor a 1 (ni vacía / no numérica).
    if (isNaN(cantidad) || cantidad < 1) {
        alert("La cantidad debe ser 1 o mayor!")
        return
    }

    const total = cantidad * precio

    const indice = existeProducto(codigo)
    if (indice != -1) {
        // Actualizamos cantidad = cantidad anterior + nueva cantidad
        facturaDetalles[indice][2] = facturaDetalles[indice][2] + cantidad
        // Actualizamos total = nueva cantidad total * precio unitario
        facturaDetalles[indice][4] = facturaDetalles[indice][2] * facturaDetalles[indice][3]
    }
    else {
        const item = [
            codigo,
            descripcion,
            cantidad,
            precio,
            total
        ]
        facturaDetalles.push(item)
    }

    // Volvemos a pintar la tabla de detalle y recalculamos los totales de la factura.
    renderizarTabla()
    calcularTotales()

    // Mostramos en consola el producto que se acaba de seleccionar/agregar,
    // y cómo queda el arreglo completo facturaDetalles después del cambio.
    console.log("Producto seleccionado:", [codigo, descripcion, cantidad, precio, total])
    console.log("facturaDetalles:", facturaDetalles)

    // Reiniciamos el formulario para que quede listo para agregar el siguiente producto.
    selectProducto.selectedIndex = 0
    txtCantidad.value = 1
    txtPrecio.value = "0.00"
    txtTotal.value = "0.00"
})

// ============================================================
// FUNCIONES
// ============================================================

/**
 * FUNCIÓN: existeProducto
 * Busca dentro del arreglo facturaDetalles si ya existe un producto
 * con el código indicado.
 * @param {string} codigo - Código del producto a buscar.
 * @returns {number} El índice (posición) del producto dentro de facturaDetalles
 *                   si ya fue agregado antes, o -1 si todavía no existe.
 */
function existeProducto(codigo) {
    for (let i in facturaDetalles) {
        const codigoDt = facturaDetalles[i][0]
        if (codigo == codigoDt) {
            return i
        }
    }
    return -1
}

/**
 * FUNCIÓN: cargarProductos
 * Recorre el vector "productos" y, por cada producto, crea dinámicamente
 * un elemento <option> (con el precio como value y el código como dataset),
 * agregándolo al <select> de productos (selectProducto) para que el usuario
 * pueda elegirlo en el formulario.
 */
function cargarProductos() {
    for (let i in productos) {
        const codigo = productos[i][0]
        const precio = productos[i][1]
        const descripcion = productos[i][2]

        const option = document.createElement("option")
        option.value = precio
        option.dataset.codigo = codigo
        option.textContent = descripcion

        selectProducto.appendChild(option)
    }
}

/**
 * FUNCIÓN: renderizarTabla
 * Dibuja (o vuelve a dibujar) el <tbody> de la tabla de detalle
 * (id-table-detalle) a partir del contenido actual del vector facturaDetalles.
 *
 * - Si facturaDetalles está vacío, muestra el mensaje
 *   "No hay productos en la factura" (igual que el HTML original).
 * - Si tiene productos, crea una fila <tr> por cada ítem, con sus columnas
 *   (código, descripción, precio unitario, cantidad, total) y un botón "✕"
 *   para eliminar esa fila.
 *
 * Se llama cada vez que se agrega o elimina un producto, para que la tabla
 * quede sincronizada en tiempo real con el vector de datos.
 */
function renderizarTabla() {
    // Limpiamos el contenido actual del cuerpo de la tabla.
    tablaDetalle.innerHTML = ""

    // Caso: no hay productos agregados todavía.
    if (facturaDetalles.length === 0) {
        const fila = document.createElement("tr")
        fila.innerHTML = `<td colspan="6" style="text-align-last: center;">No hay productos en la factura</td>`
        tablaDetalle.appendChild(fila)
        return
    }

    // Recorremos cada item del detalle de la factura y creamos su fila.
    for (let i in facturaDetalles) {
        const codigo = facturaDetalles[i][0]
        const descripcion = facturaDetalles[i][1]
        const cantidad = facturaDetalles[i][2]
        const precio = facturaDetalles[i][3]
        const total = facturaDetalles[i][4]

        const fila = document.createElement("tr")
        fila.innerHTML = `
            <td>${codigo}</td>
            <td>${descripcion}</td>
            <td>$${Number(precio).toFixed(2)}</td>
            <td>${cantidad}</td>
            <td>$${Number(total).toFixed(2)}</td>
            <td><button class="btn-remove" data-codigo="${codigo}">✕</button></td>
        `
        tablaDetalle.appendChild(fila)
    }

    // BOTÓN "✕" (btn-remove) de cada fila: se crea dinámicamente arriba,
    // por eso su evento click se asigna aquí, después de insertarlo en el DOM.
    // Al hacer clic, elimina ese producto del vector facturaDetalles y
    // vuelve a dibujar la tabla y los totales.
    const botonesEliminar = tablaDetalle.querySelectorAll(".btn-remove")
    botonesEliminar.forEach(function (boton) {
        boton.addEventListener("click", function (e) {
            const codigo = e.target.dataset.codigo
            eliminarProducto(codigo)
        })
    })
}

/**
 * FUNCIÓN: eliminarProducto
 * Elimina del vector facturaDetalles el producto cuyo código coincide
 * con el recibido por parámetro (se activa desde el botón "✕" de cada fila).
 * Luego vuelve a dibujar la tabla y recalcula los totales, para que la
 * factura quede actualizada en tiempo real.
 * @param {string} codigo - Código del producto que se desea eliminar.
 */
function eliminarProducto(codigo) {
    const indice = existeProducto(codigo)
    if (indice != -1) {
        facturaDetalles.splice(indice, 1)
    }
    renderizarTabla()
    calcularTotales()

    // Mostramos en consola cómo queda facturaDetalles después de eliminar.
    console.log("Producto eliminado, código:", codigo)
    console.log("facturaDetalles:", facturaDetalles)
}

/**
 * FUNCIÓN: calcularTotales
 * Recorre el vector facturaDetalles y calcula:
 * - Subtotal: suma de los totales de cada producto agregado.
 * - IVA: 15% del subtotal.
 * - Descuento: valor fijo de $150.00 (regla del caso de estudio).
 * - Total a pagar: subtotal + IVA - descuento.
 * Finalmente, actualiza los textos en pantalla (id-txt-subtotal, id-txt-iva,
 * id-txt-descuento, id-txt-total-pagar) para reflejar los nuevos valores.
 */
function calcularTotales() {
    let subtotal = 0
    for (let i in facturaDetalles) {
        subtotal += facturaDetalles[i][4]
    }

    const iva = subtotal * PORCENTAJE_IVA
    const descuento = DESCUENTO_FIJO
    const totalPagar = subtotal + iva - descuento

    txtSubtotal.textContent = "$" + subtotal.toFixed(2)
    txtIva.textContent = "$" + iva.toFixed(2)
    txtDescuento.textContent = "$" + descuento.toFixed(2)
    txtTotalPagar.textContent = "$" + totalPagar.toFixed(2)
}