console.log("El script se cargó correctamente"); // Probamos conexion

document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault(); // Detenemos el envío para revisar el js 

  const pass = document.querySelectorAll('input[type="password"]')[0].value;
  const confirmPass = document.querySelectorAll('input[type="password"]')[1].value;

  if (pass !== confirmPass) {
    alert("¡Las contraseñas no coinciden!");
  } else if (pass.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
  } else {
    // Si todo está bien se va al login
    alert("¡Cuenta creada con éxito!");
    window.location.href = "login.html";
  }
});

