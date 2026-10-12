# Python regex for parsing log timestamps

*Exported: 1735708800*

## User

This is sample data generated to demonstrate chat-export-pro - not a real conversation. With that said, here is my question: I have application logs like '2026-01-14 09:31:07.412 INFO  Starting worker 3' and I need a regex that captures the date, time, milliseconds and level separately.

## Assistant

Happy to help with your fictional log format. A single regex with named groups does it:

```python
import re

LOG_RE = re.compile(
    r"^(?P<date>\d{4}-\d{2}-\d{2})\s+"
    r"(?P<time>\d{2}:\d{2}:\d{2})\.(?P<ms>\d{3})\s+"
    r"(?P<level>[A-Z]+)\s+(?P<msg>.*)$"
)

m = LOG_RE.match("2026-01-14 09:31:07.412 INFO  Starting worker 3")
print(m.groupdict())
```

- `date` and `time` stay as strings until you need real datetimes.
- `ms` is separate so you can zero-pad or drop it when aggregating.
- `level` is uppercase-only (`[A-Z]+`) so it won't swallow the message.

For millions of lines, `re.finditer` over the file beats line-by-line matching because it avoids building intermediate lists.

## User

What if some lines are WARN or CRITICAL, and some lines have no timestamp at all, like a plain stack trace?

## Assistant

Use `finditer` and skip non-matching lines instead of erroring on them:

```python
for line in open("app.log"):
    m = LOG_RE.match(line)
    if m is None:
        continue  # stack traces, blank lines, etc.
    record = m.groupdict()
```

If you want the untimestamped lines attached to the previous record, keep a `last_record` variable and append continuation lines to it - that keeps multi-line exceptions grouped with the entry that caused them.
