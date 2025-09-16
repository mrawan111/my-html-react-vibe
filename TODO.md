# TODO: Make Dashboard Dynamically Calculate Sales of Vouchers Exported and Remove Static Data

## Tasks
- [ ] Import additional hooks: useSalesStats, useWeeklyStats, useMonthlyStats, useActiveUsers
- [ ] Replace static salesTrendData with dynamic data from useMonthlyStats
- [ ] Replace static weeklyUsageData with dynamic data from useWeeklyStats
- [ ] Replace static cardStatusData with dynamic voucher status counts from useVouchers
- [ ] Replace static activeUsersData with dynamic data from useActiveUsers
- [ ] Replace hardcoded quick stats (total cards sold, average daily usage, usage percentage) with dynamic calculations from vouchers and sales data
- [ ] Test the dashboard to ensure all dynamic data loads correctly
