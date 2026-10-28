# iPhone Shortcuts

The app has a small API so Shortcuts can log transactions and check money
left without opening the app.

## 1. Get your address and token

In the app: **Settings → API tokens**.

- **API address**: copy it. It looks like
  `https://<project-ref>.supabase.co/functions/v1/api/v1`.
- **Create token**: name it (e.g. "iPhone") and copy the token (`pfa_…`). It's
  shown once. If you lose it, revoke it and create a new one.

Every request sends the token in a header:

```
Authorization: Bearer pfa_…
```

Tip: in each Shortcut, put the address and token in two **Text** actions at the
top, so they're easy to update.

## 2. Build the Shortcuts

All of them use the **Get Contents of URL** action:

- **URL**: the API address + the endpoint, e.g. `…/api/v1/card-transactions`
- **Method**: GET or POST
- **Headers**: `Authorization` = `Bearer ` + your token
- **Request Body**: JSON (POST only)

Add `?format=text` to any URL to get back one plain sentence, ready for
**Show Result** or **Speak Text**.

### Log a card purchase

1. **Get Contents of URL**: GET `…/info`
2. **Get Dictionary Value**: `cards` → **Repeat with Each** → `name` →
   **Choose from List** ("Which card?")
3. **Get Dictionary Value**: `categories` → `path` → **Choose from List**
   ("Category?")
4. **Ask for Input**: Number, "Amount?"
5. **Ask for Input**: Text, "Where?"
6. **Get Contents of URL**: POST `…/card-transactions?format=text`, JSON body:
   `card` = chosen card, `amount` = amount, `category` = chosen category,
   `merchant` = where
7. **Show Result**

### How much do I have left?

1. **Get Contents of URL**: GET `…/money-left?format=text`
2. **Speak Text** (or **Show Result**)

For one account: `…/money-left?account=fun&format=text`.

### Deposit / Withdraw

Same as the card purchase, using `accounts` from `/info` and POSTing to
`/deposits` or `/withdrawals` with `account` and `amount`. Category is
optional.

### Move money

POST `/transfers` with `from`, `to` and `amount`. Only between checking and
savings; card payments are made in the app.

## 3. Log Apple Pay purchases automatically

Shortcuts → **Automation** → **+** → **Transaction**.

1. Choose your cards and **Run Immediately**.
2. Add **Get Contents of URL**: POST `…/card-transactions?format=text` with:
   - `card` = Shortcut Input → **Card or Pass** name
   - `amount` = Shortcut Input → **Amount**
   - `merchant` = Shortcut Input → **Merchant**
   - `category` = see below
3. **Show Notification** with the result.

In the app, set each card's **Apple Wallet name** to the name Wallet shows (edit
the card), so `card` matches it.

**Category is required for card transactions.** Either:

- Add a **Choose from List** of categories before the request (the automation
  then asks you to tap a notification), or
- Use a **Dictionary** that maps merchants to categories (e.g.
  `Trader Joe's` → `Food/Groceries`) with a fallback like `Other`.

## Endpoint reference

`card`, `account`, `from` and `to` accept an account's name, short name, Apple
Wallet name or id, ignoring case. `category` accepts a name or
`Parent/Child` path; use the path when two subcategories share a name. Amounts
are positive dollars, as a number or text (`12.5`, `"$1,204.30"`). `date` is
`YYYY-MM-DD` and defaults to today.

| Method | Path | Body |
|---|---|---|
| POST | `/card-transactions` | `card`, `amount`, `category`, `merchant`, `type`? (`charge` or `refund`, default `charge`), `description`?, `date`? |
| POST | `/deposits` | `account`, `amount`, `category`?, `description`?, `date`? |
| POST | `/withdrawals` | same as deposits; recorded as money out |
| POST | `/transfers` | `from`, `to`, `amount`, `note`?, `date`? |
| GET | `/info` | — returns `accounts`, `cards`, `categories` |
| GET | `/money-left` | `account`? (query) — returns each account's money left |

Responses are JSON with a `message` sentence plus the data. Errors are JSON
`{ "error": "…" }` with status 400 (something to fix in the request), 401 (bad
token), or 404 (no such account or category). With `?format=text`, both come
back as a plain sentence.

### Try it from a terminal

```sh
API=https://<project-ref>.supabase.co/functions/v1/api/v1
TOKEN=pfa_...

curl -s "$API/money-left?format=text" -H "Authorization: Bearer $TOKEN"

curl -s "$API/card-transactions" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"card": "vx", "amount": 54.12, "category": "Shopping/Clothing", "merchant": "Uniqlo"}'
```
