import { spawn } from "node:child_process";

const url = "http://localhost:3000";

async function serverIsUp() {
  try {
    await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(3000),
    });
    return true;
  } catch {
    return false;
  }
}

const alreadyUp = await serverIsUp();
const child = alreadyUp
  ? spawn("npm", ["run", "cypress:run"], { stdio: "inherit" })
  : spawn(
      "npx",
      ["start-server-and-test", "dev", url, "cypress:run"],
      { stdio: "inherit" },
    );

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
