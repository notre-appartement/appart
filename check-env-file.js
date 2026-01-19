// Script pour vérifier le contenu du fichier .env.local
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Vérification du fichier .env.local\n');

const envPath = path.join(__dirname, '.env.local');

// 1. Vérifier si le fichier existe
if (!fs.existsSync(envPath)) {
  console.log('❌ ERREUR : Le fichier .env.local n\'existe pas !');
  console.log('\n📝 Actions à faire :');
  console.log('1. Créez un fichier nommé exactement ".env.local" (avec le point au début)');
  console.log('2. Placez-le à la racine du projet (à côté de package.json)');
  console.log('3. Remplissez-le avec vos valeurs Firebase\n');
  process.exit(1);
}

console.log('✅ Le fichier .env.local existe !\n');

// 2. Lire le contenu
let content;
try {
  content = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.log('❌ ERREUR : Impossible de lire le fichier .env.local');
  console.log(err.message);
  process.exit(1);
}

// 3. Vérifier si le fichier est vide
if (!content || content.trim().length === 0) {
  console.log('❌ ERREUR : Le fichier .env.local est vide !');
  console.log('\n📝 Vous devez le remplir avec vos valeurs Firebase\n');
  process.exit(1);
}

console.log('📄 Contenu du fichier détecté !\n');

// 4. Analyser les lignes
const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
const vars = {};

lines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim();
    vars[key.trim()] = value;
  }
});

// 5. Vérifier chaque variable requise
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

let hasError = false;
let hasPlaceholder = false;

requiredVars.forEach(varName => {
  const value = vars[varName];

  if (!value) {
    console.log(`❌ ${varName}: MANQUANT`);
    hasError = true;
  } else if (
    value.includes('votre') ||
    value.includes('your') ||
    value.includes('COLLEZ') ||
    value.includes('VOTRE')
  ) {
    console.log(`⚠️  ${varName}: Contient encore un placeholder`);
    console.log(`   Valeur actuelle: "${value}"`);
    hasPlaceholder = true;
  } else {
    // Vérifier les guillemets
    if (value.startsWith('"') || value.startsWith("'")) {
      console.log(`⚠️  ${varName}: Contient des guillemets (à enlever !)`);
      console.log(`   Valeur: ${value.substring(0, 30)}...`);
      hasError = true;
    } else {
      const masked = value.substring(0, 15) + '...';
      console.log(`✅ ${varName}: ${masked} (${value.length} car.)`);
    }
  }
});

console.log('\n' + '─'.repeat(60) + '\n');

if (hasError) {
  console.log('❌ PROBLÈMES DÉTECTÉS dans votre fichier .env.local\n');
  console.log('Ouvrez le fichier .env.local et vérifiez :');
  console.log('1. Toutes les variables sont présentes');
  console.log('2. Pas de guillemets autour des valeurs');
  console.log('3. Format : VARIABLE=valeur (sans espaces autour du =)\n');
} else if (hasPlaceholder) {
  console.log('⚠️  PLACEHOLDERS DÉTECTÉS\n');
  console.log('Vous devez remplacer les valeurs par défaut par vos VRAIES valeurs Firebase !');
  console.log('\n📍 Comment obtenir ces valeurs :');
  console.log('1. Allez sur https://console.firebase.google.com');
  console.log('2. Sélectionnez votre projet');
  console.log('3. Cliquez sur ⚙️ > Paramètres du projet');
  console.log('4. Section "Vos applications" > Icône Web </>')
  console.log('5. Copiez les valeurs du firebaseConfig\n');
} else {
  console.log('✅ TOUT EST CORRECT !\n');
  console.log('🎉 Votre fichier .env.local est bien configuré !');
  console.log('\n📝 Prochaines étapes :');
  console.log('1. Si le serveur tourne : Arrêtez-le (Ctrl+C)');
  console.log('2. Relancez : npm run dev');
  console.log('3. Ouvrez http://localhost:3000\n');
}

// 6. Afficher un exemple de format correct
if (hasError || hasPlaceholder) {
  console.log('\n📋 EXEMPLE de .env.local correct (vos vraies valeurs) :\n');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDXbVz6aS9YbR8eP7qTm3nK4xJ2fG1hCw');
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mon-projet-12345.firebaseapp.com');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID=mon-projet-12345');
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mon-projet-12345.appspot.com');
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012');
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456\n');
  console.log('⚠️  Pas de guillemets, pas d\'espaces !\n');
}
