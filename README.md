![image](https://github.com/qjrm1430/bitcoin-tracking-detecting-solution-web/assets/44336527/043c85c0-b019-4f44-a833-6cc53b7d2404)# BTDS (Bitcoin Tracking Detecting Solution)

범죄 수사 지원을 목적으로, 비트코인 거래 흐름을 자동으로 추적하고 시각화하는 솔루션

<aside>
💡 BTDS는 수사 기관을 위해 개발된 솔루션으로, 복잡한 비트코인 거래를 그래프 형태로 시각화하여 범죄 수사의 효율성을 높입니다. 이 솔루션은 자동 추적 기능을 통해 거래의 흐름을 빠르게 파악하고 분석할 수 있도록 설계되었습니다.
</aside>

<br/>
<br/>
<br/>

> Web-Server : [https://github.com/Bitcoin-Criminal-Investigation/bitcoin-tracking-detecting-solution-web](https://github.com/Bitcoin-Criminal-Investigation/bitcoin-tracking-detecting-solution-web)
>
> Core-Server : [https://github.com/Bitcoin-Criminal-Investigation/bitcoin-information-processing-server](https://github.com/Bitcoin-Criminal-Investigation/bitcoin-information-processing-server)

<br/>
![image](https://github.com/qjrm1430/bitcoin-tracking-detecting-solution-web/assets/44336527/15f5ab9e-ebf3-43c0-a143-1d30b2b7673d)
![image](https://github.com/qjrm1430/bitcoin-tracking-detecting-solution-web/assets/44336527/1999e9ac-b50b-42b4-9c78-44b53f0ee21c)
![image](https://github.com/qjrm1430/bitcoin-tracking-detecting-solution-web/assets/44336527/1429ef0b-aa4b-4ba2-afbb-55a6897496cc)

---
# bitcoin-tracking-detecting-solution-web

## Getting Started

First, set up Core Server

[https://github.com/Bitcoin-Criminal-Investigation/bitcoin-information-processing-server](https://github.com/Bitcoin-Criminal-Investigation/bitcoin-information-processing-server)

Second, set `.env.local` file

```bash
# MongoDB
MONGODB_URI="mongodb://your-mongodb-server/btds?retryWrites=true"
MONGODB_ID="mongodb_id"
MONGODB_PW="mongodb_password"

# Bitcoin Core RPC
RPC_URI="http://your-bitcoin-core-rpc-server:8332"
RPC_USERNAME="rpc_username"
RPC_PASSWORD=rpc_password

# Neo4j
NEO4J_URI="neo4j://your-neo4j-server:7687"
NEO4J_USERNAME="neo4j_id"
NEO4J_PASSWORD="neo4j_password"

# Core Server
CORE_SERVER="http://core-server:port"
```

run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
