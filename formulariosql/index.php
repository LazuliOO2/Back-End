<?php
session_start();
require_once 'config.php';

$conn = mysqli_connect($servername, $username, $password, $dbname);
if (!$conn) {
    die("Erro na conexão com banco de dados: " . mysqli_connect_error());
}
//Verifica se os dados do formulário foram enviados
if($_SERVER["REQUEST_METHOD"] == "POST"){
    // mysqli_real_escape_string evita injeções de SQL
    $usuario = mysqli_real_escape_string($conn, $_POST['nome']);
    $senha = mysqli_real_escape_string($conn, $_POST['senha']);

    // Cria a query SQL
    $sql = "SELECT id FROM login WHERE usuario = '$usuario' AND senha = '$senha'";
    
    // Executa a query
    $result = $conn->query($sql);

    // Verifica se o usuário existe no banco de dados
    if ($result->num_rows == 1) {
        // Armazena o usuário na sessão
        $_SESSION['usuario'] = $usuario;
        
        // Redireciona para a página protegida
        header("location: cadastro.php");
    } else {
        echo "<script>alert('Usuário ou senha inválidos.');</script>";
    }
}

if($conn){
    mysqli_close($conn);
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulario</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  <link rel="stylesheet" href="style.css">

</head>
<body>
    <h1 class="d-flex justify-content-center ">Faça seu login</h1>
<div class="d-flex justify-content-center flex-column" id="formulario">
    <div>
    <form action="" method="post">
        <label for="name">Nome</label>
        <input type="text" placeholder="Digite seu nome" name="nome" id="nome">
    </div>
    <div>
        <label for="senha">Senha</label>
        <input type="password" placeholder="Digite sua senha" name="senha" id="senha">       
    </div>
    <button type="submit">Enviar</button>
    </form>
</div>
</body>
</html>