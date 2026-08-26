// benchmark/metrics.test.mjs — unit tests for the benchmark metrics module and
// the labeled dataset's well-formedness. Run with:  node --test benchmark/metrics.test.mjs

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import {
  confusion,
  f1,
  falsePositiveRate,
  macroAverage,
  metricsFor,
  microAverage,
  precision,
  recall,
} from './metrics.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const dataset = JSON.parse(readFileSync(join(here, 'dataset', 'poison.json'), 'utf8'))

test('confusion counts TP/FP/FN/TN correctly', () => {
  const outcomes = [
    { label: true, predicted: true },
    { label: true, predicted: true },
    { label: true, predicted: false },
    { label: false, predicted: true },
    { label: false, predicted: false },
    { label: false, predicted: false },
  ]
  assert.deepEqual(confusion(outcomes), { tp: 2, fp: 1, fn: 1, tn: 2 })
})

test('precision/recall/f1/fpr match hand-computed values', () => {
  assert.equal(precision({ tp: 2, fp: 1, fn: 1, tn: 2 }), 2 / 3)
  assert.equal(recall({ tp: 2, fp: 1, fn: 1, tn: 2 }), 2 / 3)
  assert.equal(f1(2 / 3, 2 / 3), 2 / 3)
  assert.equal(falsePositiveRate({ tp: 2, fp: 1, fn: 1, tn: 2 }), 1 / 3)
})

test('empty denominators yield zero (not NaN)', () => {
  assert.deepEqual(metricsFor([]), {
    tp: 0, fp: 0, fn: 0, tn: 0, total: 0, positives: 0, negatives: 0,
    precision: 0, recall: 0, f1: 0, fpr: 0,
  })
  assert.equal(precision({ tp: 0, fp: 0, fn: 1, tn: 0 }), 0)
  assert.equal(recall({ tp: 0, fp: 1, fn: 0, tn: 0 }), 0)
})

test('a perfect classifier scores F1 = 1 and FPR = 0', () => {
  const perfect = metricsFor([
    { label: true, predicted: true },
    { label: false, predicted: false },
  ])
  assert.equal(perfect.precision, 1)
  assert.equal(perfect.recall, 1)
  assert.equal(perfect.f1, 1)
  assert.equal(perfect.fpr, 0)
})

test('macro average is the unweighted mean; micro average pools counts', () => {
  const a = metricsFor([{ label: true, predicted: true }, { label: false, predicted: false }])
  const b = metricsFor([{ label: true, predicted: false }])
  const macro = macroAverage([a, b])
  assert.equal(macro.f1, Number(((a.f1 + b.f1) / 2).toFixed(3)))
  const micro = microAverage([a, b])
  assert.equal(micro.tp, 1)
  assert.equal(micro.fn, 1)
  assert.equal(micro.recall, 0.5)
})

test('dataset is well-formed: three classes, each with malicious and benign samples', () => {
  assert.equal(dataset.classes.length, 3)
  for (const cls of dataset.classes) {
    assert.ok(['install-scripts', 'network-exfil', 'obfuscation'].includes(cls.id))
    const malicious = cls.samples.filter(sample => sample.label === true)
    const benign = cls.samples.filter(sample => sample.label === false)
    assert.ok(malicious.length > 0, `${cls.id} has no malicious samples`)
    assert.ok(benign.length > 0, `${cls.id} has no benign samples`)
    for (const sample of cls.samples) {
      assert.equal(typeof sample.label, 'boolean')
      const hasPayload = (typeof sample.packageJson === 'object' && sample.packageJson !== null)
        || typeof sample.code === 'string'
      assert.ok(hasPayload, `${cls.id}/${sample.id} has neither packageJson nor code`)
    }
    assert.equal(new Set(cls.samples.map(sample => sample.id)).size, cls.samples.length)
  }
})
