# Pocket Pulse

**Il battito del tuo iPhone** – un’app completamente gratuita che trasforma i sensori di movimento del telefono in un’esperienza di biofeedback visivo e aptico.

## Cosa fa
- Legge l’accelerometro in tempo reale
- Visualizza l’intensità del movimento come un cerchio che “batte”
- Genera feedback aptico (vibrazione) ad ogni picco di movimento
- Conta i picchi rilevati durante la sessione

Tutto localmente, zero account, zero costi, zero pubblicità.

## Come provarlo SUBITO sul tuo iPhone 16e (senza computer)

### Metodo più semplice – Expo Snack (consigliato)
1. Apri Safari sul tuo iPhone e vai su: **https://snack.expo.dev**
2. Tocca “Create a new Snack”
3. Nella tab **Code** cancella tutto e incolla il contenuto del file `App.js` di questo repository
4. Nella tab **Dependencies** aggiungi:
   - `expo-sensors`
   - `expo-haptics`
5. Tocca il pulsante **“My Device”** o scansiona il QR code che appare con l’app **Expo Go** (gratuita sull’App Store)
6. Premi “Avvia Pulse” e muovi leggermente il telefono

### Alternativa – da GitHub
1. Installa **Expo Go** dall’App Store (gratuita)
2. Apri questo repository su GitHub dal telefono
3. Usa un servizio gratuito come **Expo Snack → Import from GitHub** (cerca “Import GitHub” in Snack)

## Requisiti
- iPhone (testato concettualmente su iPhone 16e)
- App **Expo Go** (gratuita)
- Niente Mac, niente Xcode, niente soldi

## Note tecniche
- Scritto in React Native + Expo
- Usa solo API gratuite di Expo (`expo-sensors` e `expo-haptics`)
- Nessuna connessione a server esterni
- Privacy totale: i dati dei sensori restano sul dispositivo

## Prossimi miglioramenti possibili (sempre free)
- Modalità “respirazione guidata” con inclinazione del telefono
- Salvataggio delle sessioni in AsyncStorage
- Tema chiaro/scuro
- Stima approssimativa del battito cardiaco tramite fotocamera (più avanzato)

Creato per te – zero costi, solo divertimento e apprendimento.
