# Pocket Pulse

**Il battito del tuo iPhone** – un’app completamente gratuita che trasforma i sensori di movimento del telefono in un’esperienza di biofeedback visivo e aptico.

## Cosa fa ora (v1.1)
- Legge l’accelerometro in tempo reale
- Visualizza l’intensità del movimento come un cerchio che “batte”
- Genera feedback aptico (vibrazione) ad ogni picco di movimento
- **Salva automaticamente ogni sessione** (data, durata, numero di picchi)
- Cronologia delle ultime 50 sessioni, tutto in locale
- Possibilità di cancellare la cronologia

Tutto localmente, zero account, zero costi, zero pubblicità.

## Come provarlo SUBITO sul tuo iPhone 16e (senza computer)

### Metodo più semplice – Expo Snack
1. Apri Safari sul tuo iPhone e vai su: **https://snack.expo.dev**
2. Tocca “Create a new Snack”
3. Nella tab **Code** cancella tutto e incolla il contenuto del file `App.js` di questo repository
4. Nella tab **Dependencies** aggiungi:
   - `expo-sensors`
   - `expo-haptics`
   - `@react-native-async-storage/async-storage`
5. Tocca il pulsante **“My Device”** o scansiona il QR code con l’app **Expo Go** (gratuita sull’App Store)
6. Premi “Avvia Pulse”, muovi il telefono, poi “Ferma e Salva”
7. Tocca “Cronologia” per vedere le sessioni salvate

## Note tecniche
- Scritto in React Native + Expo
- Usa solo librerie gratuite di Expo e AsyncStorage
- I dati restano **solo sul dispositivo** (AsyncStorage)
- Nessuna connessione a server esterni

## Changelog
- **v1.1** – Aggiunto salvataggio sessioni + schermata Cronologia
- **v1.0** – Prima versione con accelerometro e haptic feedback

Creato per te – zero costi, solo divertimento e apprendimento.
