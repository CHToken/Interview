export interface User {
  id: number;
  name: string;
  activatedOn: Date;
  deactivatedOn: Date | null;
  customerId: number;
}

export interface Subscription {
  id: number;
  customerId: number;
  monthlyPriceInCents: number;
}

/**
 * Computes the monthly charge for a given subscription.
 *
 * @returns The total monthly bill for the customer in cents, rounded
 * to the nearest cent. For example, a bill of $20.00 should return 2000.
 * If there are no active users or the subscription is null, returns 0.
 *
 * @param month - Always present
 *   Has the following structure:
 *   "2022-04"  // April 2022 in YYYY-MM format
 *
 * @param subscription - May be null
 *   If present, has the following structure (see Subscription interface):
 *   {
 *     'id': 763,
 *     'customerId': 328,
 *     'monthlyPriceInCents': 359  // price per active user per month
 *   }
 *
 * @param users - May be empty, but not null
 *   Has the following structure (see User interface):
 *   [
 *     {
 *       id: 1,
 *       name: "Employee #1",
 *       customerId: 1,
 *   
 *       // when this user started
 *       activatedOn: new Date("2021-11-04"),
 *   
 *       // last day to bill for user
 *       // should bill up to and including this date
 *       // since user had some access on this date
 *       deactivatedOn: new Date("2022-04-10")
 *     },
 *     {
 *       id: 2,
 *       name: "Employee #2",
 *       customerId: 1,
 *   
 *       // when this user started
 *       activatedOn: new Date("2021-12-04"),
 *   
 *       // hasn't been deactivated yet
 *       deactivatedOn: null
 *     },
 *   ]
 */
export function monthlyCharge(yearMonth: string, subscription: Subscription | null, users: User[]): number {
  if (!subscription) return 0;

  const [year, month] = yearMonth.split('-').map(Number);
  const firstDay = firstDayOfMonth(new Date(year, month - 1, 1));
  const lastDay = lastDayOfMonth(new Date(year, month - 1, 1));
  const daysInMonth = lastDay.getDate();

  const dailyRate = Math.round(subscription.monthlyPriceInCents / daysInMonth);
  let totalCharge = 0;

  console.log(`Daily Rate: ${dailyRate}`);

  users.forEach(user => {
    const activationDate = new Date(user.activatedOn);
    const deactivationDate = user.deactivatedOn ? new Date(user.deactivatedOn) : lastDay;

    // Ensure activation and deactivation dates fall within the month
    const startOfMonth = new Date(firstDay);
    const endOfMonth = new Date(lastDay);

    const activeFrom = activationDate > startOfMonth ? activationDate : startOfMonth;
    const activeUntil = deactivationDate < endOfMonth ? deactivationDate : endOfMonth;

    if (activeFrom <= activeUntil) {
      // Calculate number of active days
      const activeDays = Math.floor((activeUntil.getTime() - activeFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      console.log(`Active Days: ${activeDays}`);
      totalCharge += activeDays * dailyRate;
    }
  });

  console.log(`Total Charge: ${totalCharge}`);
  return totalCharge;
}




/*******************
* Helper functions *
*******************/

/**
  Takes a Date instance and returns a Date which is the first day
  of that month. For example:

  firstDayOfMonth(new Date(2022, 3, 17)) // => new Date(2022, 3, 1)

  Input type: Date
  Output type: Date
**/
function firstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
  Takes a Date object and returns a Date which is the last day
  of that month. For example:

  lastDayOfMonth(new Date(2022, 3, 17)) // => new Date(2022, 3, 31)

  Input type: Date
  Output type: Date
**/
function lastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
  Takes a Date object and returns a Date which is the next day.
  For example:

  nextDay(new Date(2022, 3, 17)) // => new Date(2022, 3, 18)
  nextDay(new Date(2022, 3, 31)) // => new Date(2022, 4, 1)

  Input type: Date
  Output type: Date
**/
function nextDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}
