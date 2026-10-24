import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import ts from 'typescript';

const compiled = ts.transpileModule(await readFile('src/data/deck.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
const { slides, mangoTiming, timeRange, TOTAL_SECONDS } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const url = pathToFileURL(resolve('dist/index.html')).href;
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, offline: true, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
const remoteRequests = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('request', (request) => { if (/^https?:/.test(request.url())) remoteRequests.push(request.url()); });
const open = async (n) => {
  await page.evaluate((slide) => { window.location.hash = `slide-${slide}`; }, n);
  await expect(page.locator(`[data-slide="${n}"]`)).toBeVisible();
};
const reset = () => page.getByRole('button', { name: 'Reset', exact: true }).click();
const active = () => page.locator('.slide-canvas:not([hidden])');
const report = { slides: 16, untimedBookends: 2, seconds: TOTAL_SECONDS, offline: true, interactions: [], accessibility: [], viewports: [], timing: [] };
const audit = async (view) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  for (const violation of results.violations) report.accessibility.push({ view, id: violation.id, impact: violation.impact, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) });
};
const verifyMinimalTitle = async (target) => {
  await expect.poll(() => target.locator('.bookend-screen').evaluate((element) => {
    const screen = element.getBoundingClientRect();
    const title = element.querySelector('.bookend-title').getBoundingClientRect();
    return Math.abs(title.y + title.height / 2 - screen.y - screen.height / 2);
  })).toBeLessThan(1);
  const metrics = await target.locator('.bookend-screen').evaluate((element) => {
    const screen = element.getBoundingClientRect();
    const title = element.querySelector('.bookend-title');
    const subtitle = element.querySelector('.bookend-description');
    const titleBox = title.getBoundingClientRect();
    const subtitleBox = subtitle.getBoundingClientRect();
    return {
      background: getComputedStyle(element).backgroundColor,
      titleCenter: Math.abs(titleBox.x + titleBox.width / 2 - screen.x - screen.width / 2),
      subtitleCenter: Math.abs(subtitleBox.x + subtitleBox.width / 2 - screen.x - screen.width / 2),
      subtitleBelow: subtitleBox.y > titleBox.bottom,
      subtitleSmall: parseFloat(getComputedStyle(subtitle).fontSize) < parseFloat(getComputedStyle(title).fontSize) / 3,
      obsoleteGraphics: element.querySelectorAll('svg, .bookend-topline, .bookend-eyebrow, .bookend-footer, .bookend-actions').length,
      hitBackground: getComputedStyle(element.querySelector('.bookend-hit-area')).backgroundColor,
    };
  });
  assert.equal(metrics.background, 'rgb(0, 0, 0)');
  assert.ok(metrics.titleCenter < 1 && metrics.subtitleCenter < 1, 'Title and subtitle are horizontally centered');
  assert.ok(metrics.subtitleBelow && metrics.subtitleSmall, 'Small subtitle sits underneath the centered heading');
  assert.equal(metrics.obsoleteGraphics, 0, 'No network art, labels, visible buttons, or footer on the title');
  assert.equal(metrics.hitBackground, 'rgba(0, 0, 0, 0)', 'Whole-slide interaction adds no visual button');
};

try {
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-slide]')).toHaveCount(16);
  await expect(page.locator('[data-bookend="opening"]')).toBeVisible();
  await expect(page.locator('.bookend-word')).toHaveText('BLOCKCHAIN');
  await expect(page.locator('#bookend-subtitle-opening')).toHaveText('The architecture of digital trust');
  await expect(page.locator('.bookend-screen')).toHaveClass(/effects-paused/);
  await verifyMinimalTitle(page);
  await expect(page.locator('.previous-button')).toBeDisabled();
  await audit('Opening title, reduced motion');
  await page.getByRole('button', { name: 'Speaker notes', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Opening notes' })).toBeVisible();
  await expect(page.locator('.bookend-guide')).toContainText('Only then');
  await audit('Opening title notes');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Explore the slides', exact: true }).click();
  await expect(page.locator('[data-slide="1"]')).toBeVisible();
  assert.equal(slides.length, 16);
  assert.equal(slides.reduce((sum, slide) => sum + slide.duration, 0), 1200);
  for (let speaker = 1; speaker <= 4; speaker++) {
    const group = slides.filter((slide) => slide.speaker === speaker);
    assert.equal(group.length, 4);
    assert.equal(group.reduce((sum, slide) => sum + slide.duration, 0), 300);
  }

  for (let n = 1; n <= 16; n++) {
    await open(n);
    await audit(`Slide ${n}, initial`);
  }
  await open(1);

  await expect(page.locator('.payment-option').first()).toBeDisabled();
  await page.getByRole('button', { name: 'Copy the $10', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.locator('.payment-option').nth(1).click();
  await expect(page.locator('.intro-result')).toContainText('One payment counts.');
  await expect(page.locator('.payment-option.counts')).toContainText('Sam');
  await expect(page.locator('.payment-option.rejected')).toContainText('Alex');
  await reset();
  await expect(page.getByRole('button', { name: 'Copy the $10', exact: true })).toBeVisible();
  report.interactions.push('01: keyboard token copy, both payment states, reset');

  await open(2);
  await page.getByRole('button', { name: 'Shared ledger', exact: true }).click();
  await expect(active().getByRole('img')).toHaveAttribute('aria-label', /five participants/);
  await page.getByRole('button', { name: 'Central keeper', exact: true }).click();
  await expect(active().getByRole('img')).toHaveAttribute('aria-label', /central payment provider/);
  report.interactions.push('02: central and distributed diagrams');

  await open(3);
  await page.getByRole('button', { name: 'Permissioned network', exact: true }).click();
  await expect(active()).toContainText('Approved A');
  await page.getByRole('button', { name: 'Open network', exact: true }).click();
  await expect(active()).toContainText('Anyone can participate');
  report.interactions.push('03: open and permissioned participation');

  await open(4);
  await page.getByRole('button', { name: 'Check transaction', exact: true }).click();
  await expect(page.locator('.rule-result')).toContainText('Passes these checks.');
  await page.getByRole('button', { name: 'Send 14 tokens', exact: true }).click();
  await page.getByRole('button', { name: 'Check transaction', exact: true }).click();
  await expect(page.locator('.rule-result')).toContainText('Rejected: not enough tokens.');
  report.interactions.push('04: valid and invalid balance checks');

  await open(5);
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next milestone', exact: true }).click();
  await expect(page.locator('.milestone.is-visible')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Timeline complete', exact: true })).toBeDisabled();
  report.interactions.push('05: all four timeline milestones');

  await open(6);
  await page.getByRole('button', { name: 'Add a record', exact: true }).click();
  await expect(page.locator('.sample-record')).toHaveCount(3);
  await page.getByRole('button', { name: /LINK TO EARLIER BLOCK/ }).click();
  await expect(page.locator('.small-explainer')).toContainText('fingerprint');
  await page.getByRole('button', { name: /NETWORK-SPECIFIC DETAILS/ }).click();
  await expect(page.locator('.small-explainer')).toContainText('metadata');
  report.interactions.push('06: add record and inspect block contents');

  await open(7);
  const expectedHash = createHash('sha256').update(JSON.stringify({ previous: 'classroom-genesis', from: 'Alex', to: 'Sam', tokens: '7' })).digest('hex').slice(0, 8).toUpperCase();
  await expect(page.locator('.hash-field code').first()).toHaveText(expectedHash);
  await page.getByLabel('Tokens in block one').fill('9');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-slide="7"]')).toBeVisible();
  await expect(page.locator('.hash-field').first()).toContainText('STALE');
  await page.getByRole('button', { name: 'Recalculate hash', exact: true }).click();
  assert.notEqual(await page.locator('.hash-field code').first().textContent(), expectedHash);
  await expect(page.locator('.previous-field code').first()).toHaveText(expectedHash);
  await expect(page.locator('.hash-connector.broken')).toHaveCount(1);
  await expect(page.locator('.hash-bottom')).toContainText('Link mismatch');
  await reset();
  await expect(page.getByLabel('Tokens in block one')).toHaveValue('7');
  await expect(page.locator('.hash-connector.broken')).toHaveCount(0);
  report.interactions.push('07: real SHA-256, stale hash, changed hash, preserved next reference, reset');

  await open(8);
  await page.getByRole('button', { name: /PROOF OF WORK/ }).click();
  await expect(page.locator('.consensus-process')).toContainText('Try many hashes');
  await page.getByRole('button', { name: /PROOF OF STAKE/ }).click();
  await expect(page.locator('.consensus-process')).toContainText('Penalties depend on network rules');
  report.interactions.push('08: work and stake processes');

  await open(9);
  await page.getByRole('button', { name: 'Run the rule', exact: true }).click();
  await expect(page.locator('.vending-result')).toContainText('Not enough');
  await page.getByRole('button', { name: 'Insert $2', exact: true }).click();
  await page.getByRole('button', { name: 'Run the rule', exact: true }).click();
  await expect(page.locator('.vending-result')).toContainText('Condition met');
  report.interactions.push('09: insufficient and sufficient vending inputs');

  await open(10);
  for (const [label, value] of [['On time', '$0'], ['Delayed', '$50'], ['No data', '?']]) {
    await page.getByRole('button', { name: new RegExp(`^${label}`) }).click();
    await page.getByRole('button', { name: 'Reveal outcome', exact: true }).click();
    await expect(page.locator('.payout-number')).toHaveText(value);
  }
  await expect(page.locator('.oracle-bottom')).toContainText('simulated airline feed');
  report.interactions.push('10: on-time, delayed, and missing outside data');

  await open(11);
  assert.equal(mangoTiming.existingSeconds, 584760);
  await expect(page.locator('.trace-bar')).toHaveAttribute('data-seconds', '584760');
  await expect(page.locator('.trace-pilot')).toHaveAttribute('data-seconds', '2.2');
  const barWidth = Number(await page.locator('.trace-bar').getAttribute('width'));
  const pilotX = Number(await page.locator('.trace-pilot').getAttribute('cx'));
  assert.ok(Math.abs(barWidth - 584760 / 86400 / 7 * 840) < 0.000001);
  assert.ok(Math.abs(pilotX - (10 + 2.2 / 86400 / 7 * 840)) < 0.000001);
  await expect(page.locator('.trace-tick')).toHaveCount(8);
  await expect(page.locator('.trace-chart-meta')).toContainText('Days, linear scale. Pilot shown as a dot.');
  await expect(page.locator('.trace-figure .citation')).toHaveAttribute('href', /WMT-2018-GRR-Summary-for-digital\.pdf$/);
  await page.getByRole('button', { name: /Shipper/ }).click();
  await expect(page.locator('.mango-record')).toContainText('Shipper supplied this record');
  await page.getByRole('button', { name: 'Try an incorrect input', exact: true }).click();
  await expect(page.locator('.mango-record')).toContainText('M140 instead of M104');
  await page.getByRole('button', { name: /Store/ }).click();
  await expect(page.locator('.mango-record')).toContainText('Store supplied this record');
  report.interactions.push('11: supplier provenance and incorrect input');

  await open(12);
  await page.getByRole('button', { name: 'Verify signature', exact: true }).click();
  await expect(page.locator('.signature-result')).toContainText('Signature valid');
  await page.getByRole('button', { name: 'Alter one character', exact: true }).click();
  await page.getByRole('button', { name: 'Verify signature', exact: true }).click();
  await expect(page.locator('.signature-result')).toContainText('Check failed');
  await page.getByLabel('Name on the sample credential').fill('Alex Morgan');
  await page.getByRole('button', { name: 'Verify signature', exact: true }).click();
  await expect(page.locator('.signature-result')).toContainText('Signature valid');
  report.interactions.push('12: real signature validation, one-character failure, restored content');

  await open(13);
  await page.getByRole('button', { name: 'Governance', exact: true }).click();
  await expect(page.locator('.tradeoff-detail')).toContainText('who changes the rules');
  await page.getByRole('button', { name: 'Privacy', exact: true }).click();
  await expect(page.locator('.tradeoff-detail')).toContainText('who can see');
  report.interactions.push('13: benefit and trade-off explanations');

  await open(14);
  const answer = (row, label) => page.locator('.decision-row').nth(row).getByRole('button', { name: label, exact: true }).click();
  await answer(0, 'No');
  await expect(page.locator('.decision-verdict')).toContainText('simpler record keeper');
  await answer(0, 'Yes');
  await answer(1, 'No');
  await expect(page.locator('.decision-verdict')).toContainText('signed records');
  await answer(1, 'Yes');
  await answer(2, 'Yes');
  await expect(page.locator('.decision-verdict')).toContainText('regular database');
  await answer(2, 'No');
  await expect(page.locator('.decision-verdict')).toContainText('Consider blockchain');
  report.interactions.push('14: every decision path');

  await open(15);
  await page.getByRole('button', { name: 'Provider-assisted recovery', exact: true }).click();
  await expect(page.locator('.recovery-result')).toContainText('provider');
  await page.getByRole('button', { name: 'Self-managed keys', exact: true }).click();
  await expect(page.locator('.recovery-result')).toContainText('responsible for backups');
  report.interactions.push('15: both fictional recovery choices');

  await open(16);
  await expect(page.locator('.closing-question')).toContainText('Does this problem need a shared ledger');
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Reveal a takeaway', exact: true }).click();
  await expect(page.locator('.takeaway.is-visible')).toHaveCount(4);
  await page.getByRole('button', { name: 'Show thank-you screen', exact: true }).click();
  await expect(page.locator('[data-bookend="closing"]')).toBeVisible();
  await expect(page.locator('.bookend-word')).toHaveText('THANK YOU');
  await verifyMinimalTitle(page);
  await expect(page.locator('.bookend-closing-question')).toHaveText('Do we need it?');
  await expect(page.locator('.next-button')).toBeDisabled();
  await audit('Thank-you title, reduced motion');
  await page.getByRole('button', { name: 'Back to the takeaway', exact: true }).click();
  await expect(page.locator('[data-slide="16"]')).toBeVisible();
  await expect(page.locator('.takeaway.is-visible')).toHaveCount(4);
  report.interactions.push('16: four takeaways, persistent closing question, end boundary');
  console.log('PASS: every classroom activity and decision branch');

  const guidedSteps = [
    [{ selector: '.intro-result', text: 'Two copies. Still just $10.' }, { selector: '.intro-result', text: 'One payment counts.' }],
    [{ selector: '.central-layout .diagram-note', text: 'Several participants' }],
    [{ selector: '.shared-layout .diagram-note', text: 'approved members' }],
    [{ selector: '.rule-result', text: 'Passes these checks.' }, { selector: '.transaction-number', text: '14' }, { selector: '.rule-result', text: 'Rejected' }],
    [{ selector: '.milestone.is-visible', count: 2 }, { selector: '.milestone.is-visible', count: 3 }, { selector: '.milestone.is-visible', count: 4 }],
    [{ selector: '.sample-record', count: 3 }, { selector: '.small-explainer', text: 'fingerprint' }, { selector: '.small-explainer', text: 'metadata' }],
    [{ selector: '.hash-block:first-child .hash-field', text: 'STALE' }, { selector: '.hash-bottom', text: 'Link mismatch' }],
    [{ selector: '.consensus-process', text: 'Try many hashes' }, { selector: '.consensus-process', text: 'Commit stake' }],
    [{ selector: '.vending-result', text: 'Not enough' }, { selector: '.vending-display', text: '$2.00' }, { selector: '.vending-result', text: 'Condition met' }],
    [{ selector: '.payout-number', text: '$50' }],
    [{ selector: '.mango-record', text: 'Packer supplied' }, { selector: '.mango-record', text: 'Shipper supplied' }, { selector: '.mango-record', text: 'Store supplied' }, { selector: '.mango-record', text: 'M140 instead of M104' }],
    [{ selector: '.signature-result', text: 'Signature valid' }, { selector: '#credential-name', value: 'Alex MorgAn' }, { selector: '.signature-result', text: 'Check failed' }],
    [{ selector: '.tradeoff-detail', text: 'Tamper evidence' }, { selector: '.tradeoff-detail', text: 'Coordination' }, { selector: '.tradeoff-detail', text: 'Privacy' }, { selector: '.tradeoff-detail', text: 'Governance' }, { selector: '.tradeoff-detail', text: 'Correcting mistakes' }],
    [{ selector: '.decision-row.answered', count: 1 }, { selector: '.decision-row.answered', count: 2 }, { selector: '.decision-verdict', text: 'regular database' }],
    [{ selector: '.recovery-result', text: 'Help recovering access.' }, { selector: '.recovery-result', text: 'Direct control.' }],
    [{ selector: '.takeaway.is-visible', count: 1 }, { selector: '.takeaway.is-visible', count: 2 }, { selector: '.takeaway.is-visible', count: 3 }, { selector: '.takeaway.is-visible', count: 4 }],
  ];
  for (let i = 0; i < guidedSteps.length; i++) {
    const n = i + 1;
    await open(n);
    await reset();
    for (const [step, check] of guidedSteps[i].entries()) {
      await expect(page.locator('.next-button')).toHaveAttribute('aria-label', 'Next step');
      if (step % 2 === 0) await page.keyboard.press('ArrowRight');
      else await page.locator('.next-button').click();
      await expect(page.locator(`[data-slide="${n}"]`)).toBeVisible();
      if ('count' in check) await expect(page.locator(check.selector)).toHaveCount(check.count);
      else if ('value' in check) await expect(page.locator(check.selector)).toHaveValue(check.value);
      else await expect(page.locator(check.selector)).toContainText(check.text);
    }
    await expect(page.locator('.next-button')).toHaveAttribute('aria-label', n === 16 ? 'Show thank-you screen' : 'Next slide');
    if (n === 16) await expect(page.locator('.next-button')).toBeEnabled();
    for (let step = 0; step < guidedSteps[i].length; step++) {
      await expect(page.locator('.previous-button')).toHaveAttribute('aria-label', 'Previous step');
      if (step % 2 === 0) await page.keyboard.press('ArrowLeft');
      else await page.locator('.previous-button').click();
      await expect(page.locator(`[data-slide="${n}"]`)).toBeVisible();
    }
    await expect(page.locator('.previous-button')).toHaveAttribute('aria-label', 'Previous slide');
    for (const _ of guidedSteps[i]) await page.keyboard.press('PageDown');
    if (n < 16) {
      await page.locator('.next-button').click();
      await expect(page.locator(`[data-slide="${n + 1}"]`)).toBeVisible();
    }
  }

  await open(1);
  await reset();
  await page.keyboard.press('ArrowRight');
  await page.locator('.payment-option').nth(1).click();
  await expect(page.locator('.payment-option.counts')).toContainText('Sam');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-slide="2"]')).toBeVisible();
  await page.keyboard.press('Shift+ArrowLeft');
  await expect(page.locator('.payment-option.counts')).toContainText('Sam');
  await reset();
  await page.keyboard.press('Shift+ArrowRight');
  await expect(page.locator('[data-slide="2"]')).toBeVisible();
  await open(7);
  await reset();
  await page.getByLabel('Tokens in block one').fill('5');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.hash-field').first()).toContainText('STALE');
  await page.keyboard.press('PageDown');
  await expect(page.getByLabel('Tokens in block one')).toHaveValue('5');
  await expect(page.locator('.hash-bottom')).toContainText('Link mismatch');
  await page.keyboard.press('PageDown');
  await expect(page.locator('[data-slide="8"]')).toBeVisible();
  await open(10);
  await reset();
  await page.getByRole('button', { name: /^No data/ }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.payout-number')).toHaveText('?');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-slide="11"]')).toBeVisible();
  await open(14);
  await reset();
  await page.locator('.decision-row').first().getByRole('button', { name: 'No', exact: true }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-slide="15"]')).toBeVisible();
  report.interactions.push('Step navigation: all 16 forward/back sequences, Next buttons, pager keys, skip shortcuts, and manual choices');
  console.log('PASS: arrow keys and Next buttons finish each activity before changing slides');

  for (let n = 1; n <= 16; n++) {
    await open(n);
    await reset();
    await page.getByRole('button', { name: 'Reveal answer', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Answer shown', exact: true })).toBeVisible();
    await page.locator('.slide-viewport').screenshot({ path: `artifacts/verified-${String(n).padStart(2, '0')}.png` });
    const overflow = await active().evaluate((element) => {
      const outer = element.getBoundingClientRect();
      return [...element.querySelectorAll('*')].filter((child) => {
        const rect = child.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.left < outer.left - 2 || rect.right > outer.right + 2 || rect.bottom > outer.bottom + 2);
      }).map((child) => `${child.tagName}.${child.className}`);
    });
    assert.deepEqual(overflow, [], `Slide ${n} content overflow`);
    await audit(`Slide ${n}, completed`);
    await reset();
  }
  console.log('PASS: all 16 reveal/reset fallbacks; all slide content within bounds');

  await open(1);
  await page.getByRole('button', { name: 'Speaker notes', exact: true }).click();
  await audit('Speaker notes');
  for (let n = 1; n <= 16; n++) {
    await expect(page.locator('.notes-content > h3')).toHaveText(slides[n - 1].title);
    await expect(page.locator('.notes-timing')).toContainText(timeRange(slides[n - 1]));
    await expect(page.locator('.notes-content')).toContainText(slides[n - 1].fallback);
    if (n < 16) await page.getByRole('button', { name: 'Next slide notes', exact: true }).click();
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'All slides', exact: true }).click();
  await expect(page.locator('.overview-slide')).toHaveCount(16);
  await audit('Slide overview');
  await page.getByRole('button', { name: /^Open slide 7:/ }).click();
  await expect(page.locator('[data-slide="7"]')).toBeVisible();
  await page.getByRole('button', { name: 'Sources', exact: true }).click();
  await expect(page.locator('.source-list > li')).toHaveCount(14);
  await expect(page.locator('.visual-credits')).toContainText('SIL Open Font License');
  await audit('Sources');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Presentation help and keyboard shortcuts', exact: true }).click();
  await page.getByLabel('Read-through mode', { exact: true }).check();
  await page.getByLabel('Short animations', { exact: true }).uncheck();
  await audit('Presentation settings');
  await page.keyboard.press('Escape');
  await expect(page.locator('.app-shell')).toHaveClass(/no-motion/);
  for (let n = 1; n <= 16; n++) {
    await open(n);
    await expect(page.getByRole('button', { name: 'Answer shown', exact: true })).toBeVisible();
  }
  await reset();
  await page.keyboard.press('Home');
  await expect(page.locator('[data-bookend="opening"]')).toBeVisible();
  await page.screenshot({ path: 'artifacts/desktop-verified.png', fullPage: true });
  console.log('PASS: notes for all slides, overview, sources, shortcuts, motion and read-through settings');

  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport);
    for (let n = 1; n <= 16; n++) {
      await open(n);
      const bounds = await page.locator('.slide-viewport').boundingBox();
      assert.ok(Math.abs(bounds.width / bounds.height - 16 / 9) < 0.01);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(width <= viewport.width + 1, `Horizontal page overflow at ${viewport.width}`);
    }
    await page.keyboard.press('Home');
    await expect(page.locator('[data-bookend="opening"]')).toBeVisible();
    const titleBounds = await page.locator('.bookend-title').boundingBox();
    const titleViewport = await page.locator('.slide-viewport').boundingBox();
    assert.ok(titleBounds.x >= titleViewport.x && titleBounds.x + titleBounds.width <= titleViewport.x + titleViewport.width + 1, 'Opening title fits the slide');
    await verifyMinimalTitle(page);
    await page.screenshot({ path: `artifacts/responsive-${viewport.width}.png`, fullPage: true });
    report.viewports.push(viewport);
  }
  console.log('PASS: portrait mobile, landscape mobile, and projection dimensions');

  const clockPage = await context.newPage();
  await clockPage.clock.install({ time: new Date('2025-01-01T00:00:00Z') });
  await clockPage.goto(url);
  await clockPage.getByRole('button', { name: 'Present', exact: true }).click();
  await expect(clockPage.locator('[data-bookend="opening"]')).toBeVisible();
  await expect(clockPage.locator('.deck-controls')).toBeHidden();
  await expect(clockPage.locator('.app-footer')).toBeHidden();
  await expect(clockPage.locator('.app-header')).toBeHidden();
  await expect(clockPage.locator('.presenter-bar')).toHaveCount(0);
  assert.equal(await clockPage.locator('.presentation-tools-trigger').evaluate((element) => getComputedStyle(element).opacity), '0');
  assert.equal(await clockPage.locator('.app-shell').evaluate((element) => getComputedStyle(element).backgroundColor), 'rgb(0, 0, 0)');
  await verifyMinimalTitle(clockPage);
  const presentationBounds = await clockPage.locator('.slide-viewport').boundingBox();
  assert.ok(Math.abs(presentationBounds.width - 1440) < 1);
  assert.ok(Math.abs(presentationBounds.height - 810) < 1);
  await clockPage.screenshot({ path: 'artifacts/presentation-slide-only.png', fullPage: true });
  await clockPage.clock.fastForward(30000);
  await expect(clockPage.locator('[data-bookend="opening"]')).toBeVisible();
  await clockPage.keyboard.press('?');
  await expect(clockPage.locator('.timer')).toHaveText('0:00 / 20:00');
  await expect(clockPage.locator('.clock-status')).toHaveText('Waiting to begin');
  await expect(clockPage.getByRole('button', { name: 'Resume presentation clock', exact: true })).toBeDisabled();
  await clockPage.keyboard.press('Escape');
  await clockPage.getByRole('button', { name: 'Begin the talk', exact: true }).click();
  await expect(clockPage.locator('[data-slide="1"]')).toBeVisible();
  await clockPage.getByRole('button', { name: 'Copy the $10', exact: true }).click();
  await expect(clockPage.locator('.intro-result')).toContainText('Which payment should count?');
  await expect(clockPage.locator('[data-slide="1"]')).toBeVisible();
  await clockPage.locator('.intro-description').click();
  await expect(clockPage.locator('.intro-result')).toContainText('One payment counts.');
  await expect(clockPage.locator('[data-slide="1"]')).toBeVisible();
  await clockPage.clock.fastForward(69000);
  await expect(clockPage.locator('[data-slide="1"]')).toBeVisible();
  await clockPage.getByRole('button', { name: 'Presentation controls and settings', exact: true }).click();
  await expect(clockPage.getByLabel('Auto pace', { exact: true })).toBeChecked();
  const presentationA11y = await new AxeBuilder({ page: clockPage }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.equal(presentationA11y.violations.length, 0, JSON.stringify(presentationA11y.violations));
  await clockPage.getByRole('button', { name: 'Pause presentation clock', exact: true }).click();
  const paused = await clockPage.locator('.timer').textContent();
  await clockPage.clock.fastForward(10000);
  await expect(clockPage.locator('.timer')).toHaveText(paused);
  await clockPage.getByRole('button', { name: 'Resume presentation clock', exact: true }).click();
  for (const slide of slides.slice(1)) {
    const text = await clockPage.locator('.timer').textContent();
    const [minutes, seconds] = text.split('/')[0].trim().split(':').map(Number);
    const delta = slide.start - (minutes * 60 + seconds);
    await clockPage.clock.fastForward(delta * 1000 + 30);
    await expect(clockPage.locator(`[data-slide="${slide.id}"]`)).toBeVisible();
    report.timing.push({ slide: slide.id, start: slide.start, verified: true });
  }
  await clockPage.clock.fastForward(60000);
  await expect(clockPage.locator('.timer')).toHaveText('20:00 / 20:00');
  await expect(clockPage.locator('.clock-status')).toHaveText('Talk complete');
  await expect(clockPage.locator('[data-bookend="closing"]')).toBeVisible();
  await expect(clockPage.locator('.bookend-closing-question')).toBeVisible();
  await expect(clockPage.getByRole('button', { name: 'Resume presentation clock', exact: true })).toBeDisabled();
  await clockPage.getByRole('button', { name: 'Exit presentation', exact: true }).click();
  await expect(clockPage.locator('.app-shell')).not.toHaveClass(/is-presenting/);
  await expect(clockPage.locator('.deck-controls')).toBeVisible();
  await expect(clockPage.locator('.app-footer')).toBeVisible();
  await clockPage.getByRole('button', { name: 'Present', exact: true }).click();
  await clockPage.keyboard.press('PageDown');
  await expect(clockPage.locator('[data-slide="1"]')).toBeVisible();
  await clockPage.clock.fastForward(1000);
  await clockPage.getByRole('button', { name: 'Presentation controls and settings', exact: true }).click();
  await expect(clockPage.locator('.timer')).toContainText('0:01 / 20:00');
  await expect(clockPage.getByLabel('Auto pace', { exact: true })).toBeChecked();
  await clockPage.keyboard.press('Escape');
  await clockPage.keyboard.press('ArrowRight');
  await expect(clockPage.locator('[data-slide="1"]')).toBeVisible();
  await expect(clockPage.locator('.intro-result')).toContainText('Two copies.');
  await clockPage.keyboard.press('ArrowRight');
  await expect(clockPage.locator('[data-slide="1"]')).toBeVisible();
  await expect(clockPage.locator('.intro-result')).toContainText('One payment counts.');
  await clockPage.keyboard.press('ArrowRight');
  await expect(clockPage.locator('[data-slide="2"]')).toBeVisible();
  await clockPage.getByRole('button', { name: 'Presentation controls and settings', exact: true }).click();
  await expect(clockPage.getByLabel('Auto pace', { exact: true })).not.toBeChecked();
  await clockPage.getByLabel('Auto pace', { exact: true }).check();
  await expect(clockPage.locator('[data-slide="1"]')).toBeVisible();
  await clockPage.keyboard.press('Escape');
  await expect(clockPage.locator('.app-shell')).toHaveClass(/is-presenting/);
  await clockPage.keyboard.press('Escape');
  await expect(clockPage.locator('.app-shell')).not.toHaveClass(/is-presenting/);
  await clockPage.close();
  console.log('PASS: untimed opening, slide-only mode, unchanged 20:00 lesson, and automatic thank-you screen');

  const motionContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, offline: true, reducedMotion: 'no-preference' });
  const motionPage = await motionContext.newPage();
  motionPage.on('pageerror', (error) => errors.push(error.message));
  motionPage.on('request', (request) => { if (/^https?:/.test(request.url())) remoteRequests.push(request.url()); });
  await motionPage.goto(url);
  await motionPage.evaluate(() => document.fonts.ready);
  await expect(motionPage.locator('.bookend-word')).toHaveText('BLOCKCHAIN');
  await expect(motionPage.locator('.bookend-description')).toHaveText('The architecture of digital trust');
  await verifyMinimalTitle(motionPage);
  await expect(motionPage.locator('.ambient-speck')).toHaveCount(8);
  assert.equal(await motionPage.locator('.ambient-speck').first().evaluate((element) => getComputedStyle(element).animationName), 'ambient-drift');
  await expect(motionPage.locator('.bookend-opening .glitch-slice')).toHaveCount(0);
  assert.equal(await motionPage.locator('.bookend-title').evaluate((element) => getComputedStyle(element).animationName), 'none');
  assert.equal(await motionPage.locator('.bookend-title').evaluate((element) => element.getAnimations({ subtree: true }).length), 0, 'The opening text is completely static while its background animates');
  const scan = await motionPage.locator('.ambient-scan').evaluate((element) => {
    const animation = element.getAnimations()[0];
    return { duration: animation.effect.getTiming().duration, opacity: Math.max(...animation.effect.getKeyframes().map((frame) => Number(frame.opacity))) };
  });
  assert.equal(scan.duration, 16000);
  assert.ok(scan.opacity <= 0.03, 'The background scan remains barely visible');
  const signalBefore = await motionPage.locator('.ambient-speck').first().evaluate((element) => getComputedStyle(element).transform);
  await motionPage.waitForTimeout(300);
  const signalAfter = await motionPage.locator('.ambient-speck').first().evaluate((element) => getComputedStyle(element).transform);
  assert.notEqual(signalBefore, signalAfter, 'The minimal background moves gently');
  await motionPage.screenshot({ path: 'artifacts/opening-animated.png', fullPage: true });
  await motionPage.keyboard.press('m');
  await expect(motionPage.locator('[data-bookend="opening"]')).toBeVisible();
  assert.equal(await motionPage.locator('.ambient-speck').first().evaluate((element) => getComputedStyle(element).animationName), 'none');
  assert.equal(await motionPage.locator('.ambient-scan').evaluate((element) => getComputedStyle(element).animationName), 'none');
  await expect(motionPage.locator('.bookend-opening .glitch-slice')).toHaveCount(0);
  await motionPage.keyboard.press('m');
  assert.equal(await motionPage.locator('.ambient-speck').first().evaluate((element) => getComputedStyle(element).animationName), 'ambient-drift');
  const oldVisual = await motionPage.locator('.bookend-visual').elementHandle();
  await motionPage.keyboard.press('r');
  await expect.poll(() => oldVisual.evaluate((element) => element.isConnected)).toBe(false);
  await expect(motionPage.locator('[data-bookend="opening"]')).toBeVisible();
  await motionPage.emulateMedia({ reducedMotion: 'reduce' });
  await expect(motionPage.locator('.bookend-screen')).toHaveClass(/effects-paused/);
  assert.equal(await motionPage.locator('.ambient-speck').first().evaluate((element) => getComputedStyle(element).animationName), 'none');
  await expect(motionPage.locator('.ambient-scan')).toBeHidden();
  await expect(motionPage.locator('.bookend-word')).toHaveText('BLOCKCHAIN');
  await motionPage.emulateMedia({ reducedMotion: 'no-preference' });
  await motionPage.keyboard.press('End');
  await expect(motionPage.locator('[data-bookend="closing"]')).toBeVisible();
  await expect(motionPage.locator('.bookend-word')).toHaveText('THANK YOU');
  await expect(motionPage.locator('.bookend-description')).toHaveText('Do we need it?');
  await verifyMinimalTitle(motionPage);
  assert.equal(await motionPage.locator('.glitch-slice-top').evaluate((element) => getComputedStyle(element).animationName), 'title-glitch-top');
  await motionPage.screenshot({ path: 'artifacts/thank-you-animated.png', fullPage: true });
  await motionPage.getByRole('button', { name: 'Speaker notes', exact: true }).click();
  await expect(motionPage.getByRole('dialog', { name: 'Closing notes', exact: true })).toBeVisible();
  await motionPage.keyboard.press('Escape');
  await motionPage.keyboard.press('Home');
  await expect(motionPage.locator('[data-bookend="opening"]')).toBeVisible();
  await motionContext.close();
  report.interactions.push('Minimal bookends: exact requested subtitles, static BLOCKCHAIN text without glitch layers or text animations, faint background scan, keyboard pause/resume/replay, and reduced motion');
  console.log('PASS: static BLOCKCHAIN title, unchanged subtitles, subtle background, and reduced-motion controls');

  const fallbackContext = await browser.newContext({ javaScriptEnabled: false, offline: true });
  const guide = await fallbackContext.newPage();
  await guide.goto(pathToFileURL(resolve('dist/presenter-guide.html')).href);
  await expect(guide.locator('article[data-slide]')).toHaveCount(16);
  await expect(guide.getByText('Non-interactive fallback', { exact: true })).toHaveCount(16);
  await expect(guide.locator('#sources .source-entry')).toHaveCount(14);
  await guide.goto(url);
  await expect(guide.getByRole('link', { name: 'Open the non-interactive presenter guide' })).toBeVisible();
  await guide.getByRole('link', { name: 'Open the non-interactive presenter guide' }).click();
  await expect(guide.locator('article[data-slide]')).toHaveCount(16);
  await fallbackContext.close();
  console.log('PASS: fully offline guide and JavaScript-disabled fallback');

  assert.deepEqual(errors, [], 'Browser runtime errors');
  assert.deepEqual(remoteRequests, [], 'Unexpected network requests');
  await writeFile('artifacts/verification.json', JSON.stringify(report, null, 2));
  console.log(`Accessibility findings: ${report.accessibility.length}; details: artifacts/verification.json`);
  assert.equal(report.accessibility.length, 0, 'WCAG A/AA accessibility findings need attention');
  console.log('PASS: zero runtime errors, zero network requests, zero automated A/AA accessibility violations');
} finally {
  await writeFile('artifacts/verification.json', JSON.stringify(report, null, 2));
  await browser.close();
}