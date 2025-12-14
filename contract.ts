/**
 * Contract guards - ensures endpoints follow specifications
 */

export function assertMinutesField(name: string, value: unknown) {
  if (value === null || value === undefined) return;
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${name} must be a number (minutes)`);
  }
  // grov sanity: minuter ska inte vara 0.2 eller 1.7 om någon råkat skicka timmar
  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be integer minutes (got non-integer)`);
  }
}

export function assertBacklogCountMatchesStatuses(args: {
  backlogCount: number;
  statusesSeen: number[];
}) {
  // Om någon matar in status 4/5 och ändå kallar det backlog => fail i test, inte produktion.
  const bad = args.statusesSeen.filter((s) => s === 4 || s === 5);
  if (bad.length > 0 && args.backlogCount > 0) {
    throw new Error(`Backlog included resolved/closed statuses: ${bad.join(',')}`);
  }
}
