# SQL query: top 5 customers by 90-day revenue

*Exported: 1735881600*

## User

This is sample data generated to demonstrate chat-export-pro - not a real conversation. Imaginary schema: customers(id, name) and orders(id, customer_id, total_cents, created_at). Write a query for the top 5 customers by revenue in the last 90 days.

## Assistant

Assuming PostgreSQL and totals stored in cents:

```sql
SELECT c.id,
       c.name,
       SUM(o.total_cents) / 100.0 AS revenue_90d
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= now() - interval '90 days'
GROUP BY c.id, c.name
ORDER BY revenue_90d DESC
LIMIT 5;
```

Notes:

- Dividing by `100.0` keeps cents out of rounding errors; casting to `money` happens in the presentation layer.
- For a repeating report, replace `now()` with a parameter so the window is pinned at run time.
- If `orders` has cancelled rows, filter them in the `WHERE` clause before the `SUM`, not after.

## User

It is slow on our data - about 40 seconds. What index should I add?

## Assistant

The filter is on `orders.created_at` and the join is on `customer_id`, so one composite index covers both:

```sql
CREATE INDEX idx_orders_created_customer
    ON orders (created_at, customer_id)
    INCLUDE (total_cents);
```

`INCLUDE (total_cents)` makes it a covering index for this query, so the aggregate never touches the heap. On a table with tens of millions of rows that typically takes the query from tens of seconds to well under a second. Run `EXPLAIN (ANALYZE, BUFFERS)` before and after to confirm the plan switched from a seq scan to an index scan.
