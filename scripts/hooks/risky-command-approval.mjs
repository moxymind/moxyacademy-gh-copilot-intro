const ASK_PATTERNS = [
  /(^|\s)git\s+push(\s|$)/,
  /(^|\s)npm\s+(install|i)(\s|$)/,
  /(^|\s)pnpm\s+(add|install)(\s|$)/,
  /(^|\s)yarn\s+(add|install)(\s|$)/
];

const DENY_PATTERNS = [
  /rm\s+-rf\s+\/?/,
  /git\s+push\s+--force(\s|$)/,
  /drop\s+table/i,
  /(^|\s)git\s+commit\s+--no-verify(\s|$)/,
];

async function readStdin() {
  let input = '';

  for await (const chunk of process.stdin) {
    input += chunk;
  }

  return input;
}

async function readPayload() {
  try {
    const input = await readStdin();
    return JSON.parse(input || '{}');
  } catch {
    return {};
  }
}

function output(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function getCommandText(toolInput) {
  if (!toolInput || typeof toolInput !== 'object') {
    return '';
  }

  if (typeof toolInput.command === 'string') {
    return toolInput.command;
  }

  if (Array.isArray(toolInput.args)) {
    return toolInput.args.join(' ');
  }

  return '';
}

const payload = await readPayload();
const toolName = payload.tool_name || '';

if (!/terminal|run/i.test(toolName)) {
  output({ continue: true });
  process.exit(0);
}

const commandText = getCommandText(payload.tool_input).trim();

if (!commandText) {
  output({ continue: true });
  process.exit(0);
}

if (DENY_PATTERNS.some((pattern) => pattern.test(commandText))) {
  output({
    continue: true,
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: 'Blocked by workshop policy: destructive command.',
      additionalContext: `The attempted command was: ${commandText}`
    }
  });
  process.exit(0);
}

if (ASK_PATTERNS.some((pattern) => pattern.test(commandText))) {
  output({
    continue: true,
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: 'Workshop policy requires approval for installs or pushes.',
      additionalContext: `The attempted command was: ${commandText}`
    }
  });
  process.exit(0);
}

output({ continue: true });