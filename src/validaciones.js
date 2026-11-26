// src/validaciones.js
// Reglas de validación del formulario (documento de validación del grupo).
// Cada función recibe el valor y devuelve:
//   - un texto con el error, si está mal
//   - '' (texto vacío), si está bien
// Están separadas de la pantalla para poder reutilizarlas (por ejemplo, en Login).

// Letras (con acentos y diéresis), ñ y espacios. Nada de números ni símbolos.
const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ ]+$/;

// algo@algo.algo  → sin espacios, con una @ y un dominio con punto.
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MENSAJES = {
  obligatorio: 'Este campo es obligatorio',
  soloLetras: 'Este campo solo puede contener letras y espacios',
  correo: 'Por favor, ingrese un formato de correo válido',
  contrasena: 'La contraseña no cumple todos los requisitos',
  noCoinciden: 'Las contraseñas no coinciden',
  coinciden: 'Las contraseñas coinciden',
  // Mensajes de Firebase (tarea 5)
  correoRegistrado: 'Este correo electrónico ya se encuentra registrado',
  sinConexion: 'No hay conexión. Revisá tu internet e intentá de nuevo.',
  errorGeneral: 'No se pudo crear la cuenta. Intentá de nuevo en unos minutos.',
  exito: '¡Cuenta creada! Te llevamos a iniciar sesión…',
};

// Requisitos de la contraseña. Cada uno tiene:
//   texto  → lo que se muestra en la lista debajo del campo
//   cumple → función que devuelve true si la contraseña lo cumple
// La pantalla recorre esta lista para pintar cada requisito en verde.
export const REQUISITOS_CONTRASENA = [
  { texto: 'Mínimo 8 caracteres', cumple: (c) => c.length >= 8 },
  { texto: 'Una letra mayúscula', cumple: (c) => /[A-ZÑ]/.test(c) },
  { texto: 'Una letra minúscula', cumple: (c) => /[a-zñ]/.test(c) },
  { texto: 'Un número', cumple: (c) => /\d/.test(c) },
];

// Nombre y apellido usan la misma regla
export function validarNombre(valor) {
  const limpio = valor.trim(); // "  " cuenta como vacío
  if (!limpio) return MENSAJES.obligatorio;
  if (!REGEX_NOMBRE.test(limpio)) return MENSAJES.soloLetras;
  return '';
}

export function validarCorreo(valor) {
  const limpio = valor.trim();
  if (!limpio) return MENSAJES.obligatorio;
  if (!REGEX_CORREO.test(limpio)) return MENSAJES.correo;
  return '';
}

// La contraseña es válida si cumple TODOS los requisitos (.every)
export function validarContrasena(valor) {
  if (!valor) return MENSAJES.obligatorio;
  const cumpleTodos = REQUISITOS_CONTRASENA.every((r) => r.cumple(valor));
  return cumpleTodos ? '' : MENSAJES.contrasena;
}

// La confirmación necesita la contraseña original para compararla
export function validarConfirmacion(contrasena, confirmacion) {
  if (!confirmacion) return MENSAJES.obligatorio;
  if (confirmacion !== contrasena) return MENSAJES.noCoinciden;
  return '';
}

// ===========================================================================
// PRODUCTOS (formulario de agregar / editar)
// Misma idea: cada función devuelve el texto del error, o '' si está bien.
// ===========================================================================
export const MENSAJES_PRODUCTO = {
  obligatorio: MENSAJES.obligatorio,
  nombreLargo: 'El nombre puede tener hasta 60 caracteres',
  categoria: 'La categoría solo puede contener letras y espacios',
  precio: 'Ingresá un precio mayor a 0 (ej.: 4800 o 4800,50)',
  stock: 'Ingresá una cantidad entera, de 0 en adelante',
  codigoBarras: 'Solo números, de 8 a 14 dígitos',
};

// Precio: entero o con hasta 2 decimales, con punto o con coma → 4800 · 4800,5 · 4800.50
const REGEX_PRECIO = /^\d+([.,]\d{1,2})?$/;
// Stock: solo dígitos (entero, sin signo)
const REGEX_STOCK = /^\d+$/;
// Código de barras: EAN-8 a GTIN-14 → entre 8 y 14 dígitos
const REGEX_CODIGO = /^\d{8,14}$/;

// "4800,50" → 4800.5  (en Argentina se escribe con coma; JavaScript usa punto)
export const textoANumero = (texto) => Number(texto.trim().replace(',', '.'));

export function validarNombreProducto(valor) {
  const limpio = valor.trim();
  if (!limpio) return MENSAJES_PRODUCTO.obligatorio;
  if (limpio.length > 60) return MENSAJES_PRODUCTO.nombreLargo;
  return '';
}

// Reusa la regla de nombre y apellido: letras (con tildes), ñ y espacios
export function validarCategoria(valor) {
  const limpio = valor.trim();
  if (!limpio) return MENSAJES_PRODUCTO.obligatorio;
  if (!REGEX_NOMBRE.test(limpio)) return MENSAJES_PRODUCTO.categoria;
  return '';
}

export function validarPrecio(valor) {
  const limpio = valor.trim();
  if (!limpio) return MENSAJES_PRODUCTO.obligatorio;
  if (!REGEX_PRECIO.test(limpio) || textoANumero(limpio) <= 0) return MENSAJES_PRODUCTO.precio;
  return '';
}

export function validarStock(valor) {
  const limpio = valor.trim();
  if (!limpio) return MENSAJES_PRODUCTO.obligatorio;
  if (!REGEX_STOCK.test(limpio)) return MENSAJES_PRODUCTO.stock;
  return '';
}

// Opcional: vacío está bien; si se escribe algo, tiene que ser un código válido
export function validarCodigoBarras(valor) {
  const limpio = valor.trim();
  if (!limpio) return '';
  if (!REGEX_CODIGO.test(limpio)) return MENSAJES_PRODUCTO.codigoBarras;
  return '';
}

// Valida los 5 campos juntos y devuelve un objeto con el error de cada uno:
//   { nombre: '', categoria: 'Este campo es obligatorio', ... }
export function validarProducto(valores) {
  return {
    nombre: validarNombreProducto(valores.nombre),
    categoria: validarCategoria(valores.categoria),
    precio: validarPrecio(valores.precio),
    stock: validarStock(valores.stock),
    codigoBarras: validarCodigoBarras(valores.codigoBarras),
  };
}
