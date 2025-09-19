# TODO: Make Dashboard Dynamically Calculate Sales of Vouchers Exported and Remove Static Data

## Tasks
- [ ] Import additional hooks: useSalesStats, useWeeklyStats, useMonthlyStats, useActiveUsers
- [ ] Replace static salesTrendData with dynamic data from useMonthlyStats
- [ ] Replace static weeklyUsageData with dynamic data from useWeeklyStats
- [ ] Replace static cardStatusData with dynamic voucher status counts from useVouchers
- [ ] Replace static activeUsersData with dynamic data from useActiveUsers
- [ ] Replace hardcoded quick stats (total cards sold, average daily usage, usage percentage) with dynamic calculations from vouchers and sales data
- [ ] Test the dashboard to ensure all dynamic data loads correctly

## Completed: Enhanced Voucher Generation Performance

### Tasks Completed
- [x] Added batch creation method in MikrotikService (createHotspotUsersBatch)
- [x] Added batch creation route in backend/routes/mikrotik.js (/hotspot/users/create-batch)
- [x] Added batch creation method in frontend MikroTikAPI (createHotspotUsersBatch)
- [x] Implemented validation for up to 200 users in batch
- [x] Enhanced error handling and connection management for batch operations
- [x] Reduced connection overhead by using single connection for multiple user creation
