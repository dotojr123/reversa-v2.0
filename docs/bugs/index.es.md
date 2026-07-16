# Bug Agents

El Equipo **Bug Agents** convierte el manejo de defectos en una **memoria causal de defectos** nativa del repositorio. Cada bug es una carpeta autocontenida con un registro en front matter YAML, trazable a las especificaciones extraídas por el Equipo de Descubrimiento (`SPEC ↔ CODE ↔ TEST ↔ BUG`), y acompañado desde el registro hasta la recuperación comprobada del sistema.

La regla fundacional: **documentar un bug y corregir un bug son actos estrictamente separados.**

Siempre instalado, como grupo único fijo junto al Reversa Agents Core.

---

## Cuándo usar

Algo está mal en el sistema y quieres más que un parche rápido: un registro clasificado y trazable, causa raíz con evidencias, test de regresión y un veredicto sobre si la spec original debe ser versionada. O una feature "se rompe todo el tiempo" y quieres un barrido profundo en lugar de otro hotfix.

El Equipo funciona mejor sobre una extracción (`_reversa_sdd/`), pero degrada bien: sin specs, los bugs llevan la etiqueta `spec-gap` hasta que corra `/reversa`.

---

## Los 5 comandos

```
/reversa-debugger ──registra──► _reversa_bugs/bugs/BUG-.../   ◄──registra hallazgos── /reversa-depth-inspection
      │
      ▼
/reversa-debugger-fix ──opt-in──► /reversa-debugger-debate (diagnosis | repair | spec)
      │
      ▼ cierra según la closure policy
/reversa-debugger-graph ──regenera──► generated/* + _reversa_sdd/traceability/bugs.md
```

| Agente | Rol |
|--------|-----|
| **Bug** | Intake, triaje, dedupe, clasificación (`taxonomy.yaml`), trazabilidad inicial y sospecha de seguridad. Nunca corrige. `/reversa-debugger` |
| **Bug Fix** | Orquestador del ciclo de vida: mitigación opcional, cápsula de reproducción, causa raíz con evidencias (con `git bisect` para regresiones), dos puertas de aprobación (tests que fallan primero, luego el change set de corrección), veredicto de spec, closure policy. `/reversa-debugger-fix` |
| **Bug Debate** | Debate multiagente en épocas fijas con juez aislado, en tres modos: `diagnosis` (hipótesis causales en competencia), `repair` (estrategias en competencia), `spec` (divergencia código vs spec; termina en recomendación, la decisión es humana). Siempre opt-in, con costo mostrado antes. Harness externos (Codex, Gemini CLI, OpenCode) solo entran como debatientes con consentimiento explícito. `/reversa-debugger-debate` |
| **Depth Inspection** | Barrido profundo de una feature problemática con lentes especializadas: conformidad con la spec, flujo de datos, contratos, estados de error, cobertura de tests, concurrencia. Solo diagnóstico; los hallazgos confirmados se convierten en bugs registrados. `/reversa-depth-inspection` |
| **Bug Graph** | Regenera todas las vistas derivadas: índice, catálogo compacto (`catalog.jsonl`), matriz dispersa de relaciones, grafo mermaid con clusters e impact score, y la matriz de trazabilidad BUG ↔ SPEC en ambos extremos. Valida invariantes y se detiene con error explícito ante inconsistencias. `/reversa-debugger-graph` |

---

## Anatomía de un bug

Una carpeta por bug, con **dirección inmutable**: la carpeta nunca se mueve ni se renombra. El status vive en el front matter, nunca en la ruta.

Los bugs se agrupan por **contexto**: la feature, módulo o caso de uso del que habla el usuario ("se rompió el sistema de crédito", "el carrito calcula mal"). La carpeta del contexto no existe hasta que alguien reporta un problema del área, pero nace **inmediatamente** cuando el usuario dice dónde está el problema, para recibir capturas y documentos al instante. TODO lo de esa área vive dentro de ella; nada nace vacío en la raíz.

```
_reversa_bugs/
├── README.md                 el contrato del proyecto (lifecycle, closure policy, reglas)
├── taxonomy.yaml             vocabulario controlado de area/module/feature
└── <contexto>/               ej.: sistema-de-credito/ (creada al primer reporte)
    ├── intake/               reportes anotados + capturas recibidas ANTES de existir ningún bug
    ├── bugs/
    │   └── BUG-20260715-A7K3-descuento-duplicado/
    │       ├── bug.md        registro canónico (source of truth)
    │       ├── DONE.md       candado de cierre: presente, la carpeta es de solo lectura para agentes
    │       ├── evidence/     logs, capturas, cápsula de reproducción
    │       ├── debate/       si se abrió: rondas, convergencia, respuesta final
    │       └── fix/          plan.html (plan visual, aprobado ANTES de tocar nada) + diffs del change set
    ├── inspections/<barrido>/  informes del barrido profundo del contexto
    └── generated/            vistas del contexto, incluido graph.html (nunca editadas a mano)
```

Conceptos centrales del schema:

- **IDs merge-safe**: `BUG-<fecha>-<sufijo>` nunca colisiona, incluso con dos harness registrando bugs en worktrees paralelas. Un `display_number` humano ("BUG-007") queda para la conversación.
- **3 status + phase**: `open`, `active`, `resolved`, con una `phase` separada (mitigating, reproducing, diagnosing, observing...). El bloqueo es una condición, nunca un status.
- **Estados epistemológicos**: la causa raíz y las relaciones entre bugs llevan `hypothesized / supported / confirmed / rejected` con evidencias. Una hipótesis nunca entra al grafo como hecho.
- **Correction Change Set**: una corrección es un conjunto tipado de cambios (código, test, configuración, migration, reparación de datos, especificación...), porque código sanado no es sistema sanado.
- **Closure policy**: lo que `resolved` exige depende del perfil del proyecto: software local cierra con tests de regresión pasando; un servicio en producción solo tras la entrega y una ventana de observación sin recurrencia.
- **Anotar primero, salida visual siempre**: `/reversa-debugger` empieza como escribano (reportes y capturas caen en `intake/` antes de cualquier registro), y las vistas, incluido el `graph.html` autocontenido (nodos clicables, estadísticas, aristas de relación), se generan automáticamente como parte de la documentación. `/reversa-debugger-fix` produce un plan visual de corrección (`fix/plan.html`, con matriz de relaciones con enlaces y el change set propuesto) que el usuario aprueba antes de tocar cualquier archivo, y graba el candado `DONE.md` cuando la closure policy se satisface.

---

## Veredicto de spec

Toda corrección responde: *¿lo incorrecto era el código o la spec?* Tres salidas: `spec-correta` (el código divergió, la spec queda), `spec-desatualizada` (se genera un addendum versionado en `_reversa_sdd/addenda/`, la spec original nunca se edita) o `spec-gap` (el comportamiento nunca fue especificado; nace un addendum aditivo). El agente recomienda con evidencias; **la decisión es humana**. El diff del código y el diff de la spec quedan registrados **juntos** en la Resolution del bug.

El vínculo inverso vive también del lado de la spec: `_reversa_sdd/traceability/bugs.md` es un espejo generado que lista, por sección de spec, los bugs que la afectan.

---

## Non-destructive

Los Bug Agents escriben solo dentro de `_reversa_bugs/`, además de los addenda en `_reversa_sdd/addenda/` y el espejo generado en `_reversa_sdd/traceability/`. El código del proyecto solo cambia por las dos puertas de aprobación, con diffs explícitos. Los bugs con `visibility: restricted` (seguridad) quedan fuera de las vistas públicas y nunca llegan a harness externos.
