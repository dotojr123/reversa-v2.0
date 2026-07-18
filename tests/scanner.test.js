import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Scanner } from '../lib/core/scanner/Scanner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.join(__dirname, 'fixtures', 'sprint6a');
const GABARITO_PATH = path.join(FIXTURE_ROOT, 'gabarito', 'scanner-expected.json');

let gabarito;
let rawObjects = [];

before(async () => {
    gabarito = JSON.parse(readFileSync(GABARITO_PATH, 'utf-8'));
    const scanner = new Scanner(FIXTURE_ROOT);
    
    // Ler todos os arquivos de src (hardcoded para o fixture)
    const filesToScan = [
        'src/index.js',
        'src/services/UserService.js',
        'src/services/OrderService.js',
        'src/utils/validators.js',
        'src/utils/formatters.js',
        'src/config/constants.js',
        'src/legacy/validatorsCopy.js',
        'src/legacy/OrderServiceV2.js'
    ];
    
    for (const file of filesToScan) {
        const kos = await scanner.scan(file);
        rawObjects = rawObjects.concat(kos);
    }
});

/** Normaliza pra comparação: remove campos não-determinísticos (uuid, timestamp)
 *  e garante separador de path consistente entre SO. */
function normalize(ko) {
    return {
        canonicalId: ko.canonicalId,
        type: ko.type,
        content: ko.content,
        evidences: (ko.evidences || [])
            .map((ev) => ({
                type: ev.type,
                path: ev.path.split(path.sep).join('/'),
                confidence: ev.confidence,
            }))
            .sort((a, b) => a.path.localeCompare(b.path)),
    };
}

function sortKey(ko) {
    const firstPath = ko.evidences?.[0]?.path ?? '';
    return `${ko.canonicalId}::${firstPath}`;
}

function groupByCanonicalId(objects) {
    const map = new Map();
    for (const ko of objects) {
        const list = map.get(ko.canonicalId) ?? [];
        list.push(ko);
        map.set(ko.canonicalId, list);
    }
    return map;
}

describe('Scanner — fixture Sprint 6a', () => {
    test(`extrai exatamente as ${gabarito.counts.total_raw_evidences} evidências brutas esperadas (contagem)`, () => {
        assert.equal(
            rawObjects.length,
            gabarito.counts.total_raw_evidences,
            `Esperado ${gabarito.counts.total_raw_evidences} evidências brutas, recebido ${rawObjects.length}. ` +
                `Se esse número mudou, ou o Scanner está perdendo entidades ou pegando lixo (ex: arquivos do gabarito/).`
        );
    });

    test('o conteúdo extraído bate campo a campo com o gabarito', () => {
        const expected = gabarito.raw_knowledge_objects
            .map(normalize)
            .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
        const actual = rawObjects
            .map(normalize)
            .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

        assert.deepStrictEqual(
            actual,
            expected,
            'Divergência entre o que o Scanner extraiu e o gabarito. Ver diff acima — ' +
                'provavelmente um dependsOn errado, um path com separador de SO errado, ou um type incorreto.'
        );
    });

    test('identifica as 2 duplicatas propositais para o DedupProcessor', () => {
        const byCanonical = groupByCanonicalId(rawObjects);

        for (const canonicalId of gabarito.counts.duplicates_for_dedup_merge === 2
            ? ['Function.validateEmail', 'Class.OrderService', 'Class.OrderService.createOrder']
            : []) {
            const occurrences = byCanonical.get(canonicalId) ?? [];
            assert.equal(
                occurrences.length,
                2,
                `${canonicalId} deveria ter 2 evidências brutas (arquivo original + duplicata legada), tem ${occurrences.length}`
            );
        }
    });

    test('as duas evidências de Class.OrderService.createOrder são estruturalmente DIFERENTES (guarda o cenário de conflito)', () => {
        const occurrences = rawObjects.filter((ko) => ko.canonicalId === 'Class.OrderService.createOrder');
        assert.equal(occurrences.length, 2, 'Esperado 2 evidências para o método que diverge entre OrderService.js e OrderServiceV2.js');

        const [a, b] = occurrences;

        // A divergência agora emerge naturalmente pelo campo numericLiterals
        // (0.10 vs 0.15), coletado de forma genérica pelo Scanner sem valor mágico.
        assert.notDeepStrictEqual(
            a.content,
            b.content,
            'As duas versões de createOrder precisam divergir estruturalmente (ex: numericLiterals diferentes) — ' +
                'se alguém "consertou" o fixture deixando os dois arquivos idênticos, o teste de ConflictProcessor vai quebrar silenciosamente.'
        );
    });

    test('as duas evidências de validateEmail/OrderService (dedup) são estruturalmente IDÊNTICAS', () => {
        for (const canonicalId of ['Function.validateEmail', 'Class.OrderService']) {
            const occurrences = rawObjects.filter((ko) => ko.canonicalId === canonicalId);
            assert.equal(occurrences.length, 2);

            const [a, b] = occurrences;
            assert.deepStrictEqual(
                a.content,
                b.content,
                `${canonicalId}: as duas evidências deveriam ter content idêntico (é o cenário de merge limpo, não de conflito)`
            );
        }
    });

    test('detecta o import circular UserService <-> OrderService no dependsOn', () => {
        const userService = rawObjects.find((ko) => ko.canonicalId === 'Class.UserService');
        const orderService = rawObjects.find((ko) => ko.canonicalId === 'Class.OrderService');

        assert.ok(userService, 'Class.UserService não foi extraído');
        assert.ok(orderService, 'Class.OrderService não foi extraído (nenhuma das 2 evidências)');

        assert.ok(
            userService.content.dependsOn?.includes('Class.OrderService'),
            'UserService deveria declarar dependsOn -> Class.OrderService'
        );
        assert.ok(
            (orderService.content.dependsOn ?? []).includes('Class.UserService') ||
                rawObjects
                    .filter((ko) => ko.canonicalId === 'Class.OrderService')
                    .some((ko) => (ko.content.dependsOn ?? []).includes('Class.UserService')),
            'OrderService deveria declarar dependsOn -> Class.UserService em pelo menos uma das evidências'
        );
    });

    test('entidades de controle (sem duplicata/conflito) aparecem exatamente 1 vez', () => {
        for (const canonicalId of ['Function.formatCurrency', 'Const.TAX_RATE', 'Const.CURRENCY', 'Function.validateAmount', 'Function.bootstrap']) {
            const occurrences = rawObjects.filter((ko) => ko.canonicalId === canonicalId);
            assert.equal(
                occurrences.length,
                1,
                `${canonicalId} é grupo de controle (sem duplicata proposital) — se aparecer mais de 1 vez, ` +
                    `o Scanner está gerando falso-positivo de duplicata`
            );
        }
    });
});
