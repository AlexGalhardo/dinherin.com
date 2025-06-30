<h1 align="center"><a href="https://dinherin.com" target="_blank">dinherin.com</a></h1>

![Landing Page](https://dinherin.com/assets/landing-page.gif)

## Introduction

- A simple personal expenses finances tracker Micro-SaaS, using technologies like:
  - Bun
  - NextJS v15 App Router
  - React-Query
  - Stripe
  - Prisma ORM
  - Docker
  - PostgreSQL
  - TailwindCSS
  - Shadcn-UI
  - React-Email & Resend
  - Zod
  - BiomeJS

## Prerequisites

- Install Bun: <https://bun.sh/>
- Install Docker & Docker-compose: <https://docs.docker.com/engine/install/>
- Get your `RESEND_API_KEY`: <https://resend.com/>
- Get your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: <https://console.cloud.google.com/apis/credentials>
- Get your Stripe envs: <https://dashboard.stripe.com/test/apikeys>
- Get your `GOOGLE_ANALYTICS_MEASUREMENT_ID`: <https://analytics.google.com>
- Get your `MICROSOFT_CLARITY_ID`: <https://clarity.microsoft.com/>
- Use Ngrok to test webhooks requests locally: <https://ngrok.com/>
  - `ngrok http 3000`
  - Save the webhook URL in Stripe Webhook Developers Dashboard: `<your_ngrok_dns>/api/webhook/stripe/checkout`
- To test /dashboard route without an active stripe subscription, set `NEXT_PUBLIC_TEST_MODE=true`

## Local Development Setup

1. Clone repository

```bash
git clone git@github.com:AlexGalhardo/dinherin.com.git
```

2. Enter repository

```bash
cd dinherin.com/
```

3. Install dependencies

```bash
bun install
```

4. Setup your environment variables

```bash
cp .env.example .env
```

5. Up Docker PostgreSQL & Up Local Server

```bash
sudo chmod +x setup.sh && ./setup.sh
```

## Testing Sandbox Stripe Checkout

- Card Number: `4242 4242 4242 4242`
- Valid Date Card: any in the future
- CVC: any
- Cardholder Name: any

## Prisma Studio (DataBase GUI)

- To Start Prisma Studio:

```bash
bun run prisma:studio
```

## Build

a. Creating build

```bash
bun run build
```

b. Testing build server locally

```bash
bun run start
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) June 2025-present, [Alex Galhardo](https://github.com/AlexGalhardo)
