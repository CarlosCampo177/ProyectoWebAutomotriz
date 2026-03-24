console.log("El script se cargó correctamente"); // Probamos conexion

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Detenemos el envío para revisar el js 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simulación de datos correctos
    if (email === "admin@autotech.com" && password === "123456") {
        window.location.href = "../page/admin.html"; // Redirige a la pagina del admin
    } else if (email === "carlos@email.com" && password === "abcde"){
        window.location.href = "../page/usuario.html"; // Redirige a la pagina del cliente
    } else{
        alert("Correo o contraseña incorrectos. Intentelo nuevamente");
    }
});
