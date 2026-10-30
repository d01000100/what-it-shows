// Splits a merged ticket into the problems its reports describe. causes.ts tells parser from hint
// by tenant; the desk's one-day list (desk-notes.json) names reports that are neither.
import { causeOf, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day move';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | null {
  if (oneDayMove.includes(r.id)) return 'one-day move';
  return causeOf(r, t);
}

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { groups: ProblemGroup[]; unplaced: Report[] } {
  const byProblem = new Map<Problem, Report[]>();
  const unplaced: Report[] = [];
  for (const r of reports) {
    const problem = problemOf(r, tenantOf(r), oneDayMove);
    if (problem === null) {
      unplaced.push(r);
      continue;
    }
    byProblem.set(problem, [...(byProblem.get(problem) ?? []), r]);
  }
  const groups = [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { groups, unplaced };
}
