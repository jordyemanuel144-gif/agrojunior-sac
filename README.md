# AGROJUNIOR SAC — Sistema de Atención Inteligente

Plataforma web de gestión comercial y **chatbot con IA** para **AGROJUNIOR SAC**, productora y comercializadora de **carne de ganado vacuno premium** (Toro Angus y Holstein) ubicada en **Majes, Arequipa – Perú**.

> Carne Premium de Majes al Gancho — venta por mayor y menor, directo del productor, sin intermediarios.

## Características

- **Chatbot inteligente** (motor de reglas + Gemini IA) para atención 24/7: precios por kilo de Angus/Holstein, disponibilidad de lotes, ubicación y coordinación de pedidos.
- **Catálogo público** de cortes y lotes con precios minorista / mayorista / especial.
- **Panel administrativo**: inventario, ventas (POS), clientes, cobranzas, compras, proveedores, comprobantes y reportes.
- **Integración WhatsApp** para envío de cotizaciones, comprobantes y recordatorios de cobranza.

## Negocio

- **Empresa:** AGROJUNIOR SAC
- **Propietario:** Darly Junior Sanchez Cutipa
- **Ubicación:** Parcela 316, Los Molles, Sección A — Majes, Arequipa, Perú
- **WhatsApp:** +51 970 995 140
- **Facebook:** Darly Sanchez Cutipa · **TikTok:** @darlysanchez85
- **Razas:** Toro Angus (marmoleo superior, cortes premium) y Toro Holstein (carne magra)

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (tema negro / dorado `#D4A017` / blanco)
- Supabase (PostgreSQL) como backend
- Gemini API (chatbot conversacional)

## Desarrollo

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo
npm run build      # build de producción
npm test           # tests (vitest)
```

Requiere Node `^20.19 || ^22.12 || >=24`. Copia `.env.example` a `.env` y completa las variables (Supabase y `VITE_GEMINI_API_KEY`).

## Base de datos

Los scripts SQL de esquema, funciones, vistas y datos semilla están en `database/`. Ejecutarlos en orden en el proyecto de Supabase.
