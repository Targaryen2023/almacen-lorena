// src/estadoRegistro.js
// Problema: al crear una cuenta, Firebase INICIA SESIÓN SOLO con ese usuario.
// Navigation.js escucha la sesión (onAuthStateChanged) y saltaría a Home,
// pero el grupo decidió que después de registrarse se vuelva a Login.
//
// Solución: una "bandera" compartida. Mientras el registro está en curso,
// Navigation ignora los cambios de sesión; SignUp cierra la sesión y
// después navega a Login.
export const estadoRegistro = { enCurso: false };
