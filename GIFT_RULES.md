# Gift and birthday rules

- XP level discount applies only to normal cart items.
- The selected gift item stays at **cost price**.
- The gift item is not discounted again by the level discount.
- Level 10 gift: one-time redemption per account.
- Birthday gift: one redemption per year per account.
- Birthday changes: only once per year per account.

## Anti-abuse

The app also stores a checkout fingerprint so the same browser/session cannot reuse the gift across different accounts.

For a real backend, this should be enforced with server-side IP/session checks. The frontend fingerprint is the current app-level safeguard.
