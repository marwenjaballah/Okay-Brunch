# n8n Automation Workflow

This workflow automates the post-purchase process by sending an email to the customer, adding the order to Google Sheets, and notifying the team via Slack.

## 🔧 Setup

1.  **Deploy n8n**: Ensure you have an n8n instance running.
2.  **Import Workflow**: Copy the JSON below and paste it into a new n8n workflow.
3.  **Configure Credentials**:
    *   **Gmail**: Connect your Google account.
    *   **Google Sheets**: Connect Google account and select your spreadsheet.
    *   **Slack**: Connect your Workspace.
4.  **Set Webhook URL**:
    *   Activate the workflow.
    *   Copy the **Production URL** of the webhook node.
    *   Add it to your `.env` file: `N8N_WEBHOOK_URL=your_webhook_url`

## � Google Cloud OAuth Setup Guide (Gmail & Sheets)

To allow n8n to send emails and edit sheets, you must set up an OAuth2 app in Google Cloud.

### 1. Create Project & Enable APIs
1.  Go to **[Google Cloud Console](https://console.cloud.google.com/)** and create a New Project (e.g., "n8n-automation").
2.  Go to **APIs & Services > Library**.
3.  Search for and **ENABLE** the following APIs:
    *   **Gmail API**
    *   **Google Sheets API**

### 2. Configure Consent Screen
1.  Go to **APIs & Services > OAuth consent screen**.
2.  Select **External** (unless you have a Google Workspace organization, then Internal is fine).
3.  **App Information**: Fill in App Name ("n8n") and User Support Email.
4.  **Developer Contact**: Enter your email.
5.  **Scopes**: Add `.../auth/gmail.send` and `.../auth/spreadsheets`.
6.  **Test Users**: Add your own Google email address (important for testing).

### 3. Create Credentials
1.  Go to **APIs & Services > Credentials**.
2.  Click **Create Credentials > OAuth client ID**.
3.  **Application Type**: Select **Web application**.
4.  **Name**: "n8n Webhook".
5.  **Authorized Redirect URIs**: 
    *   Go to your n8n instance -> Credentials -> Create New -> Google OAuth2 API.
    *   Copy the **OAuth Redirect URL** shown in n8n (usually `https://your-n8n-instance.com/rest/oauth2-credential/callback`).
    *   Paste it into the Google Cloud "Authorized redirect URIs" field.
6.  Click **Create**.
7.  Copy the **Client ID** and **Client Secret**.

### 4. Connect in n8n
1.  In n8n, create a new **Google OAuth2 API** credential.
2.  Paste the **Client ID** and **Client Secret**.
3.  Click **Connect my account**.
4.  Grant permission in the Google popup window.
5.  Use this single credential for both Gmail and Google Sheets nodes.

## �🛠️ Step-by-Step Node Configuration

### 1. Webhook Node (Trigger)
*   **Authentication**: Set to `None` (Since we proxy via our own secure API).
*   **HTTP Method**: `POST`.
*   **Path**: `webhook` (or any custom path you prefer).
*   **Test**: Click "Execute Node" and trigger a mock order from the app to verify data structure.

### 2. Gmail Node (Send Email)
*   **Credential**: Select "Connect with OAuth2". Follow the Google Cloud Console guide to create credentials (requires enabling Gmail API).
*   **Resource**: `Message`.
*   **Operation**: `Send`.
*   **To Email**: Click the generic 'Expression' tab (gears icon) -> Select `Expression`. Enter `{{ $json.body.user.email }}`.
*   **Subject**: `Order Confirmation - {{ $json.body.order_id }}`.
*   **Message**: Write your email template. Use expressions like `{{ $json.body.total }}` to insert dynamic data.

### 3. Google Sheets Node (Record Order)
*   **Credential**: "Connect with OAuth2". Ensure the Google Sheet is shared with the connected account (or use Service Account).
*   **Resource**: `Sheet`.
*   **Operation**: `Append`.
*   **Spreadsheet ID**: Open your target Google Sheet. Copy the long ID string from the URL between `/d/` and `/edit`. Paste it here.
*   **Range**: Leave empty to append to the end, or specify a sheet name like `Sheet1!A:A`.
*   **Data Mode**: `Define Below` (Map columns manually) or `Auto-Map Input Data` (if column headers match JSON keys).
    *   *Recommendation*: Use `Define Below` and map:
        *   `Date` -> `{{ $json.body.date }}`
        *   `Order ID` -> `{{ $json.body.order_id }}`
        *   `Customer` -> `{{ $json.body.user.email }}`
        *   `Total` -> `{{ $json.body.total }}`

### 4. Slack Node (Team Notification)
*   **Credential**: Create a Slack App, enable "Incoming Webhooks", and copy the token/URL. Or use OAuth.
*   **Resource**: `Message`.
*   **Operation**: `Post`.
*   **Channel**: Enter the channel name (e.g., `#orders`).
*   **Text/Block**: formatting. Use Slack markdown:
    ```
    💰 *New Order Received!*
    *Amount:* ${{ $json.body.total }}
    *Customer:* {{ $json.body.user.email }}
    *Items:* {{ $json.body.items.length }} items
    ```

## 📋 Workflow JSON

```json
{
  "name": "Okay Brunch Order Flow",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [
        250,
        300
      ],
      "id": "webhook-trigger",
      "name": "Order Webhook"
    },
    {
      "parameters": {
        "resource": "message",
        "subject": "Order Confirmation - Okay Brunch",
        "message": "=Hi there,\n\nThanks for your order at Okay Brunch!\n\nOrder ID: {{ $json.body.order_id }}\nTotal: ${{ $json.body.total }}\n\nWe are preparing it now!\n\nBest,\nOkay Brunch Team",
        "toEmail": "={{ $json.body.user.email }}"
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2,
      "position": [
        500,
        200
      ],
      "id": "gmail-node",
      "name": "Send Email"
    },
    {
      "parameters": {
        "operation": "append",
        "sheetId": "YOUR_SHEET_ID_HERE",
        "details": {
          "columns": [
            {
              "key": "Date",
              "value": "={{ $json.body.date }}"
            },
            {
              "key": "Order ID",
              "value": "={{ $json.body.order_id }}"
            },
            {
              "key": "Email",
              "value": "={{ $json.body.user.email }}"
            },
            {
              "key": "Total",
              "value": "={{ $json.body.total }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4,
      "position": [
        500,
        400
      ],
      "id": "google-sheets-node",
      "name": "Add to Sheets"
    },
    {
      "parameters": {
        "channel": "orders",
        "text": "=💰 *New Order Received!*\n\n*Amount:* ${{ $json.body.total }}\n*Customer:* {{ $json.body.user.email }}\n*Items:* {{ $json.body.items.length }} items"
      },
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2,
      "position": [
        500,
        600
      ],
      "id": "slack-node",
      "name": "Notify Slack"
    }
  ],
  "connections": {
    "Order Webhook": {
      "main": [
        [
          {
            "node": "Send Email",
            "type": "main",
            "index": 0
          },
          {
            "node": "Add to Sheets",
            "type": "main",
            "index": 0
          },
          {
            "node": "Notify Slack",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```
