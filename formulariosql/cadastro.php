<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>pagina processada </title>
</head>
<body>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulário de Cadastro</title>
    <style>
        body {
            background-image: url(_67495277-05b8-4528-bff2-0eda1fa07ead.jfif);
            color: black;
            font-family: Arial, sans-serif;
        }
        .form-container {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            background-color: #E1E1E1;
            border-radius: 10px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            font-weight: bold;
        }
        input[type="text"],
        input[type="tel"],
        select {
            width: 100%;
            padding: 10px;
            border: 1px solid #FFFFFF;
            border-radius: 5px;
            background-color: transparent;
            color: black;
        }
        input[type="submit"] {
            background-color: #FF4500;
            color: #FFFFFF;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h1>Cadastro</h1>
        <form action="" method="post">
            <div class="form-group">
                <label for="telefone">Telefone:</label>
                <input type="tel" id="telefone" name="telefone" required>
            </div>
            <div class="form-group">
                <label for="genero">Gênero:</label>
                <select id="genero" name="genero">
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                </select>
            </div>
            <div class="form-group">
                <label for="cidade">Cidade:</label>
                <input type="text" id="cidade" name="cidade" required>
            </div>
            <div class="form-group">
                <label for="estado">Estado:</label>
                <input type="text" id="estado" name="estado" required>
            </div>
            <div class="form-group">
                <label for="idade">Idade:</label>
                <input type="text" id="idade" name="idade" required>
            </div>
            <input type="submit" value="Cadastrar">
        </form>
    </div>  
    <?php 
require_once 'config.php';
#O ! cria oposto do elemento no caso ao inves de ser verdadeiro
#vira falso 
if (!$conn) {
    die("Erro na conexão com o banco de dados:".
    mysqli_connect_error());
}
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Valores do formulário e transforma todo em string
    $telefone = mysqli_real_escape_string($conn, $_POST['telefone']);
    $genero = mysqli_real_escape_string($conn, $_POST['genero']);
    $cidade = mysqli_real_escape_string($conn, $_POST['cidade']);
    $estado = mysqli_real_escape_string($conn, $_POST['estado']);
    $idade = mysqli_real_escape_string($conn, $_POST['idade']);
    // Inserir os valores na tabela
    $sql = "INSERT INTO cadastro(telefone,genero,cidade,estado,idade) VALUES ('$telefone','$genero','$cidade','$estado','$idade')";
    if (mysqli_query($conn, $sql)) {
        echo "<script>alert('Cadastro realizado com sucesso!');</script>";
    } else {
        echo "<script>alert('Erro ao cadastrar');</script>" . mysqli_error($conn);
    }
}

?>
</body>
</html>

</body>
</html>