# Nector Mini
Nector Mini — open-source code from Nector designed for developers to build and extend escrow-powered applications, with ready-to-use web and keeper bots

## Overview
Nector Mini is an open-source developer toolkit that enables anyone to build and extend escrow-powered applications on top of Nector.

It provides ready-to-use implementations for both web interfaces and Keeper bot, allowing developers to seamlessly embed escrow functionality into their own platforms, communities, or workflows.

Built on top of the Nector smart contract, Nector Mini abstracts complex escrow logic into simple, composable components — so developers can focus on building user experiences instead of reinventing trust systems.

## Core Features
### Easy Integration
- Plug-and-play escrow functionality
- Designed for rapid integration into existing apps
### Web Implementation
- Ready-to-use frontend components
- Built with modern frameworks (Next.js + TypeScript)
- Easily customizable UI
### Keeper Timeout Bot
- Trigger timeout
### Smart Contract Powered
- Built on top of Nector’s production smart contract
- Deterministic state machine ensures predictable behavior
### Built-in Escrow Logic
- Funding, shipping, review, dispute, and timeout flows included
- No need to implement escrow logic from scratch
### Trustless & Non-Custodial
- No centralized control over funds
- Fully enforced by on-chain logic
### Modular & Extensible
- Clean architecture for easy customization
- Extend or modify flows based on your use case
### Open Source & Transparent
- Fully auditable code
- Designed for developers who value transparency

## How it Works
https://nector.chat/docs/nector-mini

## Getting Started
```
# Clone project:
git clone https://github.com/p33mTheRealOne/nector-mini

cd nector-mini

# Install dependencies:
yarn
```

Create a project in https://supabase.com/
Run this in SQL Editor:
```
CREATE UNIQUE INDEX escrow_orders_one_active_nft_per_seller_mint
...
WHERE type = 'nft'
  AND nft_mint IS NOT NULL
  AND status = 'onchain_created';
```

Set Site URL in URL Configuration (Supabase):
```
https://localhost:3000
```

Add Redirect URLs in URL Configuration (Supabase):
```
https://localhost:3000/auth/callback
https://localhost:3000/auth/reset
```

## Create .env.local
```
# Create file:
touch .env.local

# Open .env.local
sudo nano .env.local
```

Put this in .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https:// Your supabase url
NEXT_PUBLIC_SUPABASE_ANON_KEY=// Your supabase anon key

SUPABASE_SERVICE_ROLE_KEY=// Your supabase service role key
```

Save file
```
# exit file
Ctrl + X

# Press y to save

# Press Enter
```

## Run
```
npm run dev
```
Go to:
http://localhost:3000

## Learn more:
https://nector.chat/docs
