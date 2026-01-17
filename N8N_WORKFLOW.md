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
