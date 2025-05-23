# Deploying to Starknet Sepolia Testnet

Esta guía te ayudará a desplegar tu juego Dojo en Starknet Sepolia testnet para poder verificar transacciones reales.

## 📋 Prerrequisitos

1. **Wallet con fondos en Sepolia:**
   - Instala [ArgentX](https://www.argent.xyz/) o [Braavos](https://braavos.app/)
   - Cambia a la red Sepolia testnet
   - Obtén ETH de testnet desde: https://starknet-faucet.vercel.app/

2. **Herramientas necesarias:**
   ```bash
   # Instalar Starkli (opcional pero útil)
   curl https://get.starkli.sh | sh
   starkliup
   ```

## 🔧 Configuración

### 1. Configurar tu cuenta

Edita el archivo `dojo_sepolia.toml` y reemplaza:

```toml
[env]
rpc_url = "https://starknet-sepolia.public.blastapi.io/rpc/v0_7"
account_address = "TU_DIRECCIÓN_DE_SEPOLIA"
private_key = "TU_CLAVE_PRIVADA_DE_SEPOLIA"
```

### 2. Obtener tu clave privada

**Desde ArgentX:**
1. Ve a Settings → Privacy and Security
2. Export Private Key
3. Copia la clave privada

**Desde Braavos:**
1. Settings → Privacy and Security
2. Export Private Key
3. Copia la clave privada

## 🚀 Despliegue

### 1. Construir y migrar a Sepolia

```bash
# Desde el directorio backend
scarb run migrate_sepolia
```

### 2. Crear jugadores en testnet

```bash
# Crear jugador con apuesta de 100 wei
scarb run create_player_sepolia -- --calldata 100

# Unirse a una batalla (reemplaza BATTLE_ID)
scarb run join_battle_sepolia -- --calldata BATTLE_ID

# Realizar ataque (reemplaza BATTLE_ID, ACTION_TYPE, VALUE)
scarb run attack_sepolia -- --calldata BATTLE_ID 0 3
```

## 📊 Verificar Transacciones

Una vez desplegado, puedes verificar las transacciones en estos exploradores:

### Starkscan (Recomendado)
- **URL:** https://sepolia.starkscan.co/
- **Busca por:** Transaction hash, contract address, o account address

### Voyager
- **URL:** https://sepolia.voyager.online/
- **Busca por:** Transaction hash o contract address

### StarkCompass
- **URL:** https://sepolia.starkcompass.com/
- **Busca por:** Transaction hash o contract address

## 🔍 Información Útil

### URLs del GraphQL en Torii

Si quieres ejecutar Torii para Sepolia:

```bash
# Ejecutar Torii apuntando a Sepolia
torii --world WORLD_ADDRESS \
      --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7 \
      --http.cors_origins "*" \
      --http.addr 0.0.0.0
```

### Ejemplo de transacción completa

```bash
# 1. Desplegar
scarb run migrate_sepolia

# 2. Crear jugador 1 (100 wei de apuesta)
scarb run create_player_sepolia -- --calldata 100

# 3. Crear jugador 2 y unirse a la batalla ID 1
# (Cambiar a otra cuenta primero)
scarb run join_battle_sepolia -- --calldata 1

# 4. Jugador 1 ataca con valor 3
scarb run attack_sepolia -- --calldata 1 0 3

# 5. Jugador 2 se defiende con valor 2
scarb run attack_sepolia -- --calldata 1 1 2
```

## 🔐 Seguridad

⚠️ **IMPORTANTE:**
- Nunca compartas tu clave privada
- Solo usa fondos de testnet
- Mantén las claves privadas en variables de entorno en producción

### Variables de entorno (Recomendado)

```bash
# .env
export SEPOLIA_ACCOUNT_ADDRESS="0x..."
export SEPOLIA_PRIVATE_KEY="0x..."

# Usar en comandos
sozo migrate --profile sepolia \
  --account-address $SEPOLIA_ACCOUNT_ADDRESS \
  --private-key $SEPOLIA_PRIVATE_KEY
```

## 📋 Troubleshooting

### Error: Account not found
- Verifica que la dirección de cuenta sea correcta
- Asegúrate de que la cuenta tenga fondos ETH en Sepolia

### Error: Insufficient funds
- Obtén más ETH de testnet desde el faucet
- Verifica que estés en la red Sepolia

### Error: World already exists
- Cambia el `seed` en `dojo_sepolia.toml` para crear un nuevo mundo

## 📱 Integración con Frontend

Para conectar tu frontend a Sepolia, actualiza el archivo de configuración de Dojo:

```typescript
// dojoConfig.ts
export const dojoConfig = {
  toriiUrl: "http://localhost:8080", // Tu instancia de Torii
  relayUrl: "", 
  worldAddress: "WORLD_ADDRESS_FROM_DEPLOYMENT", // Del output de migrate
  // ... resto de configuración
}
```

¡Ahora puedes verificar todas las transacciones de tu juego en los exploradores de Sepolia! 🎉 