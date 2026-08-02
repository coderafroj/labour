# LabourConnect

Ek marketplace jahan log apne sheher ke verified kaamgaar (mistri, electrician,
plumber, painter, driver, aadi) dhundh sakte hain, aur kaamgaar khud apni free
profile bana sakte hain. Bilkul Uber/Rapido ki tarah — sirf gaadi ki jagah
haath ka kaam.

## Kamai kaise hoti hai (business model)

Teeno tareeke ek saath, sab `src/lib/constants.js` ke `PRICING` object mein
control hote hain:

| Tareeka | Kaun deta hai | Kitna | Kab |
|---|---|---|---|
| **Contact Unlock** | Client | Rs 19 | Jab kisi kaamgaar ka number/address dekhna ho (30 din tak valid) |
| **Featured Listing** | Kaamgaar | Rs 99 | Apni category mein 30 din tak sabse upar dikhne ke liye |
| **Booking Commission** | Kaamgaar | 8% (min Rs 10) | Jab booking complete ho aur final amount tay ho |

Ye teeno numbers `PRICING` object se change kar sakte ho — code mein kahin
aur hardcoded nahi hain (Appwrite Function mein bhi environment variable se
aate hain).

## Kyun secure hai — important design decision

**Phone number aur address kabhi bhi seedhe database se browser ko nahi
milte.** Ye do collections mein bant diya gaya hai:

- `labourers` — public info (naam, category, sheher, rate, photo). Koi bhi
  padh sakta hai.
- `labourer_private` — sirf phone + address. Sirf us kaamgaar ka apna account
  aur admin ise padh sakte hain.

Jab koi client Rs 19 pay karke number dekhna chahta hai, browser seedha
database nahi padhta — ek **Appwrite Function** (`get-labourer-contact`)
server-side check karta hai ki us user ka koi "paid" payment record hai ya
nahi, tabhi jaake number deta hai. Isi tarah, Razorpay ka secret key kabhi
browser mein nahi jaata — order banana aur payment verify karna dono
Functions ke andar hota hai. Isse koi bhi browser ka code kholkar khud ko
"paid" mark nahi kar sakta — jo is tarah ke app mein sabse common security
bug hota hai.

```
Browser (React)  ->  Appwrite Function (create-razorpay-order)  ->  Razorpay
Browser (React)  <-  Razorpay Checkout popup  <-  user pays
Browser (React)  ->  Appwrite Function (verify-razorpay-payment)  -> checks signature -> marks paid -> applies effect
Browser (React)  ->  Appwrite Function (get-labourer-contact)  -> checks "paid" record -> returns phone/address
```

## Tech Stack

- **Frontend**: React 19 + Vite + React Router + Tailwind CSS v4
- **Backend**: Appwrite (Database, Auth, Storage, Functions, Teams) — free tier par chalega
- **Payments**: Razorpay Checkout + Appwrite Functions (Node.js)

---

## Setup — Step by Step

### 1. Appwrite project

1. [Appwrite Cloud](https://cloud.appwrite.io) par account banao (free), ya apna self-hosted instance use karo.
2. Naya **Project** banao, uski **Project ID** aur **API Endpoint** copy karo.
3. Project **Settings -> API Keys** mein ek naya server API key banao, in scopes ke saath:
   `databases.write`, `collections.write`, `attributes.write`, `indexes.write`,
   `documents.write`, `buckets.write`, `teams.write`, `functions.write`.
4. **Auth -> Settings** mein Email/Password login enable karo (default enabled hota hai).

### 2. Environment variables

```bash
cp .env.example .env
```
`.env` file kholkar `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`, aur
`APPWRITE_API_KEY` bhar do (jo step 1 mein banaya).

### 3. Database schema auto-create karo

```bash
npm install
npm run setup:appwrite
```

Ye script khud database, 5 collections, unke attributes/indexes, ek storage
bucket, "admins" team, aur 10 starter categories bana dega. Dobara chalane
se kuch duplicate nahi banega — jo already hai use skip kar dega.

### 4. Teeno Appwrite Functions deploy karo

Har function `functions/<name>/` folder mein hai. Har ek ke liye Appwrite
console mein (**Functions -> Create Function**):

- Runtime: **Node.js 18+**
- Entrypoint: `src/main.js`
- Folder upload karo ya Appwrite CLI se deploy karo:
  ```bash
  appwrite deploy function
  ```

Teeno functions mein ye environment variables set karo (Function Settings -> Variables):

| Variable | Value |
|---|---|
| `APPWRITE_API_KEY` | wahi server API key jo step 1 mein banaya |
| `DATABASE_ID` | `labourconnect` |
| `ADMIN_TEAM_ID` | `admins` |

Sirf `create-razorpay-order` aur `verify-razorpay-payment` ko ye extra chahiye:

| Variable | Value |
|---|---|
| `RAZORPAY_KEY_ID` | Razorpay dashboard se (Test ya Live) |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard se — **kabhi frontend mein mat daalna** |
| `PRICE_UNLOCK` | `19` |
| `PRICE_LISTING` | `99` |

Har Function ki **Execute Access** permission mein `users` role add karna na
bhoolein (Function Settings -> Permissions) — isi se logged-in client
Function ko call kar paate hain.

Deploy hone ke baad, Function ka naam `.env` ke `VITE_APPWRITE_FN_*` values
se match hona chahiye (default names already match).

### 5. Razorpay account

1. [Razorpay Dashboard](https://dashboard.razorpay.com) par signup karo.
2. Settings -> API Keys se Key ID + Key Secret generate karo.
3. Key ID `.env` ke `VITE_RAZORPAY_KEY_ID` mein daalo, Key Secret sirf
   Functions ke environment variables mein (upar dekha).
4. Test mode mein test card `4111 1111 1111 1111` se payment test kar sakte ho.

### 6. App chalao

```bash
npm run dev
```

### 7. Apna admin banayein

1. App khol kar normal signup karo.
2. Appwrite Console -> Auth -> us user ko copy karo, ya seedha
   **Teams -> admins -> Add Member** se apna email daal kar add karo,
   membership ko "confirmed" karo.
3. Ab login karne par Navbar mein **Admin** button dikhega, `/admin` khul jayega.

---

## Folder Structure

```
src/
  lib/           Appwrite client + saare constants (pricing, collection IDs)
  context/       AuthContext -- login state, admin check
  services/      Har collection ke liye ek service file (CRUD + business logic)
  components/    Reusable UI (Navbar, LabourCard, Loader, etc.)
  pages/         Har route ka page, pages/admin/ mein poora admin panel
functions/
  create-razorpay-order/    Razorpay order banata hai (amount server decide karta hai)
  verify-razorpay-payment/  Signature verify karta hai, business effect apply karta hai
  get-labourer-contact/     Paid check ke baad hi phone/address deta hai
scripts/
  setup-appwrite.js         Poora backend schema ek command se banata hai
```

## Production Deploy

Frontend kisi bhi static host par ja sakta hai (Vercel, Netlify, Cloudflare
Pages): `npm run build` -> `dist/` folder upload karo, wahi `.env` variables
host ke environment settings mein daal do.

## Aage kya badhaya ja sakta hai

- SMS/WhatsApp OTP login (Appwrite phone auth se)
- Labourer ke liye Aadhar-based verification badge
- Reviews/rating system jab booking complete ho
- Push notifications naye booking requests ke liye
# labour
