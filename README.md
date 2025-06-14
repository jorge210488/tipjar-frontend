# 📝 TipJar UI - Interfaz React para Contrato de Propinas

## 🎯 Descripción

Este proyecto implementa una **interfaz en React** para interactuar con el contrato inteligente **TipJar** desplegado en la testnet **Sepolia**.

Permite a los usuarios:

- Enviar propinas en ETH con un mensaje.
- Ver la lista de propinas recibidas (Bonus).
- Ver el balance actual del contrato.
- Cambiar de cuenta en Metamask y ver la cuenta conectada
- Ver feedback visual con **spinner de loading** durante transaccion

---

## 🚀 Tecnologías

- React + Vite
- TypeScript
- Ethers.js
- Sepolia testnet
- Metamask

---

## 🛠️ Instalación

1️⃣ Clona el repositorio:

```bash
git clone https://github.com/jorge210488/tipjar-frontend.git
cd tipjar-frontend
```

2️⃣ Instala dependencias:

```bash
npm install
```

3️⃣ Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
VITE_CONTRACT_ADDRESS=TU_CONTRACT_ADDRESS
```

**IMPORTANTE:** no subas el `.env` al repositorio público.

---

## 📦 Scripts disponibles

### 👉 Iniciar la app en desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:5173
```

### 👉 Build de producción:

```bash
npm run build
```

### 👉 Previsualizar build:

```bash
npm run preview
```

---

## 🚀 Bonus implementado

- ✅ UI para enviar propinas en ETH con mensaje.
- ✅ Mostrar lista de propinas (`Tipper`, `amount`, `message`, `timestamp`).
- ✅ Leer el balance actual del contrato.
- ✅ Soporte para cambio de cuenta en Metamask con actualización en la UI.
- ✅ Spinner de loading durante las transacciones.
- ✅ Botones bloqueados mientras se procesa una transacción.

---

## 📄 Estado actual

✅ UI funcionando y conectada al contrato TipJar en Sepolia.

✅ Compatible con Metamask.

---

## 💻 Autor

- **Jorge Martínez**
- https://github.com/jorge210488
