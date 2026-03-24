console.log("El script se cargó correctamente"); // Probamos conexion

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que la página se recargue

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simulación de datos correctos
    if (email === "admin@autotech.com" && password === "123456") {
        window.location.href = "../page/admin.html"; // Redirige a la siguiente página del admin
    } else if (email === "carlos@email.com" && password === "abcde") {
        window.location.href = "../page/usuario.html"; // Redirige a la siguiente página del cliente
    } else if (email === "oscar@gmail.com" && password === "oscar123") {
        window.location.href = "../page/usuario.html"; // Redirige al panel del cliente Oscar
    } else {
        alert("Correo o contraseña incorrectos. Intentelo de nuevo");
    }
});