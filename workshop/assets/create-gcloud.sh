echo "🔥 Creating GCP project and service account"

# -----------------------------
# ---- CHANGE THESE VALUES ----
export GCP_PROJECT_ID=telegram-bot-questions
export GCP_SERVICE_USER=telegram-bot-service-account
# ---- END CHANGE THESE VALUES ----
# ---------------------------------

# ---- DO NOT CHANGE THESE VALUES: ----

export GCP_MEMBER="${GCP_SERVICE_USER}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
OUTPUT_FILE=credentials.json
ENV_FILE=./.env

echo "💡 GCP_PROJECT_ID: $GCP_PROJECT_ID"
echo "💡 GCP_SERVICE_USER: $GCP_SERVICE_USER"
echo "💡 GCP_MEMBER: $GCP_MEMBER"

gcloud auth list
echo "✅ Logged in"

gcloud projects create $GCP_PROJECT_ID --name="Telegram Bot Questions" --set-as-default
echo "✅ Project created"

gcloud services enable sheets.googleapis.com --project=$GCP_PROJECT_ID
echo "✅ Sheets API enabled"

gcloud iam service-accounts create $GCP_SERVICE_USER --display-name="Bot Questions SA"
echo "✅ Service account created"

gcloud iam service-accounts keys create $OUTPUT_FILE --iam-account=$GCP_MEMBER
echo "✅ Service account key created"

ENCODED_KEY=$(cat $OUTPUT_FILE | base64)
echo "PLT_GCP_CREDENTIALS=${ENCODED_KEY}" >> $ENV_FILE
