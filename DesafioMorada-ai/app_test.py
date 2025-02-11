#Importa biblioteca de teste junto com a função que deseja testa
import pytest
from app import saque

#lembrar de sempre coloca test antes da função que desejo testa
#no caso vamos testa da função saque se está dando o saque correto
def test_saque ():
    valor, resultado = saque(280)
    assert valor == 0 
    assert resultado == {100:2, 50:1, 20:1, 10:1}
#verificado se quando falta um valor de saque o app ainda funciona 
def test_saque_valor_restante():
    valor,resultado = saque(3)
    assert valor == 1 
    assert resultado == {2:1}
#testa quando o usuario coloca um valor negativo
def test_saque_valor_negativo():
    with pytest.raises(ValueError):
        saque(-100)
#Testa quando o usuario digitar uma palavra 
def test_saque_palavra():
    with pytest.raises(ValueError):
        saque("cem")
