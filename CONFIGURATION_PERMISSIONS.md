# Configuration des permissions publiques pour importAppartement

## Problème
La Cloud Function retourne une erreur 403 car elle n'est pas accessible publiquement, même si `invoker: "public"` est configuré dans le code.

## Solution : Configurer les permissions IAM via la console

### Option 1 : Via Google Cloud Console (Recommandé)

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez le projet **notre-appart**
3. Dans le menu de navigation, allez dans **Cloud Run** (ou cherchez "Cloud Run" dans la barre de recherche)
4. Trouvez le service **importappartement** dans la liste
5. Cliquez sur le nom du service pour ouvrir les détails
6. Allez dans l'onglet **PERMISSIONS** (ou **IAM & Admin**)
7. Cliquez sur **ADD PRINCIPAL** (ou **AJOUTER UN PRINCIPAL**)
8. Dans **New principals**, entrez : `allUsers`
9. Dans **Select a role**, choisissez : **Cloud Run Invoker** (`roles/run.invoker`)
10. Cliquez sur **SAVE** (ou **ENREGISTRER**)

### Option 2 : Via Firebase Console

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez le projet **notre-appart**
3. Allez dans **Functions** dans le menu de gauche
4. Cliquez sur la fonction **importAppartement**
5. Cliquez sur l'onglet **Permissions** ou utilisez le lien vers Cloud Run
6. Suivez les mêmes étapes que l'Option 1

### Option 3 : Via gcloud CLI (si installé)

Si vous avez installé Google Cloud SDK, exécutez :

```bash
gcloud run services add-iam-policy-binding importappartement \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --project=notre-appart
```

## Vérification

Après avoir configuré les permissions, testez à nouveau l'import. L'erreur 403 devrait disparaître.

**Note** : La fonction sera accessible publiquement, mais l'authentification reste gérée dans le code via :
- Le token Bearer (Firebase Auth)
- Le secret partagé `X-Import-Secret` (pour dev avec émulateur)
