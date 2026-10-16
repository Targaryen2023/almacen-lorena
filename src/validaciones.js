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
};

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
