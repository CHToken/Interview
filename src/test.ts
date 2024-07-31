import { monthlyCharge, User, Subscription } from "./index";

const plan = {
  id: 1,
  customerId: 1,
  monthlyPriceInCents: 5000,
};

describe("monthlyCharge", function () {
  it("works when no users are active", function () {
    const noActiveUsers: User[] = [];
    expect(monthlyCharge("2018-10", plan, noActiveUsers)).toBe(0);
  });

  it("works when the active users are active the entire month", function () {
    const users = [
      {
        id: 1,
        name: "Employee #1",
        activatedOn: new Date("2019-01-01"),
        deactivatedOn: null,
        customerId: 1,
      },
      {
        id: 2,
        name: "Employee #2",
        activatedOn: new Date("2019-01-01"),
        deactivatedOn: null,
        customerId: 1,
      },
    ];
    const expectedUserCount = 2;
    const monthlyPriceInCents = plan.monthlyPriceInCents;
    const daysInDecember2020 = 31; // December has 31 days
    const dailyRate = Math.round(monthlyPriceInCents / daysInDecember2020);
    const expectedCharge = expectedUserCount * dailyRate * daysInDecember2020;

    expect(monthlyCharge("2020-12", plan, users)).toBe(expectedCharge);
  });

  it("works when a user is activated and deactivated within the same month", function () {
    const users = [
      {
        id: 1,
        name: "Employee #1",
        activatedOn: new Date("2022-04-05"),
        deactivatedOn: new Date("2022-04-10"),
        customerId: 1,
      },
    ];
    const monthlyPriceInCents = plan.monthlyPriceInCents;
    const daysInApril2022 = 30; // April has 30 days
    const dailyRate = Math.round(monthlyPriceInCents / daysInApril2022);
    const activeDays = 6; // inclusive of both activation and deactivation days
    const expectedCharge = dailyRate * activeDays;

    expect(monthlyCharge("2022-04", plan, users)).toBe(expectedCharge);
  });

  it("works when a user is activated before the month and deactivated within the month", function () {
    const users = [
      {
        id: 1,
        name: "Employee #1",
        activatedOn: new Date("2022-03-15"),
        deactivatedOn: new Date("2022-04-10"),
        customerId: 1,
      },
    ];
    const dailyRate = Math.round(plan.monthlyPriceInCents / 30); // April has 30 days
    const activeDays = 10; // inclusive of both activation and deactivation days
    expect(monthlyCharge("2022-04", plan, users)).toBe(dailyRate * activeDays);
  });

  it("works when a user is activated and deactivated on the same day", function () {
    const users = [
      {
        id: 1,
        name: "Employee #1",
        activatedOn: new Date("2022-04-10"),
        deactivatedOn: new Date("2022-04-10"),
        customerId: 1,
      },
    ];
    const monthlyPriceInCents = plan.monthlyPriceInCents;
    const daysInApril2022 = 30; // April has 30 days
    const dailyRate = Math.round(monthlyPriceInCents / daysInApril2022);
    const activeDays = 1; // inclusive of both activation and deactivation days
    const expectedCharge = dailyRate * activeDays;

    expect(monthlyCharge("2022-04", plan, users)).toBe(expectedCharge);
  });

  it("returns 0 when no subscription is provided", function () {
    const users = [
      {
        id: 1,
        name: "Employee #1",
        activatedOn: new Date("2022-04-01"),
        deactivatedOn: null,
        customerId: 1,
      },
    ];
    expect(monthlyCharge("2022-04", null, users)).toBe(0);
  });

  it("returns 0 when users array is empty", function () {
    const emptyUsers: User[] = [];
    expect(monthlyCharge("2022-04", plan, emptyUsers)).toBe(0);
  });

  it("works for users with long-term activation spanning multiple months", function () {
    const users = [
      {
        id: 1,
        name: "Employee #1",
        activatedOn: new Date("2021-06-01"),
        deactivatedOn: null,
        customerId: 1,
      },
    ];
    const dailyRate = Math.round(plan.monthlyPriceInCents / 30); // Assuming 30 days for simplicity
    const activeDays = 30; // Full month
    expect(monthlyCharge("2022-04", plan, users)).toBe(dailyRate * activeDays);
  });

  it("works when a user is activated before the month and deactivated after the month", function () {
    const users = [
      {
        id: 1,
        name: "Employee #1",
        activatedOn: new Date("2022-03-15"),
        deactivatedOn: new Date("2022-05-10"),
        customerId: 1,
      },
    ];
    const dailyRate = Math.round(plan.monthlyPriceInCents / 30); // April has 30 days
    const activeDays = 30; // Full month
    expect(monthlyCharge("2022-04", plan, users)).toBe(dailyRate * activeDays);
  });

  it("works with multiple users having overlapping activation and deactivation dates", function () {
    const users = [
      {
        id: 1,
        name: "Employee #1",
        activatedOn: new Date("2022-04-01"),
        deactivatedOn: new Date("2022-04-15"),
        customerId: 1,
      },
      {
        id: 2,
        name: "Employee #2",
        activatedOn: new Date("2022-04-10"),
        deactivatedOn: new Date("2022-04-20"),
        customerId: 1,
      },
      {
        id: 3,
        name: "Employee #3",
        activatedOn: new Date("2022-03-25"),
        deactivatedOn: null,
        customerId: 1,
      },
    ];
    const dailyRate = Math.round(plan.monthlyPriceInCents / 30); // April has 30 days
    const activeDaysUser1 = 15; // April 1 to 15
    const activeDaysUser2 = 11; // April 10 to 20
    const activeDaysUser3 = 30; // Full month
    const expectedCharge =
      dailyRate * (activeDaysUser1 + activeDaysUser2 + activeDaysUser3);
    expect(monthlyCharge("2022-04", plan, users)).toBe(expectedCharge);
  });

  it("works when a user is activated and deactivated in different months", function () {
    const users = [
      {
        id: 1,
        name: "Employee #1",
        activatedOn: new Date("2022-03-15"),
        deactivatedOn: new Date("2022-04-15"),
        customerId: 1,
      },
    ];
    const dailyRate = Math.round(plan.monthlyPriceInCents / 30); // April has 30 days
    const activeDays = 15; // April 1 to 15
    expect(monthlyCharge("2022-04", plan, users)).toBe(dailyRate * activeDays);
  });

  it("works when a user is activated and deactivated in different months with partial overlap", function () {
    const users = [
      {
        id: 1,
        name: "Employee #1",
        activatedOn: new Date("2022-03-25"),
        deactivatedOn: new Date("2022-04-05"),
        customerId: 1,
      },
    ];
    const dailyRate = Math.round(plan.monthlyPriceInCents / 30); // April has 30 days
    const activeDays = 5; // April 1 to 5
    expect(monthlyCharge("2022-04", plan, users)).toBe(dailyRate * activeDays);
  });

  it('returns 0 when user is deactivated in a previous month', function() {
    const users = [
      {
        id: 1,
        name: 'Employee #1',
        activatedOn: new Date('2022-03-01'),
        deactivatedOn: new Date('2022-03-31'),
        customerId: 1,
      },
    ];
    expect(monthlyCharge('2022-04', plan, users)).toBe(0);
  });

  it('returns 0 when user is activated in the month but deactivated before the month starts', function() {
    const users = [
      {
        id: 1,
        name: 'Employee #1',
        activatedOn: new Date('2022-04-01'),
        deactivatedOn: new Date('2022-03-31'),
        customerId: 1,
      },
    ];
    expect(monthlyCharge('2022-04', plan, users)).toBe(0);
  });

  it('returns 0 if subscription has zero price', function() {
    const zeroPricePlan = { ...plan, monthlyPriceInCents: 0 };
    const users = [
      {
        id: 1,
        name: 'Employee #1',
        activatedOn: new Date('2022-04-01'),
        deactivatedOn: null,
        customerId: 1,
      },
    ];
    expect(monthlyCharge('2022-04', zeroPricePlan, users)).toBe(0);
  });

});
