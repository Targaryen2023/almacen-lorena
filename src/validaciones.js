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
