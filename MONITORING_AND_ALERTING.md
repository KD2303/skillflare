# 📡 Monitoring, Alerting & Observability Setup

**Version:** 1.0  
**Status:** Production Ready  
**Last Updated:** March 19, 2026

---

## 🎯 Monitoring Overview

### Key Metrics to Track

#### Application Metrics

```
Request Metrics:
- Request rate (req/s)
- Success rate (% of 2xx responses)
- Error rate (% of 4xx, 5xx responses)
- Response time (p50, p95, p99)
- Status code distribution

Business Metrics:
- User registrations/day
- Active users
- Tasks posted/completed
- Revenue (if applicable)

System Metrics:
- CPU utilization (%)
- Memory usage (%)
- Disk space (%)
- Network I/O
- Database connections
- Cache hit rate
```

---

## 🔔 Critical Alerts Configuration

### Alert 1: High Error Rate

```yaml
Alert Name: API Error Rate Spike
Condition: error_rate > 1%
Duration: 5 minutes
Severity: CRITICAL
Action: Page on-call engineer, Slack notification
Recovery: Auto page if error_rate recovers to < 0.5%
```

**Implementation (Prometheus):**

```yaml
- alert: APIErrorRateHigh
  expr: (rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])) > 0.01
  for: 5m
  annotations:
    summary: "API error rate > 1%"
    description: "Current error rate: {{ $value | humanizePercentage }}"
```

### Alert 2: Slow Response Times

```yaml
Alert Name: API Response Time Degradation
Condition: p95 latency > 500ms OR p99 latency > 1s
Duration: 10 minutes
Severity: WARNING
Action: Log, alert if sustained
```

**Implementation (Prometheus):**

```yaml
- alert: APIResponseTimeHigh
  expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 1
  for: 10m
  annotations:
    summary: "API p99 latency > 1s"
    description: "Current p99: {{ $value }}s"
```

### Alert 3: Database Performance

```yaml
Alert Name: Database Query Slow
Condition: avg query time > 200ms
Duration: 5 minutes
Severity: WARNING
Action: Log, notify if sustained
```

### Alert 4: Memory Leak Detection

```yaml
Alert Name: Memory Usage Increasing
Condition: memory_usage growth > 5% over 1 hour
Duration: 1 hour
Severity: WARNING
Action: Alert SRE, consider restart
```

### Alert 5: Service Unavailability

```yaml
Alert Name: Health Check Failure
Condition: Health check failing
Duration: 1 minute (immediate)
Severity: CRITICAL
Action: Page engineer, attempt auto-recovery
```

---

## 📊 Monitoring Tools Setup

### 1️⃣ Application Performance Monitoring (APM)

#### Datadog / New Relic / AppDynamics

```javascript
// Installation in backend
npm install --save-dev datadog-browser-rum

// Initialization
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: 'YOUR_APP_ID',
  clientToken: 'YOUR_CLIENT_TOKEN',
  site: 'datadoghq.com',
  service: 'skillflare-frontend',
  env: 'production',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
});

datadogRum.startSessionReplayRecording();
```

#### Prometheus + Grafana

```yaml
# prometheus.yml configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "skillflare-api"
    static_configs:
      - targets: ["localhost:5000"]
        labels:
          service: api
          env: production

  - job_name: "skillflare-mongodb"
    static_configs:
      - targets: ["localhost:27017"]

  - job_name: "skillflare-redis"
    static_configs:
      - targets: ["localhost:6379"]
```

---

### 2️⃣ Error Tracking

#### Sentry Configuration

```javascript
// Installation
npm install --save @sentry/node

// Backend initialization
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Mongo(),
  ],
});

// Use as middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());

// Frontend initialization
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({ maskAllText: false }),
  ],
});
```

---

### 3️⃣ Logging Aggregation

#### ELK Stack (Elasticsearch, Logstash, Kibana)

```yaml
# fluent-bit configuration (lightweight log shipper)
[SERVICE]
    Flush        5
    Log_Level    info

[INPUT]
    Name              systemd
    Tag               host.*

[INPUT]
    Name              forward
    Listen            0.0.0.0
    Port              24224

[OUTPUT]
    Name            stdout
    Match           *

[OUTPUT]
    Name            es
    Match           app.*
    Host            elasticsearch
    Port            9200
    HTTP_User       elastic
    HTTP_Passwd     ${ELASTIC_PASSWORD}
    AWS_Auth        Off
    Retry_Limit     5
```

#### Splunk

```javascript
// Backend logging with winston
import winston from "winston";
import SplunkHEC from "winston-splunk-hec";

const logger = winston.createLogger({
  transports: [
    new SplunkHEC({
      token: process.env.SPLUNK_HEC_TOKEN,
      host: process.env.SPLUNK_HOST,
      port: 8088,
      path: "/services/collector",
      https: true,
      autoLoggingHttp: true,
    }),
  ],
});

// Log with context
logger.info("User login", {
  userId: user.id,
  email: user.email,
  timestamp: new Date(),
});
```

---

### 4️⃣ Distributed Tracing

#### Jaeger / Zipkin

```javascript
// OpenTelemetry setup for distributed tracing
import { initializeBasicTracer } from "@opentelemetry/tracer-auto";

initializeBasicTracer({
  serviceName: "skillflare-backend",
  samplingProbability: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
});

// Spans are automatically created for:
// - HTTP requests
// - Database queries
// - External API calls
```

---

## 📈 Dashboard Examples

### Grafana Dashboard Queries

#### Request Rate (Prometheus)

```
rate(http_requests_total[5m])
```

#### Error Rate (Prometheus)

```
(rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])) * 100
```

#### Response Time P99 (Prometheus)

```
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

#### Memory Usage (Prometheus)

```
process_resident_memory_bytes / 1024 / 1024
```

#### Database Query Performance (Prometheus)

```
histogram_quantile(0.99, rate(mongodb_op_duration_seconds_bucket[5m]))
```

---

## 🔍 Health Check Endpoints

```javascript
// /api/health - Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// /api/health/ready - Readiness check (dependencies)
app.get("/api/health/ready", async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    email: await checkEmailService(),
  };

  const allReady = Object.values(checks).every((c) => c === true);

  res.status(allReady ? 200 : 503).json({
    ready: allReady,
    checks,
  });
});

// /api/health/live - Liveness check (is server running)
app.get("/api/health/live", (req, res) => {
  res.json({ alive: true });
});
```

---

## 📊 Metrics Export

### Prometheus Metrics Endpoint

```javascript
import promClient from "prom-client";

// Create custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Middleware to track requests
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });

  next();
});

// Expose metrics
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

---

## 🔐 Security Monitoring

### Suspicious Activity Detection

```javascript
// Monitor for brute force attacks
const LoginAttempts = require("./models/LoginAttempt");

app.post("/api/auth/login", async (req, res) => {
  const { email } = req.body;

  // Check failed attempts
  const recentAttempts = await LoginAttempts.countDocuments({
    email,
    timestamp: { $gt: new Date(Date.now() - 15 * 60 * 1000) },
    success: false,
  });

  if (recentAttempts > 10) {
    // Block and alert
    logger.warn("Brute force detected", { email, attempts: recentAttempts });
    return res.status(429).json({ message: "Too many login attempts" });
  }

  // Continue with login...
});

// Monitor for privilege escalation
app.put("/api/users/:id/role", requireAuth, async (req, res) => {
  const { role } = req.body;

  if (role === "admin" && req.user.role !== "admin") {
    logger.error("Privilege escalation attempt", {
      userId: req.user.id,
      targetRole: role,
      actualRole: req.user.role,
    });
    return res.status(403).json({ message: "Unauthorized" });
  }

  // Continue...
});
```

---

## 📱 Uptime Monitoring

### UptimeRobot Configuration

```
Monitor Name: SkillFlare API
URL: https://api.skillflare.com/api/health
Check Interval: 5 minutes
Timeout: 30 seconds
HTTP Method: GET
Expected Status: 200
Send Email Alert: ops@skillflare.com
Sms Alert (P1 only): +1234567890
```

---

## 📞 Slack Integration

### Slack Webhooks

```javascript
import axios from "axios";

const sendToSlack = async (message, severity = "warning") => {
  const color = {
    info: "#36a64f",
    warning: "#ff9900",
    critical: "#ff0000",
  }[severity];

  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    attachments: [
      {
        color,
        title: "SkillFlare Alert",
        text: message,
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  });
};

// Use in alerts
Sentry.captureException(error);
await sendToSlack(`Error: ${error.message}`, "critical");
```

---

## 📊 Reporting

### Weekly Performance Report

```sql
-- Database performance
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  AVG(response_time) as avg_response,
  MAX(response_time) as max_response,
  COUNT(CASE WHEN status >= 500 THEN 1 END) as errors
FROM request_logs
WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY date
ORDER BY date DESC;
```

### Custom Dashboard

```json
{
  "widgets": [
    {
      "title": "Request Rate",
      "query": "rate(http_requests_total[5m])"
    },
    {
      "title": "Error Rate",
      "query": "(rate(http_requests_total{status=~'5..'}[5m]) / rate(http_requests_total[5m])) * 100"
    },
    {
      "title": "Active Users",
      "query": "count(active_sessions)"
    },
    {
      "title": "Database Query Time",
      "query": "histogram_quantile(0.99, rate(mongodb_query_duration_seconds_bucket[5m]))"
    },
    {
      "title": "Memory Usage",
      "query": "process_resident_memory_bytes / 1024 / 1024"
    }
  ]
}
```

---

## 🚨 Runbook Examples

### Incident: High Error Rate

**Detection:** Error rate > 1% for > 5 minutes

**Steps:**

1. Check Sentry for error type
2. Check logs for common pattern
3. Check database connectivity
4. Check external service status
5. If still failing, trigger rollback
6. Investigate root cause

**Rollback Command:**

```bash
kubectl rollout undo deployment/skillflare-api
```

---

### Incident: Database Performance Degradation

**Detection:** Slow query time > 500ms

**Steps:**

1. Connect to MongoDB
2. Check active connections
3. Check slow query log
4. Kill long-running queries
5. Rebuild indexes if needed
6. Check available disk space

**Commands:**

```bash
# Connect to MongoDB
mongo --host mongo.prod.local --authenticationDatabase admin -u admin -p

# Check indexes
db.tasks.getIndexes()

# Clear slow log
db.setProfilingLevel(0)

# Rebuild index
db.tasks.reIndex()
```

---

## ✅ Monitoring Checklist

- [ ] Prometheus scraping metrics
- [ ] Grafana dashboards created
- [ ] Sentry/error tracking active
- [ ] Slack webhooks configured
- [ ] Health check endpoints working
- [ ] UptimeRobot monitoring active
- [ ] Log aggregation (ELK/Splunk) working
- [ ] Alerts configured and tested
- [ ] On-call rotation scheduled
- [ ] Runbooks documented
- [ ] Escalation paths defined
- [ ] Dashboard shared with team
- [ ] Monitoring costs approved
- [ ] Data retention policies set

---

**For questions, contact: devops@skillflare.com**
