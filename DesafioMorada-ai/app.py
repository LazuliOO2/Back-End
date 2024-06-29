#objetivo seria entrega menor numero de cedula possivel
# Importa as bibliotecas necessárias para o funcionamento do projeto
import json
import sys

# Define uma função chamada saque que recebe um parâmetro valor
def saque(valor):
    # As notas que podem ser sacadas
    notas = [100, 50, 20, 10, 5, 2]
    # Dicionário vazio para armazenar o resultado
    resultado = {}
    # Loop que percorre cada valor de nota
    for nota in notas:
        # Calcula a quantidade de notas de um determinado valor que podemos sacar usando a divisão inteira (//)
        quantidade = valor // nota
        # Atualiza o valor restante após sacar as notas de um determinado valor usando o operador de módulo (%)
        valor %= nota
        # Verifica se a quantidade de notas a ser sacada é maior que zero
        if quantidade > 0:
            # Adiciona essa quantidade ao dicionário resultado
            resultado[nota] = quantidade
    # Retorna o valor restante que não pôde ser sacado e o dicionário resultado
    return valor, resultado

# Define outra função chamada main com parâmetro valor_saque
def main(valor_saque):
    # Chama a função saque com o valor_saque fornecido e desempacota o valor restante e o resultado do saque
    valor_restante, resultado_saque = saque(valor_saque)
    # Cria um dicionário resposta com o valor de saque e o resultado
    resposta = {
        "valor_saque": valor_saque,
        "resultado_saque": resultado_saque
    }
    # Verifica se há algum valor restante que não pôde ser sacado
    if valor_restante > 0:
        # Se houver valor restante, adiciona ao dicionário resposta uma mensagem de erro e uma sugestão
        resposta["erro"] = f"Não foi possível sacar R${valor_restante} com as cédulas disponíveis."
        resposta["sugestao"] = f"Você pode tentar sacar um valor adicional de R${2 - valor_restante} para atingir R${valor_saque + 2 - valor_restante}."
    # Imprime a resposta no formato JSON
    print(json.dumps(resposta))

# Verifica se o script está sendo executado como o programa principal
if __name__ == "__main__":
    # Verifica se algum argumento foi passado na linha de comando
    if len(sys.argv) > 1:
        # Tenta converter o primeiro argumento para um inteiro e chama a função main com esse valor
        try:
            valor_saque = int(sys.argv[1])
            main(valor_saque)
        # Se a conversão falhar, imprime uma mensagem de erro no formato JSON
        except ValueError:
            print(json.dumps({"erro": "Por favor, forneça um número inteiro como valor de saque."}))
    # Se nenhum argumento for passado, imprime uma mensagem de erro no formato JSON
    else:
        print(json.dumps({"erro": "Nenhum valor de saque fornecido."}))

