<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, type Problem } from '#lib/kb/problems';

  // Where each problem is tracked now: problem → ticket link.
  let { ticket, tickets }: { ticket: number; tickets: Record<Problem, { label: string; href: string }> } = $props();

  const rows = $derived(uniqueById(reports as Report[]));
  const merged = $derived(rows.filter((r) => r.mergedInto === ticket));
  const split = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
  const repeats = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket).length - merged.length);
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td><a href={tickets[g.problem].href}>{tickets[g.problem].label}</a></td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">
  {repeats} rows in the export repeat a report already counted, so each report is counted once.
  {#if split.unplaced.length}
    {split.unplaced.length} reports have no tenant on file and fit no problem yet.
  {/if}
</p>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
