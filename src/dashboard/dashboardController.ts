import type { Request, Response } from "express";
import { metrics } from "../monitoring/metrics";

export function dashboardController(
  _req: Request,
  res: Response,
): void {
  const data = metrics.getMetrics();

  const topServices = Object.entries(data.logs_by_service)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const servicesHtml =
    topServices.length > 0
      ? topServices
          .map(
            ([service, count]) => `
              <tr>
                <td>${escapeHtml(service)}</td>
                <td>${count}</td>
              </tr>
            `,
          )
          .join("")
      : `
          <tr>
            <td colspan="2">No logs received yet</td>
          </tr>
        `;

  res.type("html").send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="5">

  <title>Log Ingestion Dashboard</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 30px;
      font-family: Arial, sans-serif;
      background: #f4f4f5;
      color: #18181b;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 8px;
    }

    .subtitle {
      color: #71717a;
      margin-bottom: 30px;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(
        auto-fit,
        minmax(200px, 1fr)
      );
      gap: 20px;
      margin-bottom: 30px;
    }

    .card {
      background: white;
      padding: 24px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .card h2 {
      margin: 0 0 10px;
      font-size: 14px;
      color: #71717a;
      text-transform: uppercase;
    }

    .value {
      font-size: 32px;
      font-weight: bold;
    }

    .section {
      background: white;
      padding: 24px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      margin-bottom: 20px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e4e4e7;
    }

    th {
      color: #71717a;
    }

    .status {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 20px;
      background: #dcfce7;
      color: #166534;
      font-size: 13px;
      font-weight: bold;
    }

    .footer {
      color: #71717a;
      font-size: 13px;
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>

<body>
  <div class="container">

    <h1>Log Ingestion Dashboard</h1>

    <div class="subtitle">
      Real-time monitoring
      <span class="status">
        Auto-refresh: 5 seconds
      </span>
    </div>

    <div class="cards">

      <div class="card">
        <h2>Total Logs</h2>
        <div class="value">
          ${data.total_logs}
        </div>
      </div>

      <div class="card">
        <h2>Throughput</h2>
        <div class="value">
          ${data.throughput} logs/sec
        </div>
      </div>

      <div class="card">
        <h2>Error Rate</h2>
        <div class="value">
          ${data.error_rate}%
        </div>
      </div>

      <div class="card">
        <h2>Queue Backlog</h2>
        <div class="value">
          ${data.queue_backlog}
        </div>
      </div>

    </div>

    <div class="section">

      <h2>Top 5 Services</h2>

      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Logs</th>
          </tr>
        </thead>

        <tbody>
          ${servicesHtml}
        </tbody>
      </table>

    </div>

    <div class="section">

      <h2>Logs by Level</h2>

      <table>
        <thead>
          <tr>
            <th>Level</th>
            <th>Count</th>
          </tr>
        </thead>

        <tbody>
          ${
            Object.entries(data.logs_by_level)
              .map(
                ([level, count]) => `
                  <tr>
                    <td>${escapeHtml(level)}</td>
                    <td>${count}</td>
                  </tr>
                `,
              )
              .join("") ||
            `
              <tr>
                <td colspan="2">
                  No logs received yet
                </td>
              </tr>
            `
          }
        </tbody>
      </table>

    </div>

    <div class="footer">
      Last updated: ${new Date().toISOString()}
    </div>

  </div>
</body>
</html>
  `);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}