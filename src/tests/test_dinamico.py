from simulador_tarjeta_logica import TarjetaLogica

print("=== PRUEBA DE CÁLCULO DINÁMICO (VECTOR ALTERADO) ===")

# Probamos con un vector completamente diferente: [0, 1, 1, 0]
card_test = TarjetaLogica(modo="Luminoso", vector=[0, 1, 1, 0])

print(f"Vector de entrada modificado: {card_test.vector}")
print(f"Binario traducido dinámicamente: {card_test.traducir_a_binario()}")
print(f"Propagación Anclajes T calculada por XOR: {card_test.propagar_flujo()}")
print(f"Nuevo Fingerprint SHA-256 dinámico: {card_test.generar_fingerprint()}")
