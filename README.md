# Itinerário Virtual

Uma aplicação web para compartilhar localização em tempo real durante uma viagem.

## Funcionalidades

- Mapa com pontos do itinerário (Sé da Guarda, Castelo de Ciudad Rodrigo, Plaza Mayor de Salamanca)
- Compartilhamento de localização em tempo real usando Firebase Realtime Database
- Controle de bateria: atualizações a cada 30 segundos
- Privacidade: salas separadas por ID para grupos

## Configuração

1. Instale Node.js e npm (versão 18+ recomendada).

2. Clone o repositório e instale dependências:
   ```
   npm install
   ```

3. Configure o Firebase:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
   - Ative o Realtime Database.
   - Copie a configuração do SDK para `src/firebase.ts`, substituindo os placeholders.

4. Para desenvolvimento:
   ```
   npm run dev
   ```

5. Para produção, construa e hospede em um serviço com HTTPS (GitHub Pages, Netlify, Vercel):
   ```
   npm run build
   ```

## Uso

- Abra o site no navegador (HTTPS necessário para GPS).
- Insira um ID da Sala (ex: viagem2024) e seu Nome.
- Clique em "Começar a Compartilhar Localização".
- No mobile, permita acesso ao GPS.
- Visualize as localizações dos amigos no mapa em tempo real.
- Clique em "Parar de Compartilhar" para parar.

## Desafios Considerados

- **Segurança (HTTPS)**: O navegador só permite acesso ao GPS em sites seguros. Use hospedagem com certificado SSL.
- **Bateria**: O GPS consome bateria; a app envia atualizações apenas a cada 30 segundos.
- **Privacidade**: Cada grupo usa um ID de sala único para compartilhar apenas entre si.

## Tecnologias

- Vite + TypeScript
- Leaflet para mapas
- Firebase Realtime Database
- Geolocation API