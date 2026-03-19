import form from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

export const options = {
  stages: [
    { duration: "30s", target: 5 }, // Ramp up to 5 users
    { duration: "1m30s", target: 5 }, // Stay at 5 users
    { duration: "20s", target: 10 }, // Ramp up to 10
    { duration: "1m30s", target: 10 }, // Stay at 10
    { duration: "20s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.1"],
    "custom_metric{type:get}": ["p(95)<300"],
  },
};

// Custom metrics
const loginDuration = new Trend("login_duration");
const taskCreationDuration = new Trend("task_creation_duration");
const errorRate = new Rate("errors");
const successCount = new Counter("success");

let authToken = "";
let userId = "";
let taskId = "";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000/api";

export function setup() {
  console.log("Setup: Creating test user...");

  const registerRes = form.post(`${BASE_URL}/auth/register`, {
    email: `perf-test-${Date.now()}@mitsgwl.ac.in`,
    password: "PerfTest123!",
    username: `perftest${Date.now()}`,
  });

  return {
    email: `perf-test-${Date.now()}@mitsgwl.ac.in`,
    password: "PerfTest123!",
  };
}

export default function (data) {
  group("Authentication Flow", () => {
    const loginStart = new Date();
    const loginRes = form.post(`${BASE_URL}/auth/login`, {
      email: data.email,
      password: data.password,
    });

    loginDuration.add(new Date() - loginStart);

    check(loginRes, {
      "login status is 200": (r) => r.status === 200,
      "login returns token": (r) => r.json("data.token") !== undefined,
    }) || errorRate.add(1);

    if (loginRes.status === 200) {
      authToken = loginRes.json("data.token");
      userId = loginRes.json("data.userId");
      successCount.add(1);
    }

    sleep(1);
  });

  group("Task Operations", () => {
    // Get tasks
    const getTasksRes = form.get(`${BASE_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    check(getTasksRes, {
      "get tasks status is 200": (r) => r.status === 200,
      "get tasks returns array": (r) => r.json("data") !== undefined,
    }) || errorRate.add(1);

    sleep(1);

    // Create task
    const taskStart = new Date();
    const createTaskRes = form.post(
      `${BASE_URL}/tasks`,
      {
        title: `Performance Test Task ${Date.now()}`,
        description: "A task for load testing",
        skills: ["JavaScript", "Testing"],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    taskCreationDuration.add(new Date() - taskStart);

    check(createTaskRes, {
      "create task status is 201": (r) => r.status === 201,
      "create task returns id": (r) => r.json("data.id") !== undefined,
    }) || errorRate.add(1);

    if (createTaskRes.status === 201) {
      taskId = createTaskRes.json("data.id");
      successCount.add(1);
    }

    sleep(1);
  });

  group("Chat Operations", () => {
    // Simulate multiple chat messages
    for (let i = 0; i < 5; i++) {
      const chatRes = form.post(
        `${BASE_URL}/chat/task/${taskId}`,
        {
          message: `Performance test message ${i} at ${new Date()}`,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      check(chatRes, {
        "chat message status is 200 or 201": (r) =>
          r.status === 200 || r.status === 201,
      }) || errorRate.add(1);

      sleep(0.5);
    }
  });

  group("Profile Operations", () => {
    const profileRes = form.get(`${BASE_URL}/users/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    check(profileRes, {
      "get profile status is 200": (r) => r.status === 200,
      "profile has name": (r) => r.json("data.username") !== undefined,
    }) || errorRate.add(1);

    sleep(1);
  });

  sleep(1);
}

export function teardown(data) {
  console.log("Teardown: Cleaning up test data...");
  // In real scenario, would delete created test data
}

export function handleSummary(data) {
  return {
    console: null,
    "summary.json": JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
