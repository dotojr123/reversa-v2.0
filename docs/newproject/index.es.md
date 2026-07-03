# Code New Project Agents

El equipo **Code New Project Agents** es la contraparte greenfield del equipo de Descubrimiento. Mientras Discovery responde *qué hace el legado existente?*, el equipo de Proyecto Nuevo responde *qué vamos a construir desde cero y qué specs lo demuestran?*.

El pipeline parte de una idea en una línea y llega a un conjunto completo de specs SDD, listas para entrar en el ciclo de los Code Forward Agents.

Pre-marcado en el instalador.

---

## Cuándo usar

Tienes una idea, pero todavía no hay código. Puede ser una frase ("quiero que el usuario exporte facturas en PDF"), puede ser un párrafo. Quieres pensar el producto antes de abrir el IDE: validar el problema, dibujar las personas, escribir un PRD y dividir el PRD en specs SDD que un agente de IA pueda implementar.

Activa con:

```
/reversa-new
```

`/reversa-new` tiene dos modos de ejecución:

- **Guiado** (predeterminado): el orquestador recoge el brief, conduce los cuatro agentes funcionales en orden fijo, guarda checkpoint entre cada uno y pide `CONTINUAR` antes de avanzar. Termina en las specs SDD, con handoff a `/reversa-forward`.
- **Expreso**: actívalo con `/reversa-new expresso "<tu idea>"` o elígelo en el menú inicial. Todas las preguntas se concentran en una entrevista única al inicio; tras el `INICIAR`, el pipeline corre sin pausas y, al concluir las specs, encadena automáticamente con el ciclo forward (`requirements → plan → to-do → coding`) hasta el código implementado. Las dudas que surjan en el camino se registran con el sello 🟡 para revisión posterior, sin interrumpir el flujo.

Si la sesión se interrumpe, en cualquier modo, basta con escribir `/reversa-new` de nuevo: lee `state.json#newproject_progress` y retoma exactamente donde se detuvo, respetando el modo guardado.

---

## Pipeline

```
/reversa-new              (orquestador)
       │
       ▼
/reversa-ideator          → _reversa_sdd/ideation.md
       │
       ▼ CONTINUAR
/reversa-researcher       → _reversa_sdd/personas.md
       │
       ▼ CONTINUAR
/reversa-drafter          → _reversa_sdd/prd.md
       │
       ▼ CONTINUAR
/reversa-spec-sdd         → _reversa_sdd/sdd/<componente>.md
       │
       ├── guiado: handoff, sugiere /reversa-forward
       │
       ▼ expreso: continúa sin parar
/reversa-requirements → /reversa-plan → /reversa-to-do → /reversa-coding
       │
       ▼
código implementado en _reversa_forward/<NNN>-<feature>/
```

En el modo expreso las pausas `CONTINUAR` del diagrama no existen: la única confirmación es el `INICIAR` de la entrevista inicial.

El agente Spec SDD es una versión **vendored** de la skill global `sdd-spec`, adaptada para vivir dentro de Reversa: lee `prd.md`, escribe en `_reversa_sdd/sdd/`, marca cada artefacto con el sello 🟡 (planificado) y, al concluir, hace handoff al pipeline Forward.

---

## Dónde quedan los artefactos

El equipo escribe solo dentro de `_reversa_sdd/` (la misma carpeta usada por Discovery). Specs greenfield conviven con specs de legado sin conflicto, porque los nombres de los archivos son distintos.

```
<tu-proyecto>/
└── _reversa_sdd/
    ├── newproject-brief.md      (orquestador)
    ├── ideation.md              (Ideator)
    ├── personas.md              (Researcher)
    ├── prd.md                   (Drafter)
    └── sdd/
        └── <componente>.md      (Spec SDD)
```

El estado del orquestador vive en `.reversa/state.json` bajo la clave `newproject_progress`, con `mode` (guiado o expreso), `stage`, `started_at`, `last_checkpoint_at`, `completed_stages` y el `brief` truncado. En modo expreso, `stage` también recorre `forward-requirements`, `forward-plan`, `forward-todo` y `forward-coding`, y la feature generada vive en `_reversa_forward/`.

---

## Re-ejecución

Cuando el pipeline ya está en curso y escribes `/reversa-new` de nuevo, el orquestador detecta el `stage` guardado y ofrece cuatro opciones:

1. **Continuar desde donde paraste** (recomendado)
2. **Recrear todo desde cero** (sobrescribe artefactos, requiere confirmación explícita)
3. **Re-ejecutar desde un agente específico** (submenú con los cuatro agentes)
4. **Cancelar**

El orquestador nunca decide por sí solo: toda sobrescritura requiere `sí` explícito.

---

## Próximos pasos

- [Los agentes del greenfield](agentes.md): qué hace cada agente, entradas y salidas.
- [Code Forward Agents](../forward/index.md): el siguiente paso natural cuando Spec SDD termina.
